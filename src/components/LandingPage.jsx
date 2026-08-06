import React from 'react';
import { Crosshair, Shield, Zap, Globe2 } from 'lucide-react';

export default function LandingPage({ onStart }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-md animate-in fade-in duration-1000">
      
      <div className="min-h-full flex items-center justify-center p-4 py-12">
        <div className="max-w-4xl w-full mx-auto relative">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neonCyan/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-neonPurple/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          
          <h1 className="text-6xl md:text-7xl font-black text-white mb-4 tracking-tighter">
            HEX<span className="text-neonCyan drop-shadow-[0_0_15px_rgba(0,243,255,0.8)]">GLOBE</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light mb-12 max-w-2xl">
            Lumea digitală se rescrie chiar acum. Fii printre primii care își lasă amprenta. <span className="text-white font-bold">Țara ta are nevoie de tine!</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full">
            
            {/* Step 1 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-neonCyan/50 transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-14 h-14 mx-auto bg-neonCyan/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-neonCyan/30 transition-colors">
                <Globe2 className="w-7 h-7 text-neonCyan" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">1. Alege-ți Țara</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Explorează globul interactiv 3D și selectează teritoriul pe care vrei să îl reprezinți.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-neonPurple/50 transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-14 h-14 mx-auto bg-neonPurple/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-neonPurple/30 transition-colors">
                <Shield className="w-7 h-7 text-neonPurple" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">2. Recrutează Armata</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Cu doar 1$, cumpără un Pixel Holografic. Numele tău va fi gravat direct pe hartă!
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-red-500/50 transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="w-14 h-14 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                <Crosshair className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">3. Dominația Globală</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                La 100 de pixeli, țara ta devine <span className="text-red-400 font-bold">Superputere</span> și deblochează modul de ATAC asupra altor state.
              </p>
            </div>

          </div>

          <button 
            onClick={onStart}
            className="group relative px-12 py-5 bg-transparent overflow-hidden rounded-xl"
          >
            <div className="absolute inset-0 w-full h-full bg-neonCyan/20 group-hover:bg-neonCyan/40 transition-colors duration-300"></div>
            <div className="absolute inset-0 w-full h-full border-2 border-neonCyan rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.4)] group-hover:shadow-[0_0_40px_rgba(0,243,255,0.8)] transition-all duration-300"></div>
            <div className="relative z-10 flex items-center gap-3">
              <Zap className="w-6 h-6 text-neonCyan animate-pulse" />
              <span className="text-neonCyan font-black text-xl uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,243,255,1)]">
                Intră în Bătălie
              </span>
            </div>
          </button>
          
        </div>
      </div>
    </div>
  );
}
