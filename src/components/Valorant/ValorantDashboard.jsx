// src/components/Valorant/ValorantDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ValorantDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState('latam');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado para almacenar los retratos de agentes y fondos de mapas
  const [gameAssets, setGameAssets] = useState({ agents: {}, maps: {} });

  const API_BASE_URL = 'https://lol-dashboard-backend.onrender.com';

  // 1. Descargar recursos gráficos de Valorant al cargar la página
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const [agentsRes, mapsRes] = await Promise.all([
          axios.get('https://valorant-api.com/v1/agents?isPlayableCharacter=true'),
          axios.get('https://valorant-api.com/v1/maps')
        ]);

        const agentsData = {};
        agentsRes.data.data.forEach(agent => {
          agentsData[agent.displayName.toLowerCase()] = agent.displayIcon;
        });

        const mapsData = {};
        mapsRes.data.data.forEach(map => {
          // Usamos listViewIcon porque es panorámico y queda perfecto de fondo
          mapsData[map.displayName.toLowerCase()] = map.listViewIcon || map.splash;
        });

        // Mapeo de codenames internos comunes que a veces envía la API
        mapsData['summit'] = mapsData['ascent'] || mapsData['icebox']; 
        mapsData['corrode'] = mapsData['fracture'];

        setGameAssets({ agents: agentsData, maps: mapsData });
      } catch (err) {
        console.error('Error cargando los gráficos de Valorant:', err);
      }
    };
    fetchAssets();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setStats(null);

    if (!searchQuery.includes('#')) {
      setError('El formato debe ser Nombre#Tag (Ejemplo: Flex Homie 32#HOMIE)');
      return;
    }

    const [gameName, tagLine] = searchQuery.split('#');
    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/valorant/search/${region}/${gameName}/${tagLine}/`);
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'No se encontró el jugador o la API está ocupada.');
    } finally {
      setLoading(false);
    }
  };

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
              <select 
                value={region} 
                onChange={(e) => setRegion(e.target.value)}
                className="w-full sm:w-auto bg-transparent text-white px-4 py-3 sm:py-2 outline-none border-b sm:border-b-0 sm:border-r border-slate-700 text-sm font-semibold cursor-pointer"
              >
                <option className="bg-slate-900 text-white" value="latam">LATAM</option>
                <option className="bg-slate-900 text-white" value="na">NA</option>
                <option className="bg-slate-900 text-white" value="eu">EU</option>
                <option className="bg-slate-900 text-white" value="br">BR</option>
                <option className="bg-slate-900 text-white" value="ap">AP</option>
                <option className="bg-slate-900 text-white" value="kr">KR</option>
              </select>

              <input 
                type="text" 
                placeholder="Nombre de Jugador#TAG" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-white px-4 py-3 sm:py-2 outline-none text-sm placeholder-slate-500"
                required
              />

              <button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto mt-2 sm:mt-0 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-8 py-3 sm:py-2.5 rounded-md text-sm transition-colors cursor-pointer"
              >
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </form>
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto space-y-6">
          <button 
            onClick={() => setStats(null)} 
            className="mb-2 text-slate-400 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors"
          >
            ← Volver a buscar
          </button>

          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg flex items-center justify-between shadow">
            <div>
              <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Perfil Encontrado</div>
              <h3 className="text-lg font-bold text-white">
                {stats.profile.gameName} <span className="text-slate-400 font-normal">#{stats.profile.tagLine}</span>
              </h3>
            </div>
            <div className="bg-slate-800 px-3 py-1 rounded text-xs text-slate-300 border border-slate-700">
              Región: <span className="text-red-400 font-bold uppercase">{stats.profile.region}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-3">Últimas Partidas</h4>
            <div className="space-y-3">
              {stats.matches && stats.matches.length > 0 ? (
                stats.matches.map((match, index) => {
                  const isWon = match.won;
                  const borderColor = isWon ? 'border-emerald-500/50' : 'border-red-500/50';
                  const bgColor = isWon ? 'bg-emerald-900/40' : 'bg-red-900/40';
                  const textColor = isWon ? 'text-emerald-400' : 'text-red-400';

                  // Asignación de recursos gráficos
                  const agentImg = gameAssets.agents[match.agentName?.toLowerCase()];
                  const mapImg = gameAssets.maps[match.mapName?.toLowerCase()];

                  // Cálculo de KDA Ratio
                  const kdaRatio = match.deaths === 0 ? 'Perfecto' : ((match.kills + match.assists) / match.deaths).toFixed(2);
                  let kdaColor = 'text-slate-400';
                  if (kdaRatio >= 3 || kdaRatio === 'Perfecto') kdaColor = 'text-yellow-400 font-bold'; // Oro para MVPs
                  else if (kdaRatio >= 2) kdaColor = 'text-emerald-400 font-bold'; // Verde para buen rendimiento

                  return (
                    <div key={index} className={`relative overflow-hidden border ${borderColor} rounded-lg transition-all shadow-md group`}>
                      
                      {/* Imagen de fondo del mapa */}
                      {mapImg && (
                        <div 
                          className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                          style={{ backgroundImage: `url(${mapImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                      )}
                      
                      {/* Filtro de color sobre el fondo */}
                      <div className={`absolute inset-0 ${bgColor} opacity-80`}></div>

                      {/* Contenido de la tarjeta (Z-index superior) */}
                      <div className="relative p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-1/3">
                          <div className="w-14 h-14 bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-lg flex-shrink-0">
                            {agentImg ? (
                              <img src={agentImg} alt={match.agentName} className="w-full h-full object-cover transform scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-red-400 uppercase">
                                {match.agentName ? match.agentName.substring(0, 3) : 'VAL'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-white text-lg drop-shadow-md">{match.agentName || 'Desconocido'}</div>
                            <div className="text-xs text-slate-300 mt-0.5 drop-shadow">
                              Mapa: <span className="font-semibold text-white">{match.mapName}</span> • {match.gameMode}
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
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-900/40 border border-slate-800 rounded-lg text-sm">
                  No se encontraron partidas recientes.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}