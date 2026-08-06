import React, { useEffect, useState } from 'react';
import { AlertOctagon } from 'lucide-react';

export default function AttackAlert({ attack }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3800);
    return () => clearTimeout(timer);
  }, [attack]);

  if (!isVisible || !attack || !attack.source) return null;

  return (
    <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="bg-black/80 backdrop-blur-md border-2 border-red-500 rounded-2xl p-6 shadow-[0_0_50px_rgba(255,0,0,0.6)] flex flex-col items-center animate-in zoom-in-50 slide-in-from-top-10 duration-500">
        <div className="flex items-center gap-4 mb-2 animate-pulse">
          <AlertOctagon className="w-12 h-12 text-red-500" />
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 uppercase tracking-widest">
            Invazie Detectată
          </h2>
          <AlertOctagon className="w-12 h-12 text-red-500" />
        </div>
        
        <div className="text-2xl font-bold text-white text-center mt-2 flex items-center gap-3">
          <span className="text-red-400 uppercase drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">{attack.source}</span>
          <span className="text-gray-400 text-lg">ATACĂ</span>
          <span className="text-neonCyan uppercase drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]">{attack.target}</span>
        </div>
        
        <div className="mt-4 text-xs font-mono text-red-300 uppercase tracking-widest bg-red-500/20 px-4 py-1 rounded-full border border-red-500/30">
          Toate sistemele de apărare activate
        </div>
      </div>
      
      {/* Visual Glitch/Flash effect on the whole screen */}
      <div className="fixed inset-0 bg-red-500/10 pointer-events-none animate-pulse mix-blend-screen" style={{ zIndex: -1 }}></div>
    </div>
  );
}
