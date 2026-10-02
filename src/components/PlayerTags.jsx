// src/components/PlayerTags.jsx
export default function PlayerTags({ matches, stats }) {
  if (!matches || matches.length === 0) return null;

  const tags = [];

  // 1. Analizar rachas recientes (últimas 3 partidas)
  const recentResults = matches.slice(0, 3).map(m => m.win);
  const allRecentLosses = recentResults.length >= 3 && recentResults.every(w => !w);
  const allRecentWins = recentResults.length >= 3 && recentResults.every(w => w);

  if (allRecentLosses) {
    tags.push({ 
      text: "Mala racha", 
      type: "red", 
      desc: "Este jugador ha encadenado 3 o más derrotas consecutivas en sus partidas más recientes." 
    });
  } else if (allRecentWins) {
    tags.push({ 
      text: "En racha", 
      type: "green", 
      desc: "¡Imparable! Ha ganado sus últimas 3 partidas consecutivas o más." 
    });
  }

  // 2. Analizar campeones principales en las últimas 10 partidas
  const champCounts = {};
  matches.forEach(m => {
    champCounts[m.championName] = (champCounts[m.championName] || 0) + 1;
  });

  Object.entries(champCounts).forEach(([champ, count]) => {
    if (count >= 3) {
      const percentage = Math.round((count / matches.length) * 100);
      tags.push({ 
        text: `Loco por ${champ}`, 
        type: "green", 
        desc: `Ha jugado a ${champ} en ${count} de sus últimas ${matches.length} partidas (${percentage}% de frecuencia).` 
      });
    }
  });

  // 3. Analizar promedio de muertes (Demasiada confianza)
  const totalDeaths = matches.reduce((acc, m) => acc + m.deaths, 0);
  const avgDeaths = (totalDeaths / matches.length).toFixed(1);
  if (avgDeaths >= 6) {
    tags.push({ 
      text: "Demasiada confianza", 
      type: "red", 
      desc: `Promedia un alto índice de muertes por partida (${avgDeaths}), lo que suele indicar jugadas demasiado agresivas o arriesgadas.` 
    });
  }

  // 4. Analizar KDA global
  const kdaNum = parseFloat(stats?.kda || 0);
  if (kdaNum >= 3.5) {
    tags.push({ 
      text: "Jugador Carry", 
      type: "green", 
      desc: `Posee un KDA excepcional de ${kdaNum}, destacando con un gran impacto en el marcador de sus equipos.` 
    });
  } else if (kdaNum < 1.5) {
    tags.push({ 
      text: "Se rinde", 
      type: "yellow", 
      desc: `Tiene un KDA bajo (${kdaNum}), lo que refleja dificultades recientes para mantenerse relevante en las partidas.` 
    });
  }

  if (tags.length === 0) {
    tags.push({ 
      text: "Jugador Estable", 
      type: "blue", 
      desc: "Mantiene un rendimiento equilibrado y constante en sus estadísticas recientes." 
    });
  }

  return (
    <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 mb-6 shadow-lg">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Etiquetas de Jugador</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => {
          let styles = "bg-slate-900 text-slate-300 border-slate-600";
          if (tag.type === "green") styles = "bg-emerald-950/40 text-emerald-400 border-emerald-500/50";
          if (tag.type === "red") styles = "bg-red-950/40 text-red-400 border-red-500/50";
          if (tag.type === "yellow") styles = "bg-amber-950/40 text-amber-400 border-amber-500/50";

          return (
            <span 
              key={idx} 
              title={tag.desc} // <-- Aquí se activa el texto flotante nativo al pasar el cursor
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border shadow-sm cursor-help transition-transform hover:scale-105 ${styles}`}
            >
              {tag.text}
            </span>
          );
        })}
      </div>
    </div>
  );
}