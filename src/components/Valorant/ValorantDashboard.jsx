// src/components/Valorant/ValorantDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ValorantDashboard() {
  const [gameName, setGameName] = useState('');
  const [tagLine, setTagLine] = useState('');
  const [region, setRegion] = useState('latam');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="max-w-5xl mx-auto p-4 sm:p-6 text-slate-100">
      
      {/* Cabecera idéntica al estándar visual */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-red-500 uppercase flex items-center gap-2">
          Valorant Tracker
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Consulta tu rendimiento, agentes y el historial de tus últimas batallas en la arena.
        </p>
      </div>

      {/* Formulario de Activación / Vinculación de Riot ID */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-5 mb-6 shadow-md">
        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">
          Vincular cuenta de Valorant
        </h3>
        
        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input 
            type="text" 
            placeholder="Riot ID (ej. Flippy)" 
            value={gameName} 
            onChange={(e) => setGameName(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-red-500" 
            required
          />
          <input 
            type="text" 
            placeholder="Tag (ej. LAS)" 
            value={tagLine} 
            onChange={(e) => setTagLine(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-red-500 uppercase" 
            required
          />
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            className="bg-slate-800/80 border border-slate-700 rounded px-3 py-2 text-sm text-white outline-none focus:border-red-500 cursor-pointer"
          >
            <option value="latam">LATAM</option>
            <option value="na">NA</option>
            <option value="eu">EU</option>
            <option value="br">BR</option>
          </select>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded text-sm transition-colors cursor-pointer"
          >
            {loading ? 'Buscando...' : 'Guardar Cuenta'}
          </button>
        </form>

        {error && (
          <div className="mt-3 text-red-400 text-xs bg-red-950/40 border border-red-900/50 p-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Perfil y Partidas */}
      {stats && stats.profile && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg flex items-center justify-between shadow">
            <div>
              <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Perfil Activo</div>
              <h3 className="text-lg font-bold text-white">
                {stats.profile.gameName} <span className="text-slate-400 font-normal">#{stats.profile.tagLine}</span>
              </h3>
            </div>
            <div className="bg-slate-800 px-3 py-1 rounded text-xs text-slate-300 border border-slate-700">
              Región: <span className="text-red-400 font-bold uppercase">{stats.profile.region}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider mb-3">
              Últimas Partidas
            </h4>
            
            <div className="space-y-3">
              {stats.matches && stats.matches.length > 0 ? (
                stats.matches.map((match, index) => {
                  const isWon = match.won;
                  const borderColor = isWon ? 'border-emerald-500/50' : 'border-red-500/50';
                  const bgColor = isWon ? 'bg-emerald-900/10' : 'bg-red-900/10';
                  const textColor = isWon ? 'text-emerald-400' : 'text-red-400';

                  return (
                    <div 
                      key={index} 
                      className={`border ${borderColor} ${bgColor} rounded-lg p-4 flex items-center justify-between transition-all shadow-md`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center font-bold text-xs text-red-400 uppercase">
                          {match.agentName ? match.agentName.substring(0, 3) : 'VAL'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">
                            {match.agentName || 'Desconocido'}
                          </div>
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