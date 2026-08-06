import React from 'react';
import { X, Lock } from 'lucide-react';
import { checkMedals } from '../utils/medals';

export default function MedalProfile({ isOpen, onClose, purchasedPixels = [], conqueredCountries = 0 }) {
  if (!isOpen) return null;

  const userMedals = checkMedals(purchasedPixels, conqueredCountries);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[80vh] bg-[#0a0a1a]/95 border border-[#bc13fe]/40 rounded-2xl shadow-[0_0_30px_rgba(188,19,254,0.3)] flex flex-col overflow-hidden glass-panel">
        
        {/* Header */}
        <div className="p-6 border-b border-[#00f3ff]/30 flex justify-between items-center bg-gradient-to-r from-[#bc13fe]/10 to-transparent">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-wider flex items-center gap-3">
              <span className="text-2xl">🎖️</span>
              PROFIL <span className="text-[#bc13fe]">MEDALII</span>
            </h2>
            <p className="text-sm text-gray-400 font-mono mt-1">Colecția ta de realizări în dominația globală</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Medals Grid */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {userMedals.map((medal) => (
              <div 
                key={medal.id}
                className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col items-center text-center ${
                  medal.unlocked 
                    ? 'border-[#00f3ff]/50 bg-gradient-to-b from-[#00f3ff]/10 to-black/40 shadow-[0_0_15px_rgba(0,243,255,0.2)] hover:scale-105' 
                    : 'border-gray-800 bg-gray-900/50 grayscale opacity-70'
                }`}
              >
                {!medal.unlocked && (
                  <div className="absolute top-2 right-2 text-gray-500">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`text-4xl mb-3 ${medal.unlocked ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`}>
                  {medal.icon}
                </div>
                
                <h3 className={`font-bold mb-2 ${medal.unlocked ? 'text-[#00f3ff]' : 'text-gray-500'}`}>
                  {medal.name}
                </h3>
                
                <p className="text-xs text-gray-400 font-mono flex-grow">
                  {medal.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
