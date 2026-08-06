import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X, Globe, Users, Link as LinkIcon } from 'lucide-react';
import { getRank } from '../utils/ranks';

function stringToHsl(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 80%, 55%)`;
}

function stringToGradient(str) {
  const c1 = stringToHsl(str);
  const c2 = stringToHsl(str + '__');
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

function getInitials(name) {
  return name.split(/[\s_]+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

export default function CountryLogo({ countryName, purchasedPixels, userName, onBuyPixelsForLogo, initialLogoName, initialLogoEvent, onInvestInUser, userBalance, onUpdateBalance, onRevolutionSuccess }) {
  const [selectedLogo, setSelectedLogo] = useState(null);
  const [investAmount, setInvestAmount] = useState(10);
  const [uploadFor, setUploadFor] = useState(null);
  const [, forceUpdate] = useState(0);
  const fileInputRef = useRef(null);
  const lastProcessedEvent = useRef(null);

  const getLogo = (playerName) => {
    try {
      const raw = localStorage.getItem(`hexglobe_logo_${countryName}_${playerName}`);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  useEffect(() => {
    if (initialLogoEvent && initialLogoEvent.name) {
      if (initialLogoEvent.timestamp !== lastProcessedEvent.current) {
        lastProcessedEvent.current = initialLogoEvent.timestamp;
        const player = purchasedPixels.find(p => p.name === initialLogoEvent.name && p.country === countryName);
        if (player) {
          setSelectedLogo({ player, logoData: getLogo(initialLogoEvent.name) });
        }
      }
    }
  }, [initialLogoEvent, countryName, purchasedPixels]);

  function getPlayerBadges(pixelCount, name) {
    const badges = [
      { id: 'first_blood', name: 'Patriot Începător', icon: '🩸', rarity: 'Comun', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-500/30' }
    ];
    if (pixelCount >= 2) badges.push({ id: 'defender', name: 'Apărător Activ', icon: '🛡️', rarity: 'Rar', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/30' });
    if (pixelCount >= 5) badges.push({ id: 'conqueror', name: 'Cuceritor', icon: '⚔️', rarity: 'Epic', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-500/30' });
    if (pixelCount >= 10) badges.push({ id: 'whale', name: 'Finanțator', icon: '💎', rarity: 'Legendar', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/30' });
    if (pixelCount >= 20 || name.length > 8) badges.push({ id: 'emperor', name: 'Împărat', icon: '👑', rarity: 'Mitic', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' });
    
    return badges;
  }

  const saveLogo = (name, data) => {
    localStorage.setItem(storageKey(name), JSON.stringify(data));
    forceUpdate(n => n + 1);
  };

  const playerPixelCounts = {};
  purchasedPixels.forEach(p => {
    if (p.country === countryName) {
       playerPixelCounts[p.name] = (playerPixelCounts[p.name] || 0) + (p.amount || 1);
    }
  });

  let emperor = null;
  let maxPixels = 0;
  Object.entries(playerPixelCounts).forEach(([name, count]) => {
     if (count > maxPixels && count > 0) { 
        maxPixels = count;
        emperor = name;
     }
  });

  const [revolution, setRevolution] = useState({ progress: 0, revolutionaries: {} });
  
  useEffect(() => {
     const saved = localStorage.getItem(`hexglobe_revolution_${countryName}`);
     if (saved) setRevolution(JSON.parse(saved));
     else setRevolution({ progress: 0, revolutionaries: {} });
  }, [countryName]);

  const saveRevolution = (rev) => {
     setRevolution(rev);
     localStorage.setItem(`hexglobe_revolution_${countryName}`, JSON.stringify(rev));
  };

  const handleInciteRevolution = () => {
     if (userBalance < 50) return alert("Nu ai 50 de pixeli pentru a susține revoluția!");
     onUpdateBalance(-50);
     const newRev = { ...revolution };
     newRev.progress = Math.min(100, newRev.progress + 5);
     newRev.revolutionaries[userName] = (newRev.revolutionaries[userName] || 0) + 50;
     saveRevolution(newRev);

     if (newRev.progress >= 100 && onRevolutionSuccess) {
        onRevolutionSuccess(countryName, emperor, newRev.revolutionaries);
        saveRevolution({ progress: 0, revolutionaries: {} });
     }
  };

  const handleSuppressRevolution = () => {
     if (userBalance < 100) return alert("Nu ai 100 de pixeli pentru a înăbuși revoluția!");
     if (revolution.progress <= 0) return alert("Nu există nicio revoltă activă!");
     onUpdateBalance(-100);
     const newRev = { ...revolution };
     newRev.progress = Math.max(0, newRev.progress - 10);
     saveRevolution(newRev);
  };

  const players = (() => {
    const seen = new Set();
    return purchasedPixels
      .filter(p => p.country === countryName)
      .filter(p => { if (seen.has(p.name)) return false; seen.add(p.name); return true; })
      .slice(0, 100);
  })();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !uploadFor) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const maxDim = Math.max(img.width, img.height);
        let targetPixels = 25;
        if (maxDim > 50 && maxDim <= 150) targetPixels = 50;
        else if (maxDim > 150) targetPixels = 100;
        const player = players.find(p => p.name === uploadFor);
        const newData = {
          imageBase64: event.target.result,
          ownerName: uploadFor,
          ownerWebsite: player?.website || '',
          ownerInstagram: player?.instagram || '',
          targetPixels,
          currentPixels: 1,
          supporters: [{ name: uploadFor, timestamp: Date.now() }]
        };
        saveLogo(uploadFor, newData);
        setUploadFor(null);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSupport = (playerName) => {
    const data = getLogo(playerName);
    if (!data) return;
    const updated = {
      ...data,
      currentPixels: data.currentPixels + 1,
      supporters: [...(data.supporters || []), { name: userName || 'Anonim', timestamp: Date.now() }]
    };
    saveLogo(playerName, updated);
    if (onBuyPixelsForLogo) onBuyPixelsForLogo(countryName);
    if (selectedLogo?.player.name === playerName) {
      setSelectedLogo({ player: selectedLogo.player, logoData: updated });
    }
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-5 gap-1.5">
        {players.map((player, i) => {
          const logo = getLogo(player.name);
          const isComplete = logo && logo.currentPixels >= logo.targetPixels;
          const progress = logo ? Math.min(100, Math.round((logo.currentPixels / logo.targetPixels) * 100)) : 0;
          const initials = getInitials(player.name);
          const gradient = stringToGradient(player.name);
          const totalPx = playerPixelCounts[player.name] || 1;
          
          let rankIcon = null;
          if (totalPx >= 1000) rankIcon = '👑';
          else if (totalPx >= 500) rankIcon = '🏛️';
          else if (totalPx >= 100) rankIcon = '⭐';

          return (
            <div
              key={i}
              className="relative group cursor-pointer"
              onClick={() => setSelectedLogo({ player, logoData: getLogo(player.name) })}
              title={player.name}
            >
              <div
                className="w-full aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 group-hover:scale-110 group-hover:border-neonCyan group-hover:shadow-[0_0_10px_rgba(0,243,255,0.5)] shadow-md relative"
                style={{ borderColor: isComplete ? '#00f3ff' : 'rgba(255,255,255,0.12)', backgroundColor: 'black' }}
              >
                {rankIcon && (
                   <div className="absolute -top-1.5 -right-1.5 text-xs sm:text-sm drop-shadow-[0_0_3px_black] z-10 pointer-events-none">
                     {rankIcon}
                   </div>
                )}
                {player.name === emperor && revolution.progress > 0 && (
                   <div className="absolute -bottom-1.5 -right-1.5 text-sm drop-shadow-[0_0_5px_red] z-10 pointer-events-none animate-pulse">
                     🔥
                   </div>
                )}
                {logo?.imageBase64 ? (
                  <img
                    src={logo.imageBase64}
                    alt={player.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-black text-xs"
                    style={{ background: gradient }}
                  >
                    {initials}
                  </div>
                )}
                {logo && !isComplete && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                    <div className="h-0.5 bg-neonCyan" style={{ width: `${progress}%` }} />
                  </div>
                )}
                {isComplete && (
                  <div className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {players.length === 0 && (
        <div className="text-center text-gray-500 text-xs py-4">Niciun patriot în această țară.</div>
      )}

      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      {selectedLogo && createPortal((() => {
        const { player, logoData } = selectedLogo;
        const pixelCount = purchasedPixels.filter(p => p.name === player.name && p.country === countryName).length;
        const rank = getRank(pixelCount);
        const gradient = stringToGradient(player.name);
        const badges = getPlayerBadges(pixelCount, player.name);
        const rarestBadge = badges[badges.length - 1];

        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto" onClick={() => setSelectedLogo(null)}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div
              className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(0,243,255,0.15)] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="h-1.5 w-full" style={{ background: gradient }} />
              
              <div className="p-8">
                <button onClick={() => setSelectedLogo(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 bg-white/5 rounded-full transition-colors hover:bg-white/10">
                  <X size={20} />
                </button>

                <div className="flex gap-6 mb-8 items-center">
                  <div
                    className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-[3px] shadow-2xl"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'black' }}
                  >
                    {logoData?.imageBase64 ? (
                      <img src={logoData.imageBase64} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-black text-3xl" style={{ background: gradient }}>
                        {getInitials(player.name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-3xl leading-tight truncate tracking-tight">{player.name}</h3>
                    <div className={`text-sm font-bold uppercase tracking-wider mt-2 ${rank.color}`}>{rank.icon} {rank.title}</div>
                    <div className="text-sm text-gray-400 mt-1 font-medium">{pixelCount} pixeli deținuți în {countryName}</div>
                  </div>
                </div>

                {player.name === emperor && (
                  <div className="mb-8 bg-black/60 border border-red-500/40 rounded-xl p-5 shadow-[0_0_20px_rgba(255,0,0,0.2)] relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 opacity-60 animate-pulse pointer-events-none"></div>
                     <div className="relative z-10">
                       <div className="flex justify-between items-center mb-3">
                         <h3 className="text-red-400 font-black tracking-widest text-sm flex items-center gap-2">
                           🔥 REVOLUȚIE ACTIVĂ
                         </h3>
                         <span className="text-white font-bold text-lg">{revolution.progress}%</span>
                       </div>
                       
                       <div className="w-full h-4 bg-black/80 border border-red-500/30 rounded-full overflow-hidden mb-4 shadow-inner">
                         <div 
                           className="h-full bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-500 shadow-[0_0_10px_rgba(255,0,0,0.8)]"
                           style={{ width: `${revolution.progress}%` }}
                         ></div>
                       </div>
                       
                       <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                         Dacă bara atinge 100%, <strong>{emperor}</strong> va fi detronat și va pierde 50% din pixeli în favoarea revoluționarilor!
                       </p>

                       <div className="flex items-center justify-center">
                          {userName === emperor ? (
                            <button 
                              onClick={handleSuppressRevolution}
                              className="w-full py-3 text-sm font-black uppercase tracking-widest bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/50 rounded-lg transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            >
                              🛡️ Înăbușă Revolta (100 px = -10%)
                            </button>
                          ) : (
                            <button 
                              onClick={handleInciteRevolution}
                              className="w-full py-3 text-sm font-black uppercase tracking-widest bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/50 rounded-lg transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                            >
                              🔥 Susține Revoluția (50 px = +5%)
                            </button>
                          )}
                       </div>
                     </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {player.instagram && (
                    <a href={`https://instagram.com/${player.instagram.replace('@','')}`} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-pink-500/10 border border-pink-500/30 rounded-xl p-3 hover:bg-pink-500/20 transition-all hover:scale-105">
                      <span className="text-pink-400 text-sm font-bold">📸 @{player.instagram.replace('@','')}</span>
                    </a>
                  )}
                  {player.website && (
                    <a href={player.website.startsWith('http') ? player.website : `https://${player.website}`} target="_blank" rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-neonCyan/10 border border-neonCyan/30 rounded-xl p-3 hover:bg-neonCyan/20 transition-all hover:scale-105">
                      <LinkIcon size={14} className="text-neonCyan" />
                      <span className="text-neonCyan text-sm font-bold truncate">{player.website}</span>
                    </a>
                  )}
                </div>

                {player.bio && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8">
                    <p className="text-gray-200 text-sm italic font-medium leading-relaxed">"{player.bio}"</p>
                  </div>
                )}

                {/* Invest System */}
                <div className="bg-black/50 border border-neonCyan/30 rounded-lg p-3 mb-8 flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(0,243,255,0.1)]">
                   <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 bg-black border border-white/20 rounded py-2 px-2 text-white focus:outline-none focus:border-neonCyan text-center font-bold text-sm"
                      />
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Pixeli</span>
                   </div>
                   <button
                     onClick={() => {
                        if (onInvestInUser) {
                           const success = onInvestInUser(player.name, investAmount);
                           if (!success) alert("Fonduri insuficiente!");
                           else {
                             // Also trigger the local support logic to grow the logo locally!
                             handleSupport(player.name);
                           }
                        }
                     }}
                     className="flex-1 py-2 bg-neonCyan/20 hover:bg-neonCyan/40 text-neonCyan border border-neonCyan/50 hover:border-neonCyan transition-all rounded font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-widest"
                   >
                     💎 Investește
                   </button>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Insigne Obținute</h4>
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge, idx) => (
                      <div key={idx} title={badge.name} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${badge.bg} ${badge.border} ${badge.color} text-xs font-bold shadow-sm`}>
                        <span className="text-base">{badge.icon}</span>
                        <span>{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Cea Mai Rară Insignă</span>
                  <div className={`flex flex-col items-center justify-center gap-2 w-full max-w-xs p-4 rounded-xl border ${rarestBadge.bg} ${rarestBadge.border} shadow-lg relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-20" style={{ background: gradient }} />
                    <span className="text-4xl drop-shadow-lg z-10 relative">{rarestBadge.icon}</span>
                    <div className="text-center z-10 relative">
                      <div className={`font-black text-lg ${rarestBadge.color}`}>{rarestBadge.name}</div>
                      <div className="text-[10px] uppercase font-bold text-white/70 tracking-widest">{rarestBadge.rarity}</div>
                    </div>
                  </div>
                </div>

                {!logoData && player.name === userName && (
                  <button onClick={() => { setUploadFor(player.name); setSelectedLogo(null); setTimeout(() => fileInputRef.current?.click(), 100); }}
                    className="w-full mt-6 bg-neonCyan/20 hover:bg-neonCyan/40 border border-neonCyan text-neonCyan font-black py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:scale-105">
                    <Upload size={16} /> ADAUGĂ LOGO-UL TĂU
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })(), document.body)}
    </div>
  );
}
