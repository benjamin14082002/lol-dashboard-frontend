// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isValorant = location.pathname.startsWith('/valorant');

  return (
    <nav className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <span className="font-bold text-lg text-white tracking-wide">GG Tracker</span>
      </div>

      {/* Botones para alternar entre juegos */}
      <div className="flex items-center gap-2">
        <Link 
          to="/" 
          className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
            !isValorant 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          League of Legends
        </Link>
        <Link 
          to="/valorant" 
          className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
            isValorant 
              ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Valorant
        </Link>
      </div>
    </nav>
  );
}