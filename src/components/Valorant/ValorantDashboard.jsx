// src/components/Valorant/ValorantDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ValorantDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState('latam');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Agregamos agentsBust para guardar los renders 3D (medio cuerpo)
  const [gameAssets, setGameAssets] = useState({ agents: {}, agentsBust: {}, maps: {} });
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  const API_BASE_URL = 'https://lol-dashboard-backend.onrender.com';

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const [agentsRes, mapsRes] = await Promise.all([
          axios.get('https://valorant-api.com/v1/agents?isPlayableCharacter=true'),
          axios.get('https://valorant-api.com/v1/maps')
        ]);

        const agentsData = {};
        const agentsBustData = {};
        agentsRes.data.data.forEach(agent => {
          agentsData[agent.displayName.toLowerCase()] = agent.displayIcon;
          // Guardamos el render de medio cuerpo para el efecto 3D
          agentsBustData[agent.displayName.toLowerCase()] = agent.bustPortrait || agent.displayIcon; 
        });

        const mapsData = {};
        mapsRes.data.data.forEach(map => {
          mapsData[map.displayName.toLowerCase()] = map.listViewIcon || map.splash;
        });

        mapsData['summit'] = mapsData['ascent'] || mapsData['icebox']; 
        mapsData['corrode'] = mapsData['fracture'];

        setGameAssets({ agents: agentsData, agentsBust: agentsBustData, maps: mapsData });
      } catch (err) {
        console.error('Error cargando los gráficos de Valorant:', err);
      }
    };
    fetchAssets();
  }, []);

  const getTimeAgo = (timestampSecs) => {
    if (!timestampSecs) return '';
    const now = new Date();
    const matchDate = new Date(timestampSecs * 1000);
    const diffMs = now - matchDate;
    
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Hace instantes';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    return `Hace ${Math.floor(diffDays / 7)} sem`;
  };

  const executeSearch = async (gameName, tagLine, searchRegion) => {
    setLoading(true);
    setError('');
    setStats(null);
    setExpandedMatchId(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/valorant/search/${searchRegion}/${gameName}/${tagLine}/`);
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se encontró el jugador o la API está ocupada.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.includes('#')) {
      setError('El formato debe ser Nombre#Tag (Ejemplo: Flex Homie 32#HOMIE)');
      return;
    }
    const [gameName, tagLine] = searchQuery.split('#');
    executeSearch(gameName, tagLine, region);
  };

  const handlePlayerClick = (playerName, playerTag) => {
    if(!playerName || !playerTag) return;
    setSearchQuery(`${playerName}#${playerTag}`);
    executeSearch(playerName, playerTag, region);
  };

  // --- CÁLCULOS DEL RESUMEN DE RENDIMIENTO ---
  let winrate = 0, avgKills = 0, avgDeaths = 0, avgAssists = 0;
  let mostPlayedAgent = 'Desconocido';
  let totalMatches = 0;
  let kdaRatioColor = 'text-slate-400';
  let avgKdaStr = '0.00';

  if (stats && stats.matches && stats.matches.length > 0) {
    totalMatches = stats.matches.length;
    let wins = 0, totalKills = 0, totalDeaths = 0, totalAssists = 0;
    const agentCount = {};

    stats.matches.forEach(m => {
      if (m.won) wins++;
      totalKills += m.kills;
      totalDeaths += m.deaths;
      totalAssists += m.assists;
      agentCount[m.agentName] = (agentCount[m.agentName] || 0) + 1;
    });

    winrate = Math.round((wins / totalMatches) * 100);
    avgKills = (totalKills / totalMatches).toFixed(1);
    avgDeaths = (totalDeaths / totalMatches).toFixed(1);
    avgAssists = (totalAssists / totalMatches).toFixed(1);
    
    avgKdaStr = totalDeaths === 0 ? 'Perfecto' : ((totalKills + totalAssists) / totalDeaths).toFixed(2);
    if (avgKdaStr >= 3 || avgKdaStr === 'Perfecto') kdaRatioColor = 'text-yellow-400';
    else if (avgKdaStr >= 2) kdaRatioColor = 'text-emerald-400';

    let maxCount = 0;
    for (const [agent, count] of Object.entries(agentCount)) {
      if (count > maxCount) { maxCount = count; mostPlayedAgent = agent; }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-slate-100 min-h-[80vh]">
      {!stats ? (
        <div className="w-full max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-semibold text-red-400 tracking-wide uppercase">
            <span>⚡</span> Plataforma de Análisis Valorant
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Valorant Analytics <span className="text-red-500">Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Consulta estadísticas en tiempo real, agentes y rendimiento avanzado de cualquier jugador.
          </p>

          <form onSubmit={handleSearch} className="mt-8 relative max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center bg-slate-900 border border-slate-700 rounded-lg p-1.5 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all shadow-xl">
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full sm:w-auto bg-transparent text-white px-4 py-3 sm:py-2 outline-none border-b sm:border-b-0 sm:border-r border-slate-700 text-sm font-semibold cursor-pointer">
                <option className="bg-slate-900 text-white" value="latam">LATAM</option>
                <option className="bg-slate-900 text-white" value="na">NA</option>
                <option className="bg-slate-900 text-white" value="eu">EU</option>
                <option className="bg-slate-900 text-white" value="br">BR</option>
              </select>
              <input type="text" placeholder="Nombre de Jugador#TAG" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent text-white px-4 py-3 sm:py-2 outline-none text-sm placeholder-slate-500" required />
              <button type="submit" disabled={loading} className="w-full sm:w-auto mt-2 sm:mt-0 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-8 py-3 sm:py-2.5 rounded-md text-sm transition-colors cursor-pointer">
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </form>
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800 shadow-md">
            <button onClick={() => setStats(null)} className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors">
              ← Inicio
            </button>
            <form onSubmit={handleSearch} className="flex w-full sm:w-auto gap-2">
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-slate-800 text-white px-3 py-2 rounded text-sm outline-none border border-slate-700 cursor-pointer">
                <option value="latam">LATAM</option>
                <option value="na">NA</option>
                <option value="eu">EU</option>
                <option value="br">BR</option>
              </select>
              <input type="text" placeholder="Jugador#TAG" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-slate-800 text-white px-3 py-2 rounded text-sm outline-none border border-slate-700 w-full sm:w-48 placeholder-slate-500" required />
              <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                {loading ? '...' : 'Buscar'}
              </button>
            </form>
          </div>

          {/* ENCABEZADO DE PERFIL */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:justify-between shadow-lg relative overflow-hidden">
            {stats.profile.cardImage && (
              <div className="absolute inset-0 opacity-10 blur-xl pointer-events-none" style={{ backgroundImage: `url(${stats.profile.cardImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )}
            <div className="flex items-center gap-5 relative z-10">
              <div className="relative">
                {stats.profile.cardImage ? (
                  <img src={stats.profile.cardImage} alt="Player Card" className="w-20 h-20 rounded-xl border-2 border-slate-700 shadow-md object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-slate-800 rounded-xl border-2 border-slate-700 flex items-center justify-center"><span className="text-slate-500 text-xs">Sin Foto</span></div>
                )}
                <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 bg-slate-950 border border-slate-600 px-3 py-0.5 rounded-full text-[10px] font-bold text-white shadow-lg whitespace-nowrap">
                  LVL {stats.profile.level}
                </div>
              </div>
              <div className="text-center sm:text-left mt-2 sm:mt-0">
                <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider mb-1">Agente Autorizado</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-none drop-shadow-md">{stats.profile.gameName}</h3>
                <div className="text-slate-400 font-medium text-sm mt-1.5 flex items-center justify-center sm:justify-start gap-2">
                  <span>#{stats.profile.tagLine}</span>
                  <span className="text-slate-600">•</span> 
                  <span className="bg-slate-800 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-700">{stats.profile.region}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-800/40 px-5 py-3 rounded-xl border border-slate-700/50 mt-4 sm:mt-0 relative z-10 backdrop-blur-sm">
               {stats.profile.rankImage ? (
                 <img src={stats.profile.rankImage} alt="Rank" className="w-14 h-14 drop-shadow-lg" />
               ) : (
                 <div className="w-14 h-14 bg-slate-700/50 rounded-full flex items-center justify-center border border-slate-600"><span className="text-slate-400 text-[10px] font-bold">N/A</span></div>
               )}
               <div className="text-center sm:text-right">
                 <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Rango Actual</div>
                 <div className="text-white font-extrabold text-lg leading-tight mt-0.5">{stats.profile.rankName || 'Unranked'}</div>
               </div>
            </div>
          </div>

          {/* NUEVO: PANEL DE RENDIMIENTO */}
          {totalMatches > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl shadow-md flex justify-between items-center">
                 <div>
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Winrate ({totalMatches} Partidas)</div>
                    <div className={`text-3xl font-extrabold mt-1 ${winrate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {winrate}%
                    </div>
                 </div>
                 <div className="text-4xl opacity-80">{winrate >= 50 ? '📈' : '📉'}</div>
              </div>
              
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl shadow-md flex justify-between items-center">
                 <div>
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">KDA Promedio</div>
                    <div className="text-2xl font-extrabold text-white mt-1">
                      {avgKills} <span className="text-slate-600 font-normal">/</span> <span className="text-red-400">{avgDeaths}</span> <span className="text-slate-600 font-normal">/</span> {avgAssists}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">
                      Ratio: <span className={`${kdaRatioColor} font-bold`}>{avgKdaStr}</span>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl shadow-md flex justify-between items-center relative overflow-hidden">
                 {gameAssets.agentsBust[mostPlayedAgent.toLowerCase()] && (
                   <img 
                     src={gameAssets.agentsBust[mostPlayedAgent.toLowerCase()]} 
                     className="absolute -right-4 -bottom-6 w-32 h-32 object-contain opacity-40 grayscale"
                     alt="Agent Background"
                   />
                 )}
                 <div className="relative z-10">
                    <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Agente Principal</div>
                    <div className="text-2xl font-extrabold text-white mt-1">{mostPlayedAgent}</div>
                 </div>
              </div>
            </div>
          )}

          {/* HISTORIAL DE PARTIDAS CON RENDERS 3D */}
          <div>
            {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}
            <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-3">Últimas Partidas</h4>
            <div className="space-y-4">
              {stats.matches && stats.matches.length > 0 ? (
                stats.matches.map((match, index) => {
                  const isWon = match.won;
                  const isExpanded = expandedMatchId === match.matchId;
                  const borderColor = isWon ? 'border-emerald-500/50' : 'border-red-500/50';
                  const bgColor = isWon ? 'bg-emerald-900/40' : 'bg-red-900/40';
                  const textColor = isWon ? 'text-emerald-400' : 'text-red-400';

                  // Obtenemos los dos tipos de imágenes
                  const agentIcon = gameAssets.agents[match.agentName?.toLowerCase()];
                  const agentBust = gameAssets.agentsBust[match.agentName?.toLowerCase()];
                  const mapImg = gameAssets.maps[match.mapName?.toLowerCase()];

                  const kdaRatio = match.deaths === 0 ? 'Perfecto' : ((match.kills + match.assists) / match.deaths).toFixed(2);
                  let kdaColor = 'text-slate-400';
                  if (kdaRatio >= 3 || kdaRatio === 'Perfecto') kdaColor = 'text-yellow-400 font-bold';
                  else if (kdaRatio >= 2) kdaColor = 'text-emerald-400 font-bold';

                  const redTeam = match.allPlayers?.filter(p => p.team === 'Red') || [];
                  const blueTeam = match.allPlayers?.filter(p => p.team === 'Blue') || [];

                  const renderPlayerRow = (player) => (
                    <div key={player.puuid} onClick={(e) => { e.stopPropagation(); handlePlayerClick(player.name, player.tag); }} className="flex items-center justify-between p-2 hover:bg-slate-800/80 cursor-pointer rounded transition-colors group">
                      <div className="flex items-center gap-3">
                        {gameAssets.agents[player.agent?.toLowerCase()] ? (
                          <img src={gameAssets.agents[player.agent?.toLowerCase()]} className="w-8 h-8 rounded border border-slate-700 bg-slate-900" alt={player.agent} />
                        ) : (
                          <div className="w-8 h-8 rounded border border-slate-700 bg-slate-900" />
                        )}
                        <div className="text-sm">
                           <span className={`font-bold transition-colors ${player.name === stats.profile.gameName ? 'text-yellow-400' : 'text-slate-200 group-hover:text-white'}`}>{player.name}</span>
                           <span className="text-slate-500 text-[10px] ml-1">#{player.tag}</span>
                        </div>
                      </div>
                      <div className="text-xs font-mono text-slate-300">
                        {player.kills} / {player.deaths} / {player.assists}
                      </div>
                    </div>
                  );

                  return (
                    <div key={index} className="flex flex-col">
                      <div onClick={() => setExpandedMatchId(isExpanded ? null : match.matchId)} className={`relative overflow-hidden border ${borderColor} ${isExpanded ? 'rounded-t-lg border-b-0' : 'rounded-lg'} cursor-pointer transition-all shadow-md group`}>
                        {mapImg && (
                          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300" style={{ backgroundImage: `url(${mapImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        )}
                        <div className={`absolute inset-0 ${bgColor} opacity-80`}></div>

                        <div className="relative p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                          
                          {/* SECCIÓN DEL AGENTE CON EFECTO 3D */}
                          <div className="flex items-center gap-5 w-full sm:w-1/3">
                            <div className="relative w-16 h-16 flex-shrink-0">
                               {/* Base oscura para dar profundidad */}
                               <div className="absolute inset-x-0 bottom-0 h-10 bg-slate-950/60 rounded border border-slate-700/50 shadow-inner"></div>
                               
                               {/* Imagen sobresaliente (BustPortrait) */}
                               {agentBust ? (
                                 <img 
                                   src={agentBust} 
                                   className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[120%] h-[120%] object-contain drop-shadow-xl scale-125" 
                                   alt={match.agentName} 
                                 />
                               ) : (
                                 <img src={agentIcon} className="absolute inset-0 w-full h-full rounded object-cover" alt="Agent" />
                               )}
                            </div>

                            <div>
                              <div className="font-bold text-white text-lg drop-shadow-md">{match.agentName || 'Desconocido'}</div>
                              <div className="text-xs text-slate-300 mt-0.5 drop-shadow flex items-center gap-1.5 flex-wrap">
                                <span>Mapa: <span className="font-semibold text-white">{match.mapName}</span></span>
                                <span className="text-slate-500">•</span> 
                                <span>{match.gameMode}</span>
                                <span className="text-slate-500">•</span>
                                <span className="text-red-300 font-medium flex items-center gap-1">🕒 {getTimeAgo(match.gameStart)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-center w-full sm:w-1/3">
                            <div className={`font-extrabold uppercase tracking-widest text-xl drop-shadow-md ${textColor}`}>
                              {isWon ? 'VICTORIA' : 'DERROTA'}
                            </div>
                          </div>
                          
                          <div className="text-center sm:text-right w-full sm:w-1/3">
                            <div className="font-bold text-white text-lg tracking-wide drop-shadow-md">
                              {match.kills} <span className="text-slate-500 font-normal">/</span> <span className="text-red-400">{match.deaths}</span> <span className="text-slate-500 font-normal">/</span> {match.assists}
                            </div>
                            <div className="text-xs text-slate-300 drop-shadow mt-1">
                              KDA Ratio: <span className={`${kdaColor} ml-1`}>{kdaRatio}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={`bg-slate-900 border ${borderColor} border-t-0 rounded-b-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 shadow-inner relative z-20`}>
                           <div>
                             <h5 className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wider border-b border-slate-800 pb-1">Equipo Azul</h5>
                             <div className="space-y-1">{blueTeam.map(p => renderPlayerRow(p))}</div>
                           </div>
                           <div>
                             <h5 className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider border-b border-slate-800 pb-1">Equipo Rojo</h5>
                             <div className="space-y-1">{redTeam.map(p => renderPlayerRow(p))}</div>
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-900/40 border border-slate-800 rounded-lg text-sm">
                  No se encontraron partidas reales recientes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}