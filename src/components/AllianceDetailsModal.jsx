import React, { useState, useRef, useEffect } from 'react';
import { X, Shield, Users, MapPin, ExternalLink, Activity, Trophy, Swords, Upload } from 'lucide-react';

export default function AllianceDetailsModal({ alliance, purchasedPixels, onClose, onViewCreator, onAttackAlliance }) {
  const [amount, setAmount] = useState(10);
  const [alliancePic, setAlliancePic] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`hexglobe_alliance_${alliance.name}`);
      if (saved) setAlliancePic(saved);
    } catch(e) {}
  }, [alliance.name]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      localStorage.setItem(`hexglobe_alliance_${alliance.name}`, base64);
      setAlliancePic(base64);
    };
    reader.readAsDataURL(file);
  };
  if (!alliance) return null;

  // Calculate alliance stats based on the creator's pixels and the countries involved
  const pixelsA = purchasedPixels.filter(p => p.country === alliance.countryA).length;
  const pixelsB = purchasedPixels.filter(p => p.country === alliance.countryB).length;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      <div 
         className="glass-panel w-full max-w-md rounded-2xl flex flex-col border shadow-2xl overflow-hidden relative"
         style={{ borderColor: `${alliance.color}80`, boxShadow: `0 0 40px ${alliance.color}30` }}
      >
        
        {/* Header (Crest & Name) */}
        <div className="p-8 pb-6 border-b border-white/10 bg-black/60 relative overflow-hidden flex flex-col items-center">
           <div 
              className="absolute inset-0 opacity-20" 
              style={{ background: `radial-gradient(circle at center, ${alliance.color}, transparent 70%)` }}
           ></div>
           
           <div className="relative group">
               <div className="relative z-10 w-24 h-28 flex items-center justify-center text-5xl mb-4 border-2 rounded-[12px_12px_36px_36px] bg-black shadow-lg overflow-hidden"
                    style={{ borderColor: alliance.color, boxShadow: `0 0 20px ${alliance.color}60` }}
               >
                  {alliancePic ? (
                     <img src={alliancePic} alt={alliance.name} className="w-full h-full object-cover" />
                  ) : (
                     <span style={{ filter: `drop-shadow(0 0 10px ${alliance.color})` }}>{alliance.crest}</span>
                  )}
                  
                  <div 
                     className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity z-20"
                     onClick={() => fileInputRef.current?.click()}
                  >
                     <Upload className="w-6 h-6 text-white mb-1" />
                     <span className="text-[10px] font-bold text-white uppercase tracking-widest text-center">Set Logo</span>
                  </div>
               </div>
               <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
           </div>
           
           <h2 className="relative z-10 text-3xl font-black text-white uppercase tracking-wider glow-text text-center">
              {alliance.name}
           </h2>
           
           {/* HP Bar */}
           <div className="relative z-10 w-full mt-4 flex flex-col items-center">
              <div className="flex justify-between w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                 <span>HP Alianță</span>
                 <span className={alliance.hp < 300 ? 'text-red-400' : 'text-green-400'}>{alliance.hp} / {alliance.maxHp}</span>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full border border-white/10 overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-500 ${alliance.hp < 300 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`}
                   style={{ width: `${Math.max(0, Math.min(100, (alliance.hp / alliance.maxHp) * 100))}%` }}
                 />
              </div>
           </div>
        </div>

        {/* Conqueror Badge */}
        {alliance.conqueror && (
           <div className="bg-red-500/20 border-b border-red-500/50 p-2 flex items-center justify-center gap-2">
              <span className="text-xl">⚠️</span>
              <span className="text-xs font-bold text-white uppercase tracking-widest">Ocupat de: <span className="text-red-400">{alliance.conqueror}</span></span>
              {alliance.conquerorFlag && (
                <img src={`https://flagcdn.com/w20/${alliance.conquerorFlag}.png`} alt="Flag" className="h-3 ml-1" />
              )}
           </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4 bg-black/40">
           
           {/* Creator Info */}
           <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-lg font-bold border border-white/20">
                    {alliance.creator ? alliance.creator.charAt(0).toUpperCase() : '?'}
                 </div>
                 <div>
                    <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">Fondator Suprem</div>
                    <div className="text-white font-bold">{alliance.creator || 'Necunoscut'}</div>
                 </div>
              </div>
              <button 
                 onClick={() => onViewCreator(alliance.creator)}
                 className="text-xs font-bold uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors border border-white/20"
              >
                 Profil
              </button>
           </div>

           {/* Stats Grid */}
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                 <MapPin className="w-5 h-5 text-neonCyan mx-auto mb-1 opacity-70" />
                 <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Zona Controlată</div>
                 <div className="text-xs font-bold text-white">{alliance.countryA}</div>
                 <div className="text-xs font-bold text-white">{alliance.countryB}</div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                 <Activity className="w-5 h-5 text-red-400 mx-auto mb-1 opacity-70" />
                 <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Putere Militară</div>
                 <div className="text-sm font-bold text-white">{pixelsA + pixelsB} Pixeli</div>
                 <div className="text-[10px] text-green-400">Armată Activă</div>
              </div>
           </div>

           {/* Website & Custom Logo */}
           <div className="bg-white/5 border border-white/10 rounded-lg p-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-300">Website Oficial</span>
                 </div>
                 <a 
                    href={alliance.website ? (alliance.website.startsWith('http') ? alliance.website : `https://${alliance.website}`) : '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#00f3ff] hover:underline"
                 >
                    {alliance.website || 'Nu a fost setat'}
                 </a>
              </div>
              
              {/* Custom Logo Display */}
              {alliance.logoUrl && (
                 <div className="mt-1 pt-3 border-t border-white/10 flex flex-col items-center gap-2">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono self-start">Logo Oficial (HD)</span>
                    <div className="w-full flex justify-center p-2 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                       <img 
                          src={alliance.logoUrl} 
                          alt={`${alliance.name} Logo`} 
                          className="w-32 h-32 object-cover rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10"
                       />
                    </div>
                 </div>
              )}
           </div>

        </div>

        {/* Action Buttons / Attack System */}
        <div className="p-4 border-t border-white/10 bg-black/60 flex flex-col gap-3">
           <div className="flex items-center gap-3">
              <input 
                 type="number" 
                 value={amount} 
                 onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                 className="w-24 bg-black/50 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-neonCyan text-center font-bold"
              />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pixeli ($)</span>
              
              <div className="flex-1 flex justify-end gap-2">
                 <button 
                   onClick={() => {
                      if(onAttackAlliance) {
                         const success = onAttackAlliance(alliance.name, amount, true);
                         if(!success) alert("Fonduri insuficiente!");
                      }
                   }}
                   className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-green-600/80 hover:bg-green-500 transition-colors uppercase tracking-widest flex items-center gap-1"
                 >
                   🛡️ Apără
                 </button>
                 <button 
                   onClick={() => {
                      if(onAttackAlliance) {
                         const success = onAttackAlliance(alliance.name, amount, false);
                         if(!success) alert("Fonduri insuficiente!");
                      }
                   }}
                   className="px-4 py-2 rounded-lg text-sm font-black text-white bg-red-600 hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all uppercase tracking-widest flex items-center gap-1"
                 >
                   <Swords className="w-4 h-4" /> Atacă
                 </button>
              </div>
           </div>
           
           <button 
             onClick={onClose}
             className="w-full py-2 rounded-lg text-sm font-bold text-white bg-white/10 hover:bg-white/20 transition-colors uppercase tracking-widest"
           >
             Închide
           </button>
        </div>
        
      </div>
    </div>
  );
}
