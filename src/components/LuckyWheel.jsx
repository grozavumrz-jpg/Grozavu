import React, { useState, useRef, useEffect } from 'react';
import { Gift, X, Star } from 'lucide-react';

const REWARDS = [
  { text: '10 Pixeli', color: '#00f3ff', weight: 40, type: 'pixel', value: 10 },
  { text: 'Medalie Norocosul', color: '#cd7f32', weight: 20, type: 'medal', value: 'Norocosul' },
  { text: 'Rol: Dictator', color: '#bc13fe', weight: 10, type: 'role', value: 'Dictator' },
  { text: 'Pixel de Aur', color: '#fbbf24', weight: 5, type: 'gold_pixel', value: 1 },
  { text: 'Nimic', color: '#333333', weight: 25, type: 'nothing', value: null },
];

export default function LuckyWheel({ isOpen, onClose, onReward, userBalance, onUpdateBalance }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const wheelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setWinner(null);
    }
  }, [isOpen]);

  const spinWheel = () => {
    if (isSpinning) return;
    
    if (userBalance < 10) {
      alert("Fonduri insuficiente! Ai nevoie de 10 Pixeli pentru o rotire.");
      return;
    }
    
    // Deduct 10 pixels
    if(onUpdateBalance) onUpdateBalance(-10);

    setIsSpinning(true);
    setWinner(null);

    // Calculate total weight
    const totalWeight = REWARDS.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedIdx = 0;
    for (let i = 0; i < REWARDS.length; i++) {
      if (random < REWARDS[i].weight) {
        selectedIdx = i;
        break;
      }
      random -= REWARDS[i].weight;
    }

    const spinSpins = 5; // number of full rotations
    const sliceAngle = 360 / REWARDS.length;
    // Calculate the target angle (in CSS rotation, we want the winning slice to end up at the top)
    // The top is 0 degrees or 360 degrees.
    const targetAngle = 360 - (selectedIdx * sliceAngle + sliceAngle / 2);
    
    const finalRotation = rotation + (spinSpins * 360) + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(REWARDS[selectedIdx]);
      if (onReward && REWARDS[selectedIdx].type !== 'nothing') {
        onReward(REWARDS[selectedIdx]);
      }
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl relative flex flex-col items-center border border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-black/40 rounded-full transition-colors z-50">
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-neonCyan/20 rounded-2xl flex items-center justify-center mb-6 border border-neonCyan/50 shadow-[0_0_20px_rgba(0,243,255,0.3)] z-10">
          <Gift className="w-8 h-8 text-neonCyan" />
        </div>
        
        <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-widest text-center z-10 drop-shadow-lg relative">
           RULETA NOROCULUI
        </h2>
        <p className="text-gray-400 text-sm mb-8 text-center max-w-xs z-10 relative bg-black/50 p-2 rounded-lg border border-white/5">
          Costă 10 Pixeli rotirea. Câștigă premii unice, titlul de Dictator sau legendarul Pixel de Aur!
        </p>

        <div className="relative w-64 h-64 mb-8">
          {/* Arrow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white filter drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
          
          {/* Wheel */}
          <div 
            ref={wheelRef}
            className="w-full h-full rounded-full border-4 border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative transition-transform duration-[4000ms] ease-[cubic-bezier(0.15,0.8,0.15,1)]"
            style={{ 
               transform: `rotate(${rotation}deg)`,
               background: `conic-gradient(
                  ${REWARDS[0].color} 0deg 72deg,
                  ${REWARDS[1].color} 72deg 144deg,
                  ${REWARDS[2].color} 144deg 216deg,
                  ${REWARDS[3].color} 216deg 288deg,
                  ${REWARDS[4].color} 288deg 360deg
               )`
            }}
          >
            {REWARDS.map((reward, i) => {
              // Rotate text to the center of each slice (72 degrees per slice, so center is i * 72 + 36)
              const sliceRotation = i * 72 + 36;
              return (
                <div 
                  key={i}
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ transform: `rotate(${sliceRotation}deg)` }}
                >
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center justify-start text-white font-black text-[12px] drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] w-20 h-24 text-center leading-tight pt-2">
                    {reward.type === 'pixel' || reward.type === 'gold_pixel' ? <Star className="w-4 h-4 mb-1 text-white filter drop-shadow-md" /> : null}
                    {reward.text}
                  </div>
                  {/* Slice divider line */}
                  <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-white/20 -translate-x-1/2 -rotate-[36deg] origin-bottom" />
                </div>
              );
            })}
          </div>
        </div>

        {winner ? (
          <div className="text-center animate-in zoom-in slide-in-from-bottom-4">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Ai câștigat:</div>
            <div className="text-2xl font-black" style={{ color: winner.color }}>
              {winner.text}
            </div>
          </div>
        ) : (
          <button 
            onClick={spinWheel}
            disabled={isSpinning || userBalance < 10}
            className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-neonCyan transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center justify-center gap-2"
          >
            ROTEȘTE (10 💎)
          </button>
        )}
      </div>
    </div>
  );
}
