// src/components/AuthModal.jsx
import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [riotId, setRiotId] = useState(""); 
  const [region, setRegion] = useState("LAS");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const endpoint = isLogin ? `${API_URL}/api/auth/login/` : `${API_URL}/api/auth/register/`;
    const payload = isLogin 
      ? { username, password } 
      : { username, password, riot_id: riotId, region };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ocurrió un error en la autenticación.");
      }

      if (isLogin) {
        localStorage.setItem('user', JSON.stringify(data));
        onLoginSuccess(data);
        onClose();
      } else {
        setSuccessMsg(data.message);
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMsg(null);
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
        >
          &times;
        </button>

        <div className="flex border-b border-slate-700 mb-6">
          <button 
            className={`flex-1 pb-3 font-bold text-sm transition-colors ${isLogin ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400'}`}
            onClick={() => { setIsLogin(true); setError(null); }}
          >
            Iniciar Sesión
          </button>
          <button 
            className={`flex-1 pb-3 font-bold text-sm transition-colors ${!isLogin ? 'text-blue-400 border-b-2 border-blue-500' : 'text-slate-400'}`}
            onClick={() => { setIsLogin(false); setError(null); }}
          >
            Registrarse
          </button>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-500/50 text-red-300 text-xs p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs p-3 rounded-lg mb-4">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Usuario</label>
            <input 
              type="text" 
              required
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="Tu nombre de usuario"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Contraseña</label>
            <input 
              type="password" 
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Riot ID (Ej: Nombre#LAS)</label>
                <input 
                  type="text" 
                  required
                  value={riotId} 
                  onChange={(e) => setRiotId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                  placeholder="TuInvocador#LAS"
                />
                <p className="text-[10px] text-slate-500 mt-1">Lo validaremos automáticamente con la API de Riot.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Región</label>
                <select 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="LAS">LAS</option>
                  <option value="LAN">LAN</option>
                  <option value="NA">NA</option>
                  <option value="EUW">EUW</option>
                  <option value="BR">BR</option>
                </select>
              </div>
            </>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-lg disabled:opacity-50 mt-2"
          >
            {loading ? "Procesando..." : (isLogin ? "Entrar a mi cuenta" : "Validar y Registrarse")}
          </button>
        </form>
      </div>
    </div>
  );
}