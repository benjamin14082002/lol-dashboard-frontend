// Código mejorado y con más vida para tu Home / App
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

export default function Home() {
  const [region, setRegion] = useState("LAS");
  const [summonerName, setSummonerName] = useState("");
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!summonerName.trim()) return;
    navigate(`/profile/${region}/${encodeURIComponent(summonerName.trim())}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden">
      
      {/* Círculos de luz ambiental de fondo para darle atmósfera */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* BARRA SUPERIOR CON ESTILO GAMING */}
      <div className="flex justify-end items-center w-full max-w-5xl mx-auto z-10">
        {currentUser ? (
          <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl shadow-xl hover:border-blue-500/50 transition-all">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="flex flex-col text-xs">
              <span className="text-slate-400">Conectado como <strong className="text-white">{currentUser.username}</strong></span>
              <button 
                onClick={() => navigate(`/profile/${currentUser.region}/${encodeURIComponent(currentUser.riot_id)}`)}
                className="text-blue-400 hover:text-blue-300 font-semibold text-left transition-colors"
              >
                ⚡ {currentUser.riot_id}
              </button>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-3 text-slate-500 hover:text-red-400 font-medium text-xs border-l border-slate-800 pl-3 transition-colors"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsAuthModalOpen(true)}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide text-white bg-slate-900/80 backdrop-blur-md border border-slate-700/80 hover:border-blue-500/50 shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Iniciar Sesión / Registrarse</span>
          </button>
        )}
      </div>

      {/* CONTENIDO CENTRAL */}
      <div className="flex flex-col items-center justify-center -mt-12 z-10">
        <div className="inline-block mb-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase animate-bounce">
          ⚡ Plataforma de Análisis LoL
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-3 text-center">
          LoL Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400">Dashboard</span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mb-10 text-center max-w-md">
          Consulta estadísticas en tiempo real, rachas, KDA y rendimiento avanzado de cualquier invocador.
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl justify-center items-center bg-slate-900/60 backdrop-blur-md p-3 rounded-2xl border border-slate-800 shadow-2xl">
          <select 
            value={region} 
            onChange={(e) => setRegion(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors cursor-pointer w-full sm:w-auto"
          >
            <option value="LAS">LAS</option>
            <option value="LAN">LAN</option>
            <option value="NA">NA</option>
            <option value="EUW">EUW</option>
            <option value="BR">BR</option>
          </select>
          
          <input 
            type="text" 
            placeholder="Nombre de Invocador (Ej: Flex Homie#325)" 
            value={summonerName}
            onChange={(e) => setSummonerName(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-blue-500 flex-1 shadow-inner w-full placeholder:text-slate-600"
          />
          
          <button 
            type="submit" 
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-blue-600/20 w-full sm:w-auto cursor-pointer"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* PIE DE PÁGINA SIMPLE */}
      <div className="text-center text-slate-600 text-xs z-10">
        Desarrollado con Django y React • Conectado con la API de Riot Games
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