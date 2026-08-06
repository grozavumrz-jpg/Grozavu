import React from 'react';
import { X, Crosshair, Zap } from 'lucide-react';

export default function UfoPanel({ isOpen, onClose, worldBoss, onAttack }) {
  if (!isOpen || !worldBoss || !worldBoss.active) return null;

  const hpPercent = (worldBoss.hp / worldBoss.maxHp) * 100;

  return (
    <div className="fixed right-4 top-24 w-80 bg-black/90 backdrop-blur-md border border-red-500 rounded-xl shadow-[0_0_30px_rgba(255,0,0,0.4)] z-40 overflow-hidden animate-slide-in">
      <div className="p-4 border-b border-red-500/30 flex justify-between items-center bg-gradient-to-r from-red-900/40 to-black">
        <h2 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
          <span className="text-red-500">⚠️</span> BOSS FIGHT
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className="text-center">
          <div className="text-red-400 font-mono text-sm tracking-widest mb-1">ALIEN MOTHERSHIP</div>
          <div className="text-white text-xs opacity-70 mb-4">Invadând {worldBoss.country.toUpperCase()}</div>
          
          <div className="relative w-full h-4 bg-gray-900 rounded-full overflow-hidden border border-red-900 mb-2">
            <div 
              className="absolute top-0 left-0 h-full bg-red-600 transition-all duration-300"
              style={{ width: `${hpPercent}%`, boxShadow: '0 0 10px red' }}
            />
          </div>
          <div className="text-red-200 font-mono text-xs">
            {worldBoss.hp.toLocaleString()} / {worldBoss.maxHp.toLocaleString()} HP
          </div>
        </div>

        <div className="bg-red-950/30 p-3 rounded-lg border border-red-900/50 text-xs text-gray-300 leading-relaxed">
          Folosește pixelii câștigați din misiuni pentru a ataca nava! Fiecare lovitură provoacă 1000 daune. Dacă învingem, toți patrioții primesc o recompensă specială.
        </div>

        <button 
          onClick={onAttack}
          className="w-full relative group overflow-hidden bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.8)]"
        >
          <div className="absolute inset-0 w-1/4 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:animate-[shimmer_0.7s_forwards]" />
          <Crosshair className="w-5 h-5" />
          ATACĂ (1 Pixel)
          <Zap className="w-4 h-4 ml-1 text-yellow-300 animate-pulse" />
        </button>
      </div>
    </div>
  );
}
