// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MatchCard from '../components/MatchCard';
import ChampionStats from '../components/ChampionStats';
import PlayerTags from '../components/PlayerTags';
import AuthModal from '../components/AuthModal';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const RankedBadge = ({ title, data }) => {
  if (!data) return (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center h-full min-h-[100px]">
      <span className="text-slate-500 font-medium">{title}</span>
      <span className="text-slate-600 text-sm mt-1">Unranked</span>
    </div>
  );

  const winrate = Math.round((data.wins / (data.wins + data.losses)) * 100);
  
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-2 shadow-sm overflow-hidden relative">
      <div className="w-28 h-28 flex items-center justify-center shrink-0">
        <img 
          src={`https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${data.tier.toLowerCase()}.png`} 
          alt={data.tier} 
          className="w-full h-full object-contain scale-[2.2] drop-shadow-xl"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
      
      <div className="z-10 ml-2 flex-1">
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</div>
        <div className="text-xl font-bold text-white capitalize mt-0.5">
          {data.tier.toLowerCase()} {data.rank}
        </div>
        
        {/* BARRA DE PROGRESO DE LP */}
        <div className="mt-1.5 w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700">
           <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${data.lp}%` }}></div>
        </div>

        <div className="text-sm text-slate-300 mt-1 flex items-center justify-between">
          <span className="text-blue-400 font-semibold text-xs tracking-widest">{data.lp} / 100 LP</span>
          <span>
            <span className="text-emerald-400">{data.wins}W</span> / <span className="text-red-400">{data.losses}L</span> <span className="text-slate-500 text-[10px]">({winrate}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { region, summonerName } = useParams();
  const navigate = useNavigate();
  
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patchVersion, setPatchVersion] = useState("14.21.1"); 
  const [champDict, setChampDict] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [searchRegion, setSearchRegion] = useState(region || "LAS");
  
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    // Descargamos la versión y el diccionario para mapear IDs a Nombres Reales
    fetch("https://ddragon.leagueoflegends.com/api/versions.json")
      .then(res => res.json())
      .then(versions => {
        setPatchVersion(versions[0]);
        return fetch(`https://ddragon.leagueoflegends.com/cdn/${versions[0]}/data/es_MX/champion.json`);
      })
      .then(res => res.json())
      .then(data => {
        const dict = {};
        Object.values(data.data).forEach(champ => {
          dict[champ.key] = champ.id; 
        });
        setChampDict(dict);
      })
      .catch(err => console.error("Error versión LoL:", err));

    const apiUrl = `${API_URL}/api/profile/${region}/${encodeURIComponent(summonerName)}/`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
           return response.json().then(err => { 
             throw new Error(err.message || "Error desconocido conectando con el servidor");
           });
        }
        return response.json();
      })
      .then(data => {
        setPlayerData(data);
        setLoading(false);
        setError(null);
      })
      .catch(err => {
        console.error("Error en la petición:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [region, summonerName]);

  const handleInternalSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const cleanName = searchQuery.trim();
    const newSearch = { name: cleanName, region: searchRegion };
    const updated = [newSearch, ...recentSearches.filter(s => !(s.name.toLowerCase() === cleanName.toLowerCase() && s.region === searchRegion))].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
    navigate(`/profile/${searchRegion}/${encodeURIComponent(cleanName)}`);
    setSearchQuery("");
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center"><div className="text-xl animate-pulse text-blue-400">Cargando perfil del invocador...</div></div>;
  if (error) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-4"><div className="text-red-400 text-xl font-bold text-center max-w-lg">{error}</div><Link to="/" className="text-blue-400 hover:text-blue-300 mt-4 bg-slate-900 border border-slate-800 px-6 py-2 rounded-xl">Intentar con otro nombre</Link></div>;

  // --- CÁLCULOS TRUE MAIN & TRUE WINRATE ---
  let mostPlayedChamp = "Unknown";
  if (playerData.matches && playerData.matches.length > 0) {
    const champCounts = {};
    playerData.matches.forEach(m => champCounts[m.championName] = (champCounts[m.championName] || 0) + 1);
    mostPlayedChamp = Object.keys(champCounts).reduce((a, b) => champCounts[a] > champCounts[b] ? a : b);
  }
  
  const trueMainName = champDict[playerData.trueMainId] || mostPlayedChamp;

  let globalWinrate = parseInt(playerData.stats.winrate);
  let totalRankedGames = playerData.matches?.length || 0;
  if (playerData.rankedSolo) {
    const w = playerData.rankedSolo.wins;
    const l = playerData.rankedSolo.losses;
    totalRankedGames = w + l;
    globalWinrate = Math.round((w / totalRankedGames) * 100);
  }
  const kdaNum = parseFloat(playerData.stats.kda);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
            <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm flex items-center gap-1">&larr; Volver</Link>
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-700/80 px-3.5 py-1.5 rounded-xl shadow-md">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="flex flex-col text-xs">
                  <span className="text-slate-400">Hola, <strong className="text-white">{currentUser.username}</strong></span>
                  <button onClick={() => navigate(`/profile/${currentUser.region}/${encodeURIComponent(currentUser.riot_id)}`)} className="text-blue-400 hover:text-blue-300 font-semibold text-left transition-colors">⚡ {currentUser.riot_id}</button>
                </div>
                <button onClick={handleLogout} className="ml-2 text-slate-500 hover:text-red-400 font-medium text-xs border-l border-slate-800 pl-2 transition-colors">Salir</button>
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-700 text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors shadow-md">Iniciar Sesión</button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center justify-end">
            <form onSubmit={handleInternalSearch} className="flex gap-2 w-full sm:w-auto">
              <select value={searchRegion} onChange={(e) => setSearchRegion(e.target.value)} className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white outline-none cursor-pointer"><option value="LAS">LAS</option><option value="LAN">LAN</option><option value="NA">NA</option><option value="EUW">EUW</option></select>
              <input type="text" placeholder="Buscar invocador..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3.5 py-2 text-white outline-none w-full sm:w-48"/>
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer">Buscar</button>
            </form>
          </div>
        </div>
        
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 mb-6 flex items-center gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative shrink-0">
            <img src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/profileicon/${playerData.profileIcon}.png`} alt="Profile Icon" className="w-24 h-24 rounded-2xl border-2 border-slate-700 shadow-lg object-cover" onError={(e) => { e.target.src = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/profileicon/1.png` }}/>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-xs font-bold px-3 py-0.5 rounded-full border border-slate-700 shadow-md">{playerData.summonerLevel}</span>
          </div>
          <div className="z-10">
            <h2 className="text-3xl font-black tracking-tight">{playerData.summoner}</h2>
            <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block border border-blue-500/20">Región: {playerData.region}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <RankedBadge title="Ranked Solo/Duo" data={playerData.rankedSolo} />
          <RankedBadge title="Ranked Flex" data={playerData.rankedFlex} />
        </div>

        <PlayerTags matches={playerData.matches} stats={playerData.stats} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Winrate Global ({totalRankedGames} Partidas)</div>
              <div className={`text-3xl font-extrabold mt-1 ${globalWinrate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{globalWinrate}%</div>
            </div>
            <div className="text-4xl opacity-80">{globalWinrate >= 50 ? '📈' : '📉'}</div>
          </div>
          
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl shadow-md flex justify-between items-center">
            <div>
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Desempeño Reciente</div>
              <div className="text-2xl font-extrabold text-white mt-1">{playerData.stats.csPerMin} <span className="text-slate-500 text-sm font-medium">CS/Min</span></div>
              <div className="text-xs text-slate-400 mt-1 font-medium">KDA Ratio: <span className={`${kdaNum >= 3 ? 'text-yellow-400' : kdaNum >= 2 ? 'text-emerald-400' : 'text-slate-400'} font-bold`}>{playerData.stats.kda}</span></div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl shadow-md flex justify-between items-center relative overflow-hidden">
            {trueMainName !== 'Unknown' && (
              <img src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${trueMainName}_0.jpg`} className="absolute -right-16 -top-4 w-64 h-auto object-cover opacity-30 grayscale mix-blend-lighten" alt="Champion Background" onError={(e) => { e.target.style.display = 'none'; }}/>
            )}
            <div className="relative z-10">
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Main Real (Maestría)</div>
              <div className="text-2xl font-extrabold text-white mt-1">{trueMainName}</div>
            </div>
          </div>
        </div>

        <ChampionStats matches={playerData.matches} patchVersion={patchVersion} />

        <div>
          <h3 className="text-xl font-bold mb-4 text-slate-200">Últimas 10 Partidas</h3>
          <div className="flex flex-col gap-3">
            {playerData.matches && playerData.matches.map((match) => (
              <MatchCard key={match.id} match={match} patchVersion={patchVersion} currentRegion={region} />
            ))}
          </div>
        </div>
        
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={(userData) => setCurrentUser(userData)} />
    </div>
  );
}