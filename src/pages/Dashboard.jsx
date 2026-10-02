// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import MatchCard from '../components/MatchCard';
import ChampionStats from '../components/ChampionStats';
import PlayerTags from '../components/PlayerTags';
import AuthModal from '../components/AuthModal';

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
      
      <div className="z-10 ml-2">
        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</div>
        <div className="text-xl font-bold text-white capitalize mt-0.5">
          {data.tier.toLowerCase()} {data.rank}
        </div>
        <div className="text-sm text-slate-300 mt-0.5">
          <span className="text-blue-400 font-semibold">{data.lp} LP</span>
          <span className="mx-2 text-slate-600">|</span>
          <span className="text-emerald-400">{data.wins}W</span> / <span className="text-red-400">{data.losses}L</span>
          <span className="text-slate-500 ml-2">({winrate}%)</span>
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
    
    fetch("https://ddragon.leagueoflegends.com/api/versions.json")
      .then(res => res.json())
      .then(versions => setPatchVersion(versions[0]))
      .catch(err => console.error("Error versión LoL:", err));

    const apiUrl = `http://127.0.0.1:8000/api/profile/${region}/${encodeURIComponent(summonerName)}/`;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-xl animate-pulse text-blue-400">Cargando perfil del invocador...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center flex-col gap-4">
        <div className="text-red-400 text-xl font-bold text-center max-w-lg">
          {error}
        </div>
        <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors mt-4 bg-slate-900 border border-slate-800 px-6 py-2 rounded-xl">
          Intentar con otro nombre
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 sm:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* BARRA SUPERIOR MODERNA Y ESTILIZADA */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-4 bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-xl">
          
          {/* Izquierda: Volver y Tarjeta de Usuario */}
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
            <Link to="/" className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm flex items-center gap-1">
              &larr; Volver
            </Link>

            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-700/80 px-3.5 py-1.5 rounded-xl shadow-md">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="flex flex-col text-xs">
                  <span className="text-slate-400">Hola, <strong className="text-white">{currentUser.username}</strong></span>
                  <button 
                    onClick={() => navigate(`/profile/${currentUser.region}/${encodeURIComponent(currentUser.riot_id)}`)}
                    className="text-blue-400 hover:text-blue-300 font-semibold text-left transition-colors"
                  >
                    ⚡ {currentUser.riot_id}
                  </button>
                </div>
                <button 
                  onClick={handleLogout}
                  className="ml-2 text-slate-500 hover:text-red-400 font-medium text-xs border-l border-slate-800 pl-2 transition-colors"
                >
                  Salir
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-slate-950 hover:bg-slate-800 text-blue-400 border border-slate-700 text-xs px-3.5 py-2 rounded-xl font-semibold transition-colors shadow-md"
              >
                Iniciar Sesión / Registrarse
              </button>
            )}
          </div>

          {/* Derecha: Buscador Rápido e Historial */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center justify-end">
            {recentSearches.length > 0 && (
              <div className="hidden xl:flex gap-1.5 items-center">
                <span className="text-[10px] text-slate-500">Recientes:</span>
                {recentSearches.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(`/profile/${s.region}/${encodeURIComponent(s.name)}`)}
                    className="bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 truncate max-w-[90px] transition-colors"
                    title={`${s.name} (${s.region})`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleInternalSearch} className="flex gap-2 w-full sm:w-auto">
              <select 
                value={searchRegion} 
                onChange={(e) => setSearchRegion(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="LAS">LAS</option>
                <option value="LAN">LAN</option>
                <option value="NA">NA</option>
                <option value="EUW">EUW</option>
                <option value="BR">BR</option>
              </select>
              
              <input 
                type="text" 
                placeholder="Buscar otro invocador..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-blue-500 w-full sm:w-48 placeholder:text-slate-600"
              />
              
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-md cursor-pointer">
                Buscar
              </button>
            </form>
          </div>
        </div>
        
        {/* CABECERA DEL JUGADOR */}
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 mb-6 flex items-center gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative shrink-0">
            <img 
              src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/profileicon/${playerData.profileIcon}.png`} 
              alt="Profile Icon" 
              className="w-24 h-24 rounded-2xl border-2 border-slate-700 shadow-lg object-cover"
              onError={(e) => { e.target.src = `https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/profileicon/1.png` }}
            />
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-xs font-bold px-3 py-0.5 rounded-full border border-slate-700 shadow-md">
              {playerData.summonerLevel}
            </span>
          </div>

          <div className="z-10">
            <h2 className="text-3xl font-black tracking-tight">{playerData.summoner}</h2>
            <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block border border-blue-500/20">
              Región: {playerData.region}
            </span>
            <p className="text-emerald-400 mt-2 text-xs font-medium">{playerData.message}</p>
          </div>
        </div>

        {/* SECCIÓN DE RANGOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <RankedBadge title="Ranked Solo/Duo" data={playerData.rankedSolo} />
          <RankedBadge title="Ranked Flex" data={playerData.rankedFlex} />
        </div>

        {/* ETIQUETAS DE JUGADOR */}
        <PlayerTags matches={playerData.matches} stats={playerData.stats} />

        {/* ESTADÍSTICAS GLOBALES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard title="Winrate (Últimas 10)" value={playerData.stats.winrate} isPositive={parseInt(playerData.stats.winrate) >= 50} />
          <StatCard title="KDA Promedio" value={playerData.stats.kda} isPositive={parseFloat(playerData.stats.kda) >= 3.0} />
          <StatCard title="Súbditos / Min" value={playerData.stats.csPerMin} />
        </div>

        {/* RENDIMIENTO POR CAMPEÓN */}
        <ChampionStats matches={playerData.matches} patchVersion={patchVersion} />

        {/* HISTORIAL DE PARTIDAS */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-slate-200">Últimas 10 Partidas</h3>
          <div className="flex flex-col gap-3">
            {playerData.matches && playerData.matches.map((match) => (
              <MatchCard key={match.id} match={match} patchVersion={patchVersion} currentRegion={region} />
            ))}
          </div>
        </div>
        
      </div>

      {/* MODAL DE LOGIN / REGISTRO */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={(userData) => setCurrentUser(userData)}
      />
    </div>
  );
}