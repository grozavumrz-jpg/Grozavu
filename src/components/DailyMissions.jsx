import React, { useState, useEffect } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { checkAndResetMissions } from '../utils/missions';

export default function DailyMissions({ purchasedPixels = [], isOpen, onClose }) {
  const [missions, setMissions] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    setMissions(checkAndResetMissions(purchasedPixels));
  }, [forceUpdate, purchasedPixels]);

  useEffect(() => {
    if (missions.length === 0) return;
    
    const allCompleted = missions.every(m => m.checkProgress(purchasedPixels) >= m.target);
    const savedStateStr = localStorage.getItem('hexglobe_mission_state');
    if (savedStateStr) {
      try {
        const savedState = JSON.parse(savedStateStr);
        if (savedState.allCompleted !== allCompleted) {
          localStorage.setItem('hexglobe_mission_state', JSON.stringify({ ...savedState, allCompleted }));
        }
      } catch (e) {}
    }
  }, [missions, purchasedPixels]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-80 bg-[#0a0a1a]/90 backdrop-blur-md border-r border-[#00f3ff]/30 shadow-[0_0_20px_rgba(0,243,255,0.2)] z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col glass-panel">
      <div className="p-4 border-b border-[#bc13fe]/30 flex justify-between items-center bg-gradient-to-r from-[#bc13fe]/10 to-[#00f3ff]/10">
        <h2 className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
          <span className="text-[#00f3ff]">MISIUNI</span> ZILNICE
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {missions.map((mission) => {
          const progress = mission.checkProgress(purchasedPixels);
          const isCompleted = progress >= mission.target;
          const percentage = Math.min((progress / mission.target) * 100, 100);

          return (
            <div 
              key={mission.id} 
              className={`relative p-4 rounded-xl border transition-all duration-300 overflow-hidden ${
                isCompleted 
                  ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] bg-yellow-400/5' 
                  : 'border-[#00f3ff]/20 bg-black/40 hover:border-[#00f3ff]/50'
              }`}
            >
              {isCompleted && (
                <div className="absolute top-2 right-2 text-yellow-400 animate-pulse">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isCompleted ? 'bg-yellow-400/20' : 'bg-[#bc13fe]/20'}`}>
                  {mission.icon}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-sm pr-6 ${isCompleted ? 'text-yellow-400' : 'text-white'}`}>
                    {mission.title}
                  </h3>
                  {mission.id === 'share_social' && !isCompleted && (
                    <div className="mt-2 flex gap-2">
                      <button 
                        onClick={() => {
                          window.open('https://www.facebook.com/sharer/sharer.php?u=https://hexglobe.com', '_blank');
                          localStorage.setItem('hasShared_v2', 'true');
                          setTimeout(() => setForceUpdate(prev => prev + 1), 1000);
                        }}
                        className="flex-1 text-[10px] bg-[#1877F2] hover:bg-[#1864c9] text-white font-bold py-1.5 px-2 rounded-md uppercase tracking-wider transition-colors flex items-center justify-center"
                        title="Facebook"
                      >
                        FB
                      </button>
                      <button 
                        onClick={() => {
                          window.open('https://twitter.com/intent/tweet?text=Cuceresc%20lumea%20în%20HEXGLOBE!%20Vino%20să%20joci%20alături%20de%20mine!', '_blank');
                          localStorage.setItem('hasShared_v2', 'true');
                          setTimeout(() => setForceUpdate(prev => prev + 1), 1000);
                        }}
                        className="flex-1 text-[10px] bg-black border border-gray-700 hover:bg-gray-900 text-white font-bold py-1.5 px-2 rounded-md uppercase tracking-wider transition-colors flex items-center justify-center"
                        title="X (Twitter)"
                      >
                        X
                      </button>
                      <button 
                        onClick={() => {
                          window.open('https://www.instagram.com/', '_blank');
                          localStorage.setItem('hasShared_v2', 'true');
                          setTimeout(() => setForceUpdate(prev => prev + 1), 1000);
                        }}
                        className="flex-1 text-[10px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white font-bold py-1.5 px-2 rounded-md uppercase tracking-wider transition-colors flex items-center justify-center"
                        title="Instagram"
                      >
                        IG
                      </button>
                      <button 
                        onClick={() => {
                          window.open('https://www.tiktok.com/', '_blank');
                          localStorage.setItem('hasShared_v2', 'true');
                          setTimeout(() => setForceUpdate(prev => prev + 1), 1000);
                        }}
                        className="flex-1 text-[10px] bg-black border border-[#00f2fe] text-white hover:bg-gray-900 font-bold py-1.5 px-2 rounded-md uppercase tracking-wider transition-colors flex items-center justify-center shadow-[2px_2px_0px_#ff0050]"
                        title="TikTok"
                      >
                        TT
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-400">Progres: {progress}/{mission.target}</span>
                  <span className="text-[#bc13fe] font-bold">Recompensă: {mission.reward}</span>
                </div>
                
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${
                      isCompleted 
                        ? 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' 
                        : 'bg-gradient-to-r from-[#00f3ff] to-[#bc13fe]'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-[#00f3ff]/20 text-center text-xs text-gray-500 font-mono">
        Misiunile se resetează la 00:00
      </div>
    </div>
  );
}
