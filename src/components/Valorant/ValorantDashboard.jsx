// src/components/Valorant/ValorantDashboard.jsx
import { useState } from 'react';
import axios from 'axios';

export default function ValorantDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [region, setRegion] = useState('latam');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = 'https://lol-dashboard-backend.onrender.com';

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setStats(null);

    // Validamos que el usuario incluya el hashtag
    if (!searchQuery.includes('#')) {
      setError('El formato debe ser Nombre#Tag (Ejemplo: Flex Homie 32#HOMIE)');
      return;
    }

    const [gameName, tagLine] = searchQuery.split('#');
    setLoading(true);

    try {
      // Endpoint público que crearemos en Django
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

          {/* Barra de Búsqueda Estilo LoL */}
          <form onSubmit={handleSearch} className="mt-8 relative max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center bg-slate-900 border border-slate-700 rounded-lg p-1.5 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 transition-all shadow-xl">
              
              <select 
                value={region} 
                onChange={(e) => setRegion(e.target.value)}
                className="w-full sm:w-auto bg-transparent text-white px-4 py-3 sm:py-2 outline-none border-b sm:border-b-0 sm:border-r border-slate-700 text-sm font-semibold cursor-pointer"
              >
                <option value="latam">LATAM</option>
                <option value="na">NA</option>
                <option value="eu">EU</option>
                <option value="br">BR</option>
                <option value="ap">AP</option>
                <option value="kr">KR</option>
              </select>

              <input 
                type="text" 
                placeholder="Nombre de Jugador#TAG (Ej: Flex Homie 32#HOMIE)" 
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
        
        /* RESULTADOS DE LA BÚSQUEDA */
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
                  const bgColor = isWon ? 'bg-emerald-900/10' : 'bg-red-900/10';
                  const textColor = isWon ? 'text-emerald-400' : 'text-red-400';

                  return (
                    <div key={index} className={`border ${borderColor} ${bgColor} rounded-lg p-4 flex items-center justify-between transition-all shadow-md`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center font-bold text-xs text-red-400 uppercase">
                          {match.agentName ? match.agentName.substring(0, 3) : 'VAL'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">{match.agentName || 'Desconocido'}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Mapa: <span className="text-slate-300 font-medium">{match.mapName}</span> • {match.gameMode}
                          </div>
                        </div>
                      </div>
                      <div className={`font-bold uppercase tracking-wide text-base ${textColor}`}>
                        {isWon ? 'Victoria' : 'Derrota'}
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-slate-200">
                          {match.kills} / <span className="text-red-400">{match.deaths}</span> / {match.assists}
                        </div>
                        <div className="text-xs text-slate-500">KDA</div>
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