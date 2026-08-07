import React, { useState, useEffect, useRef } from 'react';
import { X, AtSign, ChevronDown, ChevronUp, Shield, ArrowRight } from 'lucide-react';
import { getRank } from '../utils/ranks';
import AlliancePanel from './AlliancePanel';

export default function CountryDetailsModal({ country, pixels, onClose, alliances = [], onAddAlliance, onInvestInUser, countryBankFunds = {}, onDonateToBank }) {
  const [expandedUser, setExpandedUser] = useState(null);
  const [showAlliancePanel, setShowAlliancePanel] = useState(false);
  const [isoMap, setIsoMap] = useState({});
  const [investAmount, setInvestAmount] = useState({});
  const dragRef = useRef(false);
  const bankFund = countryBankFunds[country.ADMIN] || 0;

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
         const map = {};
         data.features.forEach(f => {
           if (f.properties.ISO_A2 && f.properties.ISO_A2 !== '-99') {
              map[f.properties.ADMIN] = f.properties.ISO_A2.toLowerCase();
           }
         });
         setIsoMap(map);
      })
      .catch(console.error);
  }, []);

  // Group pixels by user
  const userMap = {};
  pixels.forEach(p => {
    if (!userMap[p.name]) {
      userMap[p.name] = { name: p.name, instagram: p.instagram, totalPixels: 0 };
    }
    userMap[p.name].totalPixels += 1;
    // Prefer non-empty instagram
    if (p.instagram && !userMap[p.name].instagram) {
      userMap[p.name].instagram = p.instagram;
    }
  });

  const sortedUsers = Object.values(userMap).sort((a, b) => b.totalPixels - a.totalPixels);
  const totalOccupied = pixels.length;
  const MAX_CAPACITY = 5000;
  const percentOccupied = Math.min(100, (totalOccupied / MAX_CAPACITY) * 100);
  
  // Country code for flag
  let isoA2 = isoMap[country.ADMIN];
  if (!isoA2 && country.ISO_A2 && country.ISO_A2 !== '-99') {
     isoA2 = country.ISO_A2.toLowerCase();
  }
  const flagUrl = isoA2 ? `https://flagcdn.com/w80/${isoA2}.png` : '';

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      <div className="min-h-full flex items-center justify-center p-3 py-6">
      <div className="glass-panel w-full max-w-2xl rounded-2xl flex flex-col border border-neonCyan/40 shadow-[0_0_50px_rgba(0,243,255,0.15)] overflow-hidden relative" style={{maxHeight:'min(85vh,700px)'}}>
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/10 bg-black/40 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            {flagUrl && (
              <img src={flagUrl} alt="Flag" className="w-12 h-auto md:w-16 rounded border border-white/20 shadow-md" />
            )}
            <div>
              <h2 className="text-xl md:text-3xl font-black text-white uppercase tracking-wider glow-text">{country.ADMIN}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full shrink-0">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 md:px-6 py-4 bg-white/5 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Grad de Ocupare</span>
            <span className="text-sm font-black text-neonCyan">{percentOccupied.toFixed(2)}%</span>
          </div>
          <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden border border-white/10">
            <div 
              className="h-full bg-neonCyan shadow-[0_0_10px_#00f3ff] transition-all duration-1000"
              style={{ width: `${percentOccupied}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden">
          
          {/* Left Column: Economy & Alliances */}
          <div className="w-full md:w-[35%] flex flex-col border-b md:border-b-0 md:border-r border-white/10 bg-black/20 overflow-y-auto custom-scrollbar">
            
            {/* Active Alliances (Premium UX, Max 2) */}
            <div className="p-6 pb-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-neonCyan" /> Alianțe Supreme
              </h4>
              <div className="flex flex-col gap-3">
                {alliances.filter(a => a.countryA === country.ADMIN || a.countryB === country.ADMIN)
                  .filter(a => Math.ceil((a.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)) > 0)
                  .slice(0, 2)
                  .map((a, i) => {
                    const partner = a.countryA === country.ADMIN ? a.countryB : a.countryA;
                    const daysLeft = Math.ceil((a.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={i} className="relative group overflow-hidden bg-gradient-to-br from-neonCyan/10 to-blue-900/30 border border-neonCyan/30 rounded-xl p-4 flex items-center justify-between shadow-[0_0_15px_rgba(0,243,255,0.15)] transition-all hover:shadow-[0_0_25px_rgba(0,243,255,0.3)] hover:-translate-y-1">
                        <div className="absolute inset-0 bg-neonCyan/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="flex items-center gap-3 relative z-10">
                           <div className="w-10 h-10 rounded-full border border-neonCyan/50 bg-black/50 flex items-center justify-center text-xl shadow-[0_0_10px_rgba(0,243,255,0.4)]">
                              🤝
                           </div>
                           <div className="flex flex-col">
                              <span className="font-black text-white uppercase tracking-wider">{partner}</span>
                              <span className="text-xs font-bold text-neonCyan">Pact de Neagresiune</span>
                           </div>
                        </div>
                        <div className="text-right relative z-10">
                           <div className="text-2xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">{daysLeft}</div>
                           <div className="text-[10px] text-neonCyan uppercase tracking-widest">Zile</div>
                        </div>
                      </div>
                    );
                })}
                {alliances.filter(a => a.countryA === country.ADMIN || a.countryB === country.ADMIN).length === 0 && (
                  <div className="text-sm text-gray-500 italic p-4 text-center border border-dashed border-gray-700 rounded-xl">Nicio alianță activă.</div>
                )}
              </div>
            </div>

            {/* National Bank / Economy */}
            <div className="p-6">
              <div className="bg-black/60 border border-yellow-500/30 rounded-xl p-5 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] transition-shadow">
                <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="text-xl">🏦</span> Banca Centrală
                </h4>
                
                {bankFund >= 1000 ? (
                  <div className="text-sm font-bold text-green-400 bg-green-500/10 p-4 rounded-xl border border-green-500/30 flex items-center gap-3">
                    <span className="animate-pulse text-2xl">💰</span>
                    <div className="flex flex-col">
                      <span>Construită!</span>
                      <span className="text-xs text-green-300">Generare Activă: +1 Px/oră</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-mono font-bold text-gray-300">
                      <span>Fonduri: <span className="text-yellow-400">{bankFund}</span> / 1000</span>
                      <span className="text-yellow-500">{((bankFund / 1000) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/10">
                      <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-2 shadow-[0_0_10px_#eab308]" style={{ width: `${(bankFund / 1000) * 100}%` }}></div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => onDonateToBank(10)}
                        className="flex-1 py-2 bg-yellow-500/10 hover:bg-yellow-500/30 border border-yellow-500/40 hover:border-yellow-400 text-yellow-400 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
                      >
                        10 💎
                      </button>
                      <button 
                        onClick={() => onDonateToBank(100)}
                        className="flex-1 py-2 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/60 hover:border-yellow-400 text-yellow-300 rounded-lg text-sm font-black transition-all flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                      >
                        100 💎
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 mt-auto">
              <button 
                onClick={() => setShowAlliancePanel(true)}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-700 border border-white/20 hover:border-neonCyan/50 hover:from-gray-700 hover:to-gray-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-neonCyan/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Shield className="w-5 h-5 text-neonCyan transition-transform group-hover:scale-110" />
                <span className="relative z-10 uppercase tracking-widest text-sm">Diplomație</span>
                <ArrowRight className="w-4 h-4 ml-2 text-neonCyan transition-transform group-hover:translate-x-1 relative z-10" />
              </button>
            </div>
          </div>

          {/* Right Column: Users List */}
          <div 
            className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar bg-black/10"
            onPointerDown={(e) => dragRef.current = { x: e.clientX, y: e.clientY, dragged: false }}
            onPointerMove={(e) => {
               if (dragRef.current && !dragRef.current.dragged) {
                  const dx = Math.abs(e.clientX - dragRef.current.x);
                  const dy = Math.abs(e.clientY - dragRef.current.y);
                  if (dx > 10 || dy > 10) dragRef.current.dragged = true;
               }
            }}
          >
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="text-neonCyan">⭐</span> Jucători Top
            </h4>
            {sortedUsers.map((user, idx) => {
              const rank = getRank(user.totalPixels); // 1 pixel = 1 dollar
              const isExpanded = expandedUser === user.name;
              
              return (
                <div key={idx} className={`rounded-2xl border transition-all duration-300 ${isExpanded ? `bg-gradient-to-br from-white/10 to-transparent ${rank.border}` : 'bg-black/60 border-white/5 hover:border-white/20 hover:bg-black/40'}`}>
                  {/* User Row (Clickable) */}
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer"
                    onClick={(e) => {
                      if (dragRef.current && dragRef.current.dragged) {
                        e.preventDefault();
                        return;
                      }
                      setExpandedUser(isExpanded ? null : user.name);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="font-bold text-gray-500 w-6 text-right">#{idx + 1}</div>
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl border-[3px] shadow-lg ${rank.bg} ${rank.border}`}>
                        {rank.icon}
                      </div>
                      <div>
                        <div className="font-black text-xl text-white">{user.name}</div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest ${rank.color}`}>
                          {rank.title}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neonCyan to-blue-400 drop-shadow-[0_0_8px_rgba(0,243,255,0.6)]">${user.totalPixels}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Investiție</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                         {isExpanded ? <ChevronUp className="w-5 h-5 text-neonCyan" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-4 border-t border-white/10 bg-black/40 animate-in slide-in-from-top-4">
                      <div className="flex gap-4 items-center mb-6">
                        {user.instagram ? (
                          <a 
                            href={`https://instagram.com/${user.instagram.replace('@', '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(219,39,119,0.3)]"
                          >
                            <AtSign className="w-5 h-5" />
                            @{user.instagram.replace('@', '')}
                          </a>
                        ) : (
                          <div className="text-gray-500 text-sm italic bg-white/5 px-4 py-2 rounded-lg">Fără Instagram.</div>
                        )}
                        
                        <div className="ml-auto text-sm font-bold text-gray-400 bg-white/5 px-4 py-2.5 rounded-xl border border-white/10">
                          Total Pixeli: <span className="text-neonCyan font-black">{user.totalPixels}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 bg-gradient-to-r from-white/5 to-transparent p-4 rounded-xl border border-white/10">
                         <div className="flex items-center bg-black/50 rounded-lg overflow-hidden border border-white/20">
                           <input 
                             type="number"
                             value={investAmount[user.name] || 10}
                             onChange={(e) => setInvestAmount({...investAmount, [user.name]: Math.max(1, parseInt(e.target.value) || 1)})}
                             className="w-24 bg-transparent py-3 px-3 text-white focus:outline-none focus:bg-white/5 text-center font-black text-lg appearance-none"
                           />
                           <div className="px-4 py-3 bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-widest border-l border-white/10">Px</div>
                         </div>
                         
                         <button
                           onClick={() => {
                              if(onInvestInUser) {
                                 const success = onInvestInUser(user.name, investAmount[user.name] || 10);
                                 if(!success) alert("Fonduri insuficiente!");
                              }
                           }}
                           className="flex-1 py-3 bg-neonCyan/20 hover:bg-neonCyan/40 text-neonCyan border border-neonCyan/50 hover:border-neonCyan transition-all rounded-lg font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,243,255,0.3)] uppercase tracking-widest"
                         >
                           💎 Susține cu Pixeli
                         </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Alliance Panel Overlay */}
        {showAlliancePanel && (
          <div className="absolute inset-0 z-10 bg-black/95 backdrop-blur-md animate-in slide-in-from-bottom-full duration-300 overflow-y-auto custom-scrollbar">
            <AlliancePanel 
              country={country} 
              onAddAlliance={onAddAlliance}
              onClose={() => setShowAlliancePanel(false)} 
            />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
