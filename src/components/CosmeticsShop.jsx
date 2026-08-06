import React, { useState } from 'react';
import { X, Sparkles, Zap, Flame, User, Palette, Shield, Crown, TrendingUp, Eye } from 'lucide-react';

export default function CosmeticsShop({ isOpen, onClose, balance, onUnlock, inventory, equippedCosmetics, onEquip, onActivateBoost, activeBoosts = [] }) {
  const [activeTab, setActiveTab] = useState('cosmetics'); // 'cosmetics' | 'boosts'

  if (!isOpen) return null;

  const cosmeticItems = [
    { id: 'title_fire', name: 'Nume de Foc', type: 'title', icon: <Flame className="text-orange-500" />, cost: 200, color: 'text-orange-500 font-black drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]' },
    { id: 'title_neon', name: 'Nume Neon', type: 'title', icon: <Zap className="text-neonCyan" />, cost: 200, color: 'text-neonCyan font-black glow-text' },
    { id: 'title_rainbow', name: 'Curcubeu', type: 'title', icon: <Sparkles className="text-pink-400" />, cost: 300, color: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-black' },
    { id: 'avatar_holo', name: 'Avatar Holografic 3D', type: 'avatar', icon: <User className="text-blue-400" />, cost: 500, desc: 'Înlocuiește poza normală cu o hologramă animată.' },
    { id: 'chat_gold', name: 'Text Auriu Chat', type: 'chat', icon: <Palette className="text-yellow-400" />, cost: 100, color: 'text-yellow-400 font-bold' },
    { id: 'chat_blood', name: 'Text Sângeriu', type: 'chat', icon: <Palette className="text-red-500" />, cost: 150, color: 'text-red-500 font-bold drop-shadow-[0_0_2px_red]' }
  ];

  const boostItems = [
    { id: 'boost_dictator', name: 'Rol de Dictator', icon: <Crown className="text-yellow-500" />, cost: 1000, desc: 'Puterea atacurilor tale (pixeli) este dublată temporar.' }
  ];

  const handleBuyOrEquip = (item) => {
    const isOwned = inventory.includes(item.id);
    
    if (isOwned) {
      // Equip / Unequip
      onEquip(item.type, item.id);
    } else {
      // Buy
      if (balance < item.cost) {
        alert("Fonduri insuficiente!");
        return;
      }
      if (window.confirm(`Vrei să cumperi ${item.name} pentru ${item.cost} Pixeli?`)) {
        onUnlock(item.id, item.cost);
      }
    }
  };

  const handleActivateBoost = (item) => {
    const isActive = activeBoosts.includes(item.id);
    if (isActive) {
      alert("Acest boost este deja activ!");
      return;
    }
    if (balance < item.cost) {
      alert("Fonduri insuficiente!");
      return;
    }
    if (window.confirm(`Vrei să activezi ${item.name} pentru ${item.cost} Pixeli?`)) {
      onUnlock(item.id, item.cost); // Deducts balance and adds to inventory (as a dummy record)
      onActivateBoost(item.id);
    }
  };

  const renderCosmetics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-max">
      {cosmeticItems.map(item => {
        const isOwned = inventory.includes(item.id);
        const isEquipped = equippedCosmetics && equippedCosmetics[item.type] === item.id;
        
        let cardClass = 'bg-black/60 border-white/10 hover:border-white/30';
        if (isEquipped) cardClass = 'bg-neonCyan/20 border-neonCyan/50 shadow-[0_0_15px_rgba(0,243,255,0.2)]';
        else if (isOwned) cardClass = 'bg-green-500/10 border-green-500/30';

        return (
          <div key={item.id} className={`relative overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col ${cardClass}`}>
            <div className="p-6 pb-4">
              <div className="w-12 h-12 bg-black/50 rounded-xl flex items-center justify-center mb-4 border border-white/5">
                {item.icon}
              </div>
              <h3 className={`text-xl mb-2 ${item.color || 'text-white font-bold'}`}>
                {item.name}
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                {item.desc || 'Personalizează-ți prezența pe hartă și în chat.'}
              </p>
            </div>
            
            <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center mt-auto">
              <div className="font-black text-neonCyan text-lg">{isOwned ? 'DEȚINUT' : `${item.cost} 💎`}</div>
              <button 
                onClick={() => handleBuyOrEquip(item)}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  isEquipped ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/40' 
                  : isOwned ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30 hover:bg-neonCyan/40'
                  : 'bg-white text-black hover:bg-neonCyan hover:shadow-[0_0_15px_rgba(0,243,255,0.4)]'
                }`}
              >
                {isEquipped ? 'DEZECHIPEAZĂ' : isOwned ? 'ECHIPEAZĂ' : 'CUMPĂRĂ'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderBoosts = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-max">
      {boostItems.map(item => {
        const isActive = activeBoosts && activeBoosts.includes(item.id);
        
        return (
          <div key={item.id} className={`relative overflow-hidden rounded-2xl border transition-all duration-300 flex flex-col ${isActive ? 'bg-yellow-500/20 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-black/60 border-white/10 hover:border-white/30'}`}>
            <div className="p-6 pb-4">
              <div className="w-12 h-12 bg-black/50 rounded-xl flex items-center justify-center mb-4 border border-white/5">
                {item.icon}
              </div>
              <h3 className="text-xl mb-2 text-white font-bold">
                {item.name}
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                {item.desc}
              </p>
            </div>
            
            <div className="p-4 border-t border-white/5 bg-black/40 flex justify-between items-center mt-auto">
              <div className="font-black text-yellow-500 text-lg">{isActive ? 'ACTIV' : `${item.cost} 💎`}</div>
              <button 
                onClick={() => handleActivateBoost(item)}
                disabled={isActive}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  isActive ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 opacity-50 cursor-not-allowed' 
                  : 'bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                }`}
              >
                {isActive ? 'ACTIV' : 'ACTIVEAZĂ'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      <div className="min-h-full flex items-center justify-center p-3 py-6">
      <div className="glass-panel w-full max-w-4xl rounded-3xl border border-neonCyan/40 shadow-[0_0_50px_rgba(0,243,255,0.15)] flex flex-col overflow-hidden" style={{maxHeight: 'min(90vh, 700px)'}}>

        
        <div className="p-4 md:p-6 border-b border-white/10 bg-black/40 flex flex-col md:flex-row justify-between items-start md:items-center relative shrink-0 gap-4">
          <div className="absolute inset-0 bg-gradient-to-r from-neonCyan/20 to-purple-500/20 opacity-50"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full md:w-auto">
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-neonCyan" />
              </div>
              <h2 className="text-xl md:text-3xl font-black text-white tracking-widest uppercase truncate">Piața Neagră</h2>
              
              {/* Close button on mobile positioned top right */}
              <button onClick={onClose} className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors text-white md:hidden shrink-0 bg-black/50 border border-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4 mt-2 md:mt-0 overflow-x-auto w-full pb-1">
              <button 
                onClick={() => setActiveTab('cosmetics')}
                className={`text-xs md:text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'cosmetics' ? 'text-neonCyan border-neonCyan' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
              >
                💅 Cosmetice
              </button>
              <button 
                onClick={() => setActiveTab('boosts')}
                className={`text-xs md:text-sm font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'boosts' ? 'text-yellow-500 border-yellow-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
              >
                🚀 Boost-uri
              </button>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-4 justify-between w-full md:w-auto mt-2 md:mt-0">
            <div className="bg-black/50 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-white/10 flex-1 md:flex-none flex justify-between md:flex-col md:justify-center items-center md:items-start">
              <span className="text-[10px] md:text-xs text-gray-500 uppercase font-bold block">Balanța ta</span>
              <span className="text-lg md:text-xl font-black text-neonCyan">{balance} 💎</span>
            </div>
            {/* Close button on desktop */}
            <button onClick={onClose} className="hidden md:block p-2 hover:bg-white/10 rounded-full transition-colors text-white shrink-0">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-8 bg-black/20 custom-scrollbar">
          {activeTab === 'cosmetics' ? renderCosmetics() : renderBoosts()}
        </div>
      </div>
      </div>
    </div>
  );
}
