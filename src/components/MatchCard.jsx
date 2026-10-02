// src/components/MatchCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

const getSpellIcon = (spellId) => {
  const spells = {
    21: 'SummonerBarrier', 1: 'SummonerBoost', 14: 'SummonerDot', 3: 'SummonerExhaust',
    4: 'SummonerFlash', 6: 'SummonerHaste', 7: 'SummonerHeal', 13: 'SummonerMana',
    11: 'SummonerSmite', 12: 'SummonerTeleport', 32: 'SummonerSnowball'
  };
  return spells[spellId] || 'SummonerFlash';
};

const getKeystoneIcon = (runeId) => {
  const runes = {
    8005: 'Styles/Precision/PressTheAttack/PressTheAttack.png',
    8008: 'Styles/Precision/LethalTempo/LethalTempoTemp.png',
    8021: 'Styles/Precision/FleetFootwork/FleetFootwork.png',
    8010: 'Styles/Precision/Conqueror/Conqueror.png',
    8112: 'Styles/Domination/Electrocute/Electrocute.png',
    8124: 'Styles/Domination/Predator/Predator.png',
    8128: 'Styles/Domination/DarkHarvest/DarkHarvest.png',
    9923: 'Styles/Domination/HailOfBlades/HailOfBlades.png',
    8214: 'Styles/Sorcery/SummonAery/SummonAery.png',
    8229: 'Styles/Sorcery/ArcaneComet/ArcaneComet.png',
    8230: 'Styles/Sorcery/PhaseRush/PhaseRush.png',
    8437: 'Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
    8439: 'Styles/Resolve/VeteranAftershock/VeteranAftershock.png',
    8465: 'Styles/Resolve/Guardian/Guardian.png',
    8351: 'Styles/Inspiration/GlacialAugment/GlacialAugment.png',
    8360: 'Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
    8369: 'Styles/Inspiration/FirstStrike/FirstStrike.png'
  };
  return runes[runeId] || 'Styles/Domination/Electrocute/Electrocute.png';
};

const getSecondaryRuneIcon = (styleId) => {
  const styles = {
    8000: '7201_precision', 8100: '7200_domination', 8200: '7202_sorcery',
    8300: '7203_whimsy', 8400: '7204_resolve'
  };
  const styleName = styles[styleId] || '7200_domination';
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/${styleName}.png`;
};

export default function MatchCard({ match, patchVersion, currentRegion }) {
  const [expanded, setExpanded] = useState(false);

  const isWin = match.win;
  const borderColor = isWin ? 'border-emerald-500/50' : 'border-red-500/50';
  const bgColor = isWin ? 'bg-emerald-900/10' : 'bg-red-900/10';
  const textColor = isWin ? 'text-emerald-400' : 'text-red-400';

  const team100 = match.participants_data?.filter(p => p.teamId === 100) || [];
  const team200 = match.participants_data?.filter(p => p.teamId === 200) || [];

  return (
    <div className={`border ${borderColor} ${bgColor} rounded-lg overflow-hidden transition-all mb-3 shadow-md`}>
      
      {/* VISTA PRINCIPAL (Clicable) */}
      <div 
        className="p-3 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Campeón */}
          <img 
            src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${match.championName}.png`} 
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-slate-600 shadow-sm shrink-0" 
            alt={match.championName}
          />
          
          {/* Hechizos (Columna de 2 compacta) */}
          <div className="flex flex-col gap-0.5 shrink-0">
            {match.spells && match.spells.map((spell, i) => (
              <img 
                key={`spell-${i}`}
                src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/spell/${getSpellIcon(spell)}.png`}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded object-cover" alt="spell"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ))}
          </div>

          {/* Runas (Columna de 2 compacta) */}
          <div className="flex flex-col gap-0.5 shrink-0">
             {match.runes && match.runes[0] !== 0 && (
              <img 
                src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/${getKeystoneIcon(match.runes[0])}`}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-900 border border-slate-700 p-0.5 object-cover" alt="primary rune"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            {match.runes && match.runes[1] !== 0 && (
              <img 
                src={getSecondaryRuneIcon(match.runes[1])}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-900 border border-slate-700 p-0.5 object-cover" alt="secondary rune"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>

          {/* Estado y modo de juego */}
          <div className="ml-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
              <span className={`font-bold ${textColor} text-sm sm:text-lg uppercase tracking-wide leading-tight`}>
                {isWin ? 'Victoria' : 'Derrota'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700 w-fit">
                {match.gameMode || 'Partida'}
              </span>
            </div>
            <div className="text-slate-400 text-[11px] sm:text-xs mt-0.5">{match.duration}</div>
          </div>
        </div>
        
        {/* KDA */}
        <div className="text-center shrink-0 px-1">
          <div className="font-bold text-slate-200 text-xs sm:text-base">{match.kills} / <span className="text-red-400">{match.deaths}</span> / {match.assists}</div>
          <div className="text-[10px] sm:text-xs text-slate-500">KDA</div>
        </div>

        {/* Items (Ocultos en móviles muy pequeños para no apretar la tarjeta, visibles en pantallas medianas en adelante) */}
        <div className="hidden md:flex gap-1">
          {match.items.slice(0, 6).map((item, i) => (
            <div key={i} className="w-8 h-8 bg-slate-900 rounded overflow-hidden border border-slate-700/50 shrink-0">
              {item > 0 && <img src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/item/${item}.png`} className="w-full h-full object-cover" alt="item" />}
            </div>
          ))}
        </div>
      </div>

      {/* VISTA EXPANDIDA 5v5 CON KP */}
      {expanded && (() => {
        const totalTeam100Kills = team100.reduce((acc, p) => acc + p.kills, 0) || 1;
        const totalTeam200Kills = team200.reduce((acc, p) => acc + p.kills, 0) || 1;

        return (
          <div className="border-t border-slate-700/50 bg-slate-900/60 p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Equipo Azul */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Equipo Azul</div>
              {team100.map((p, i) => {
                const kp = Math.round(((p.kills + p.assists) / totalTeam100Kills) * 100);
                return (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-slate-800/35 hover:bg-slate-800/60 rounded transition-colors gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${p.championName}.png`} className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-blue-900/50 shrink-0" alt={p.championName} onError={(e) => { e.target.style.display = 'none'; }} />
                      <Link 
                        to={`/profile/${currentRegion}/${encodeURIComponent(p.summonerName)}`} 
                        className="truncate w-24 sm:w-32 text-blue-400 hover:text-blue-300 hover:underline font-medium"
                      >
                        {p.summonerName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="text-slate-400 font-semibold">{p.kills}/{p.deaths}/{p.assists}</span>
                      <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 text-[10px]" title="Participación en Asesinatos">
                        {isNaN(kp) ? 0 : kp}% KP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Equipo Rojo */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Equipo Rojo</div>
              {team200.map((p, i) => {
                const kp = Math.round(((p.kills + p.assists) / totalTeam200Kills) * 100);
                return (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-slate-800/35 hover:bg-slate-800/60 rounded transition-colors gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${p.championName}.png`} className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-red-900/50 shrink-0" alt={p.championName} onError={(e) => { e.target.style.display = 'none'; }} />
                      <Link 
                        to={`/profile/${currentRegion}/${encodeURIComponent(p.summonerName)}`} 
                        className="truncate w-24 sm:w-32 text-blue-400 hover:text-blue-300 hover:underline font-medium"
                      >
                        {p.summonerName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <span className="text-slate-400 font-semibold">{p.kills}/{p.deaths}/{p.assists}</span>
                      <span className="text-emerald-400 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 text-[10px]" title="Participación en Asesinatos">
                        {isNaN(kp) ? 0 : kp}% KP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        );
      })()}
    </div>
  );
}