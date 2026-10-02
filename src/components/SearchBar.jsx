// src/components/SearchBar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar() {
  const [summonerName, setSummonerName] = useState('');
  const [region, setRegion] = useState('LAS');
  
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Limpiamos espacios al inicio y al final
    const cleanName = summonerName.trim();
    if (!cleanName) return;
    
    // encodeURIComponent es vital para que los espacios (como en "Flex Homie 32") 
    // y el "#" no rompan la URL al viajar al backend.
    navigate(`/profile/${region}/${encodeURIComponent(cleanName)}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 w-full max-w-lg mx-auto mt-10">
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
  );
}