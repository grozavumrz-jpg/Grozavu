import React, { useState } from 'react';
import { Shield, Clock, Search, X, Users, ScrollText } from 'lucide-react';

export default function AlliancePanel({ country, onAddAlliance, onClose }) {
  const [mode, setMode] = useState('alliance'); // 'alliance' or 'treaty'
  const [targetCountry, setTargetCountry] = useState('');
  const [allianceName, setAllianceName] = useState('');
  const [crest, setCrest] = useState('🛡️');
  const [color, setColor] = useState('#00f3ff');
  const [duration, setDuration] = useState(7);
  const [isSent, setIsSent] = useState(false);

  const crestOptions = ['🛡️', '🐺', '🦅', '🐉', '🐍', '🦁', '🐅', '👁️', '⚔️', '👑', '🔥', '🌊'];

  const handleSend = () => {
    if (mode === 'alliance' && !allianceName.trim()) return;
    if (mode === 'treaty' && !targetCountry.trim()) return;
    
    // Simulate accepting instantly for mock purposes
    onAddAlliance({
      countryA: country.ADMIN,
      countryB: mode === 'treaty' ? targetCountry : 'Global',
      name: mode === 'alliance' ? allianceName : `Pact de Pace (${country.ADMIN} - ${targetCountry})`,
      crest: mode === 'alliance' ? crest : '🕊️',
      color: mode === 'alliance' ? color : '#ffffff',
      durationDays: mode === 'treaty' ? duration : 3650
    });
    setIsSent(true);
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  if (isSent) {
    return (
      <div className="p-6 text-center animate-in zoom-in duration-300">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${mode === 'treaty' ? 'bg-white/20 border-white text-white' : 'bg-neonCyan/20 border-neonCyan text-neonCyan'}`}>
          {mode === 'treaty' ? <ScrollText className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
           {mode === 'treaty' ? 'Tratat Semnat!' : 'Alianță Înființată!'}
        </h3>
        <p className="text-gray-400 text-sm">
           {mode === 'treaty' 
             ? `Ați semnat un pact de neagresiune cu ${targetCountry} pentru ${duration} zile.` 
             : `Alianța ${allianceName} a fost creată cu succes pe teritoriul tău.`}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-neonCyan" />
            Diplomație & Alianțe
          </h3>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Alege acțiunea dorită</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-black/50 p-1 rounded-lg mb-6 border border-white/10">
         <button 
           onClick={() => setMode('alliance')}
           className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 ${mode === 'alliance' ? 'bg-neonCyan/20 text-neonCyan shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-gray-400 hover:text-white'}`}
         >
           <Users className="w-4 h-4" /> Formează Alianță
         </button>
         <button 
           onClick={() => setMode('treaty')}
           className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded transition-all flex items-center justify-center gap-2 ${mode === 'treaty' ? 'bg-white/20 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-gray-400 hover:text-white'}`}
         >
           <ScrollText className="w-4 h-4" /> Tratat de Pace
         </button>
      </div>

      <div className="space-y-6">
        
        {mode === 'alliance' && (
           <>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nume Alianță (Ex: Imperiul Dacic)</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Nume Alianță..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-neonCyan focus:ring-1 focus:ring-neonCyan transition-all"
                    value={allianceName}
                    onChange={(e) => setAllianceName(e.target.value)}
                    maxLength={20}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Emblemă Alianță</label>
                <div className="flex flex-wrap gap-2">
                  {crestOptions.map(c => (
                    <button
                      key={c}
                      onClick={() => setCrest(c)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-all ${
                        crest === c 
                        ? 'bg-white/20 border-white shadow-[0_0_10px_rgba(255,255,255,0.2)]' 
                        : 'bg-black/40 border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Culoare Alianță</label>
                <input 
                   type="color" 
                   value={color}
                   onChange={(e) => setColor(e.target.value)}
                   className="w-full h-10 rounded-lg bg-black/40 border border-white/10 cursor-pointer"
                />
              </div>
           </>
        )}

        {mode === 'treaty' && (
           <>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Țara Țintă</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Ex: United States of America"
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                    value={targetCountry}
                    onChange={(e) => setTargetCountry(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Durată Tratat
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 20, 50].map(days => (
                    <button
                      key={days}
                      onClick={() => setDuration(days)}
                      className={`py-2 px-3 rounded-lg border text-sm font-bold transition-all ${
                        duration === days 
                        ? 'bg-white/20 border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                        : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {days} Zile
                    </button>
                  ))}
                </div>
              </div>
           </>
        )}

        <button 
          onClick={handleSend}
          disabled={mode === 'alliance' ? !allianceName.trim() : !targetCountry.trim()}
          className={`w-full py-3 font-black rounded-lg transition-all text-black mt-4 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white disabled:hover:shadow-none ${
             mode === 'alliance' 
               ? 'bg-neonCyan hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:scale-[1.02]' 
               : 'bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.02]'
          }`}
        >
          {mode === 'alliance' ? 'ÎNFIINȚEAZĂ ALIANȚA' : 'PROPUNE TRATAT'}
        </button>
      </div>
    </div>
  );
}
