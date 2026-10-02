// src/components/SearchBar.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [summonerName, setSummonerName] = useState('');
  const [region, setRegion] = useState('LAS');
  const [recentSearches, setRecentSearches] = useState([]);
  
  const navigate = useNavigate();

  // Cargar las búsquedas recientes del localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  const saveSearchQuery = (name, reg) => {
    const query = `${name} (${reg})`;
    // Evitar duplicados y mantener máximo 5 recientes
    const updated = [query, ...recentSearches.filter(item => item !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const removeSearchQuery = (e, queryToRemove) => {
    e.stopPropagation(); // Evita que se active la búsqueda al hacer clic en la "×"
    const updated = recentSearches.filter(item => item !== queryToRemove);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanName = summonerName.trim();
    if (!cleanName) return;
    
    saveSearchQuery(cleanName, region);
    navigate(`/profile/${region}/${encodeURIComponent(cleanName)}`);
  };

  const handleSelectRecent = (item) => {
    // El formato guardado es "Nombre (REGION)"
    const match = item.match(/^(.*) \((.*?)\)$/);
    if (match) {
      const [, name, reg] = match;
      setSummonerName(name);
      setRegion(reg);
      navigate(`/profile/${reg}/${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto mt-10">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
        <select 
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="LAS">LAS</option>
          <option value="LAN">LAN</option>
          <option value="NA">NA</option>
          <option value="EUW">EUW</option>
        </select>

        <input 
          type="text" 
          value={summonerName}
          onChange={(e) => setSummonerName(e.target.value)}
          placeholder="Nombre de Invocador (Ej: Flex Homie32#HOMIE)" 
          className="flex-1 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button 
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
        >
          Buscar
        </button>
      </form>

      {/* Lista de búsquedas recientes con botón de borrar individual */}
      {recentSearches.length > 0 && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Recientes:</span>
          {recentSearches.map((item, idx) => (
            <div 
              key={idx}
              onClick={() => handleSelectRecent(item)}
              className="group flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-md cursor-pointer hover:border-slate-500 hover:text-white transition-colors"
            >
              <span className="max-w-[120px] truncate">{item}</span>
              <button
                type="button"
                onClick={(e) => removeSearchQuery(e, item)}
                className="text-slate-500 hover:text-red-400 font-bold px-0.5 rounded transition-colors"
                title="Eliminar de recientes"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}