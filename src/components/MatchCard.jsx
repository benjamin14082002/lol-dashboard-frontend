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
  const borderColor = isWin ? 'border-blue-500/50' : 'border-red-500/50';
  const textColor = isWin ? 'text-blue-400' : 'text-red-400';
  
  const splashArtUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${match.championName}_0.jpg`;

  const team100 = match.participants_data?.filter(p => p.teamId === 100) || [];
  const team200 = match.participants_data?.filter(p => p.teamId === 200) || [];

  return (
    <div className={`relative overflow-hidden border ${borderColor} rounded-xl shadow-md transition-all hover:scale-[1.01] group mb-3`}>
      
      {/* FONDO INMERSIVO SPLASH ART */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 group-hover:opacity-50 transition-opacity duration-500 mix-blend-luminosity"
        style={{ backgroundImage: `url(${splashArtUrl})` }}
      />
      
      {/* GRADIENTE PARA LEER EL TEXTO */}
      <div className={`absolute inset-0 z-0 bg-gradient-to-r ${isWin ? 'from-blue-950' : 'from-red-950'} via-slate-900/95 to-slate-900/40 opacity-90`} />

      {/* VISTA PRINCIPAL (Clicable) */}
      <div 
        className="relative z-10 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between cursor-pointer gap-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Campeón */}
          <div className="relative shrink-0">
            <img 
              src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${match.championName}.png`} 
              className="w-14 h-14 rounded-full border-2 border-slate-700 shadow-lg object-cover transform transition-transform group-hover:scale-105" 
              alt={match.championName}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          
          {/* Hechizos y Runas */}
          <div className="flex gap-1 shrink-0">
            <div className="flex flex-col gap-0.5">
              {match.spells && match.spells.map((spell, i) => (
                <img key={`spell-${i}`} src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/spell/${getSpellIcon(spell)}.png`} className="w-6 h-6 rounded object-cover border border-slate-800" alt="spell" onError={(e) => { e.target.style.display = 'none'; }} />
              ))}
            </div>
            <div className="flex flex-col gap-0.5">
               {match.runes && match.runes[0] !== 0 && (
                <img src={`https://ddragon.leagueoflegends.com/cdn/img/perk-images/${getKeystoneIcon(match.runes[0])}`} className="w-6 h-6 rounded-full bg-slate-950/80 border border-slate-700 p-0.5 object-cover" alt="primary rune" onError={(e) => { e.target.style.display = 'none'; }} />
              )}
              {match.runes && match.runes[1] !== 0 && (
                <img src={getSecondaryRuneIcon(match.runes[1])} className="w-6 h-6 rounded-full bg-slate-950/80 border border-slate-700 p-0.5 object-cover" alt="secondary rune" onError={(e) => { e.target.style.display = 'none'; }} />
              )}
            </div>
          </div>

          {/* Estado y modo de juego */}
          <div className="ml-2 min-w-0">
            <div className="font-bold text-white text-lg drop-shadow-md leading-tight">{match.championName}</div>
            <div className="text-xs text-slate-300 mt-0.5 drop-shadow flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-white">{match.gameMode || 'Partida'}</span>
              <span className="text-slate-500">•</span> 
              <span>{match.duration}</span>
            </div>
          </div>
        </div>
        
        {/* RESULTADO Y KDA */}
        <div className="flex flex-row sm:flex-col items-center justify-between sm:justify-center w-full sm:w-auto px-1 sm:px-4 gap-2 sm:gap-0">
          <div className={`font-extrabold uppercase tracking-widest text-lg drop-shadow-md ${textColor}`}>
            {isWin ? 'VICTORIA' : 'DERROTA'}
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-200 text-sm sm:text-base tracking-wide drop-shadow-md">
              {match.kills} <span className="text-slate-500 font-normal">/</span> <span className="text-red-400">{match.deaths}</span> <span className="text-slate-500 font-normal">/</span> {match.assists}
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="flex gap-1 shrink-0">
          {match.items.slice(0, 6).map((item, i) => (
            <div key={i} className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-950/60 rounded overflow-hidden border border-slate-700/80 shrink-0 backdrop-blur-sm shadow-inner">
              {item > 0 && <img src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/item/${item}.png`} className="w-full h-full object-cover" alt="item" />}
            </div>
          ))}
          {/* Ward (Ítem 7) */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-slate-600/80 shrink-0 ml-1 bg-slate-950/60 backdrop-blur-sm shadow-inner">
             {match.items[6] > 0 && <img src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/item/${match.items[6]}.png`} className="w-full h-full object-cover" alt="trinket" />}
          </div>
        </div>
      </div>

      {/* VISTA EXPANDIDA 5v5 CON KP */}
      {expanded && (() => {
        const totalTeam100Kills = team100.reduce((acc, p) => acc + p.kills, 0) || 1;
        const totalTeam200Kills = team200.reduce((acc, p) => acc + p.kills, 0) || 1;

        return (
          <div className="relative z-20 border-t border-slate-700/50 bg-slate-950/85 backdrop-blur-md p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Equipo Azul */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">Equipo Azul</div>
              {team100.map((p, i) => {
                const kp = Math.round(((p.kills + p.assists) / totalTeam100Kills) * 100);
                return (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-slate-800/30 hover:bg-slate-800/60 rounded transition-colors gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${p.championName}.png`} className="w-6 h-6 rounded border border-blue-900/50 shrink-0 object-cover" alt={p.championName} onError={(e) => { e.target.style.display = 'none'; }} />
                      <Link 
                        to={`/profile/${currentRegion}/${encodeURIComponent(p.summonerName)}`} 
                        className="truncate w-28 sm:w-36 text-blue-300 hover:text-white hover:underline font-medium transition-colors"
                      >
                        {p.summonerName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-slate-300 font-mono">{p.kills}/{p.deaths}/{p.assists}</span>
                      <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 text-[10px]" title="Participación en Asesinatos">
                        {isNaN(kp) ? 0 : kp}% KP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Equipo Rojo */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1">Equipo Rojo</div>
              {team200.map((p, i) => {
                const kp = Math.round(((p.kills + p.assists) / totalTeam200Kills) * 100);
                return (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 bg-slate-800/30 hover:bg-slate-800/60 rounded transition-colors gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={`https://ddragon.leagueoflegends.com/cdn/${patchVersion}/img/champion/${p.championName}.png`} className="w-6 h-6 rounded border border-red-900/50 shrink-0 object-cover" alt={p.championName} onError={(e) => { e.target.style.display = 'none'; }} />
                      <Link 
                        to={`/profile/${currentRegion}/${encodeURIComponent(p.summonerName)}`} 
                        className="truncate w-28 sm:w-36 text-blue-300 hover:text-white hover:underline font-medium transition-colors"
                      >
                        {p.summonerName}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-slate-300 font-mono">{p.kills}/{p.deaths}/{p.assists}</span>
                      <span className="text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60 text-[10px]" title="Participación en Asesinatos">
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