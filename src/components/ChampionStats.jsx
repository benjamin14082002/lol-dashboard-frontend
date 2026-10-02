// src/components/ChampionStats.jsx
export default function ChampionStats({ matches, patchVersion }) {
  if (!matches || matches.length === 0) return null;

  const champMap = {};

  matches.forEach(m => {
    const rawName = m.championName || "Unknown";
    // Normalizamos la clave para agrupar sin problemas de mayúsculas
    const key = rawName.toLowerCase();

    if (!champMap[key]) {
      champMap[key] = { 
        name: rawName, // Mantiene el nombre real para mostrar
        wins: 0, 
        losses: 0, 
        kills: 0, 
        deaths: 0, 
        assists: 0, 
        games: 0 
      };
    }
    champMap[key].games += 1;
    if (m.win) champMap[key].wins += 1;
    else champMap[key].losses += 1;
    champMap[key].kills += m.kills;
    champMap[key].deaths += m.deaths;
    champMap[key].assists += m.assists;
  });

  const sortedChampions = Object.values(champMap).map(stats => {
    const winrate = Math.round((stats.wins / stats.games) * 100);
    const avgKills = (stats.kills / stats.games).toFixed(1);
    const avgDeaths = (stats.deaths / stats.games).toFixed(1);
    const avgAssists = (stats.assists / stats.games).toFixed(1);
    const kda = ((stats.kills + stats.assists) / Math.max(1, stats.deaths)).toFixed(2);
    return { ...stats, winrate, avgKills, avgDeaths, avgAssists, kda };
  }).sort((a, b) => b.games - a.games);

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-slate-200">Rendimiento por Campeón (Últimas 10 Partidas)</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedChampions.map((champ) => (
          <div key={champ.name} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 flex items-center gap-4">
            <img 
              src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${champ.name}.png`} 
              className="w-12 h-12 rounded-full border border-slate-600 object-cover shrink-0" 
              alt={champ.name} 
            />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white truncate">{champ.name}</div>
              <div className="text-xs text-slate-400">
                <span className={champ.winrate >= 50 ? "text-emerald-400 font-semibold" : "text-red-400 font-semibold"}>
                  {champ.winrate}% WR
                </span> 
                <span className="mx-1">•</span> {champ.games} {champ.games === 1 ? 'partida' : 'partidas'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                KDA Promedio: <span className="text-slate-200 font-medium">{champ.avgKills}/{champ.avgDeaths}/{champ.avgAssists}</span> ({champ.kda})
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}