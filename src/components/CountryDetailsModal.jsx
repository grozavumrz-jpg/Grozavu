import React, { useState, useEffect } from 'react';
import { X, AtSign, ChevronDown, ChevronUp, Shield, ArrowRight } from 'lucide-react';
import { getRank } from '../utils/ranks';
import AlliancePanel from './AlliancePanel';

export default function CountryDetailsModal({ country, pixels, onClose, alliances = [], onAddAlliance, onInvestInUser, countryBankFunds = {}, onDonateToBank }) {
  const [expandedUser, setExpandedUser] = useState(null);
  const [showAlliancePanel, setShowAlliancePanel] = useState(false);
  const [isoMap, setIsoMap] = useState({});
  const [investAmount, setInvestAmount] = useState({});
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      <div className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-2xl flex flex-col border border-neonCyan/40 shadow-[0_0_50px_rgba(0,243,255,0.15)] overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-black/40 flex justify-between items-start">
          <div className="flex gap-4 items-center">
            {flagUrl && (
              <img src={flagUrl} alt="Flag" className="w-16 h-auto rounded border border-white/20 shadow-md" />
            )}
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-wider glow-text">{country.ADMIN}</h2>
              <div className="text-neonCyan font-mono text-sm mt-1">
                {totalOccupied} / {MAX_CAPACITY} Pixeli Ocupați
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 bg-white/5 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-white/5">
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

        {/* Active Alliances */}
        {alliances.length > 0 && (
          <div className="px-6 pb-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3 text-neonCyan" /> Alianțe Active
            </h4>
            <div className="flex flex-wrap gap-2">
              {alliances.map((a, i) => {
                const isCountryA = a.countryA === country.ADMIN;
                const isCountryB = a.countryB === country.ADMIN;
                if (!isCountryA && !isCountryB) return null;
                const partner = isCountryA ? a.countryB : a.countryA;
                const daysLeft = Math.ceil((a.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
                if (daysLeft <= 0) return null;

                return (
                  <div key={i} className="bg-neonCyan/10 border border-neonCyan/30 rounded-full px-3 py-1 flex items-center gap-2 text-xs font-bold text-white shadow-[0_0_10px_rgba(0,243,255,0.1)]">
                    <span>{partner}</span>
                    <span className="text-neonCyan">• {daysLeft} Zile</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* National Bank / Economy */}
        <div className="px-6 pb-4">
          <div className="bg-black/40 border border-white/10 rounded-xl p-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="text-yellow-500">🏦</span> Banca Centrală
            </h4>
            
            {bankFund >= 1000 ? (
              <div className="text-sm font-bold text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/30 flex items-center gap-2">
                <span className="animate-pulse">💰</span> Construită! Generare Activă: +1 Px/oră
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-mono text-gray-400">
                  <span>Fonduri: {bankFund} / 1000</span>
                  <span>{((bankFund / 1000) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-yellow-500 h-1.5 shadow-[0_0_10px_#eab308]" style={{ width: `${(bankFund / 1000) * 100}%` }}></div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => onDonateToBank(10)}
                    className="flex-1 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/50 text-yellow-500 rounded text-xs font-bold transition-all"
                  >
                    Donează 10 💎
                  </button>
                  <button 
                    onClick={() => onDonateToBank(100)}
                    className="flex-1 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/50 text-yellow-500 rounded text-xs font-bold transition-all"
                  >
                    Donează 100 💎
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-4">
          <button 
            onClick={() => setShowAlliancePanel(true)}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all group"
          >
            <Shield className="w-5 h-5 text-gray-400 group-hover:text-neonCyan transition-colors" />
            <span>Diplomație & Alianțe</span>
            <ArrowRight className="w-4 h-4 ml-auto text-gray-500 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3 custom-scrollbar border-t border-white/5">
          {sortedUsers.map((user, idx) => {
            const rank = getRank(user.totalPixels); // 1 pixel = 1 dollar
            const isExpanded = expandedUser === user.name;
            
            return (
              <div key={idx} className={`rounded-xl border transition-all duration-300 ${isExpanded ? `bg-white/10 ${rank.border}` : 'bg-black/40 border-white/5 hover:border-white/20'}`}>
                {/* User Row (Clickable) */}
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedUser(isExpanded ? null : user.name)}
                >
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-gray-500 w-6">#{idx + 1}</div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${rank.bg} ${rank.border}`}>
                      {rank.icon}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-white">{user.name}</div>
                      <div className={`text-xs font-bold uppercase tracking-wider ${rank.color}`}>
                        {rank.title}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xl font-black text-neonCyan">${user.totalPixels}</div>
                      <div className="text-xs text-gray-500">Donați</div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-black/20 animate-in slide-in-from-top-2">
                    <div className="flex gap-4 items-center mb-4">
                      {user.instagram ? (
                        <a 
                          href={`https://instagram.com/${user.instagram.replace('@', '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg"
                        >
                          <AtSign className="w-5 h-5" />
                          @{user.instagram.replace('@', '')}
                        </a>
                      ) : (
                        <div className="text-gray-500 text-sm italic">Nu a conectat Instagram.</div>
                      )}
                      
                      <div className="ml-auto text-sm text-gray-400">
                        Total Pixeli Cumpărați: <span className="text-white font-bold">{user.totalPixels} px</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 p-3 rounded-lg border border-white/10">
                       <input 
                         type="number"
                         value={investAmount[user.name] || 10}
                         onChange={(e) => setInvestAmount({...investAmount, [user.name]: Math.max(1, parseInt(e.target.value) || 1)})}
                         className="w-20 bg-black/50 border border-white/20 rounded py-2 px-2 text-white focus:outline-none focus:border-neonCyan text-center font-bold text-sm"
                       />
                       <span className="text-xs text-gray-400 uppercase tracking-widest">Pixeli</span>
                       
                       <button
                         onClick={() => {
                            if(onInvestInUser) {
                               const success = onInvestInUser(user.name, investAmount[user.name] || 10);
                               if(!success) alert("Fonduri insuficiente!");
                            }
                         }}
                         className="ml-auto px-4 py-2 bg-neonCyan/20 hover:bg-neonCyan/40 text-neonCyan border border-neonCyan/50 hover:border-neonCyan hover:shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all rounded font-bold text-sm flex items-center gap-2"
                       >
                         💎 Investește
                       </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
  );
}
