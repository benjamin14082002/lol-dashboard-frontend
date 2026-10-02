// src/components/valorant/ValorantDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ValorantDashboard() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('latam');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cambia esta URL si tu backend usa otra ruta o la tienes por variable de entorno
  const API_BASE_URL = 'https://lol-dashboard-backend.onrender.com';

  const fetchStats = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/valorant/stats/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (err) {
      // Si el usuario aún no tiene perfil guardado, el backend dará 404 de forma silenciosa
      console.log('No hay perfil de Valorant registrado todavía.');
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('No estás autenticado. Inicia sesión primero.');
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/valorant/profile/`,
        { gameName, tagLine, region },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Una vez guardado con éxito, actualizamos las estadísticas automáticamente
      await fetchStats();
      setGameName('');
      setTagLine('');
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el perfil. Revisa tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 text-slate-100">
      
      {/* Cabecera de la sección */}
      <div className="mb-6 border-b border-red-900/40 pb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-red-500 uppercase flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-red-600 rounded-sm"></span>
          Valorant Tracker
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Consulta tu rendimiento, agentes y el historial de tus últimas batallas en la arena.
        </p>
      </div>

      {/* Formulario de Activación / Vinculación de Riot ID */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-6 mb-6 shadow-xl backdrop-blur-md">
        <h3 className="text-sm font-bold uppercase text-slate-300 mb-3 tracking-wider">
          Vincular cuenta de Valorant
        </h3>
        
        <form onSubmit={handleSaveProfile} className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            placeholder="Riot ID (ej. Flippy)" 
            value={gameName} 
            onChange={(e) => setGameName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 focus:border-red-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors" 
            required
          />
          <input 
            type="text" 
            placeholder="Tag (ej. LAS)" 
            value={tagLine} 
            onChange={(e) => setTagLine(e.target.value)}
            className="w-full sm:w-32 bg-slate-950 border border-slate-700 focus:border-red-500 rounded-lg px-4 py-2.5 text-sm text-white outline-none transition-colors uppercase" 
            required
          />
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            className="w-full sm:w-36 bg-slate-950 border border-slate-700 focus:border-red-500 rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-colors cursor-pointer"
          >
            <option value="latam">LATAM</option>
            <option value="na">NA</option>
            <option value="eu">EU</option>
            <option value="br">BR</option>
          </select>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-red-900/20 cursor-pointer"
          >
            {loading ? 'Buscando...' : 'Guardar Cuenta'}
          </button>
        </form>

        {error && (
          <div className="mt-3 text-red-400 text-xs bg-red-950/30 border border-red-900/50 p-2.5 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Tarjeta de Perfil y Listado de Partidas */}
      {stats && stats.profile && (
        <div className="space-y-6">
          
          {/* Información del Perfil Vinculado */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/30 border border-slate-800 p-5 rounded-xl shadow-md flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-0.5">Perfil Activo</div>
              <h3 className="text-xl font-bold text-white">
                {stats.profile.gameName} <span className="text-slate-400 font-normal">#{stats.profile.tagLine}</span>
              </h3>
            </div>
            <div className="bg-slate-950/80 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider text-slate-300">
              Región: <span className="text-red-400 font-bold">{stats.profile.region}</span>
            </div>
          </div>

          {/* Historial de Partidas */}
          <div>
            <h4 className="text-md font-bold mb-3 text-slate-200 tracking-wide">
              Últimas Partidas Registradas
            </h4>
            
            <div className="space-y-3">
              {stats.matches && stats.matches.length > 0 ? (
                stats.matches.map((match, index) => {
                  const isWon = match.won;
                  const cardBg = isWon ? 'bg-emerald-950/15 border-emerald-500/30' : 'bg-red-950/15 border-red-500/30';
                  const statusColor = isWon ? 'text-emerald-400' : 'text-red-400';

                  return (
                    <div 
                      key={index} 
                      className={`border ${cardBg} rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:bg-slate-900/60 shadow-sm`}
                    >
                      {/* Datos principales del agente y mapa */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-950 border border-slate-700 rounded-lg flex items-center justify-center font-bold text-xs text-red-400 uppercase shrink-0 shadow-inner">
                          {match.agentName ? match.agentName.substring(0, 3) : 'VAL'}
                        </div>
                        <div>
                          <div className="font-bold text-base text-white tracking-wide">
                            {match.agentName || 'Desconocido'}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>Mapa: <strong className="text-slate-300">{match.mapName}</strong></span>
                            <span>•</span>
                            <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-700">
                              {match.gameMode}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Resultado (Victoria / Derrota) */}
                      <div className={`font-black text-sm uppercase tracking-widest ${statusColor} sm:text-center`}>
                        {isWon ? 'Victoria' : 'Derrota'}
                      </div>

                      {/* Estadísticas de combate KDA */}
                      <div className="flex items-center gap-4 bg-slate-950/60 border border-slate-800 px-4 py-2 rounded-lg w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-center">
                          <div className="text-sm font-bold font-mono text-slate-200">
                            {match.kills} / <span className="text-red-400">{match.deaths}</span> / {match.assists}
                          </div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">KDA</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-500 bg-slate-900/40 border border-slate-800 rounded-xl">
                  No se encontraron partidas recientes para este perfil.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}