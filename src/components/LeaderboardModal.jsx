import React, { useState } from 'react';
import { Trophy, X, User, Globe2 } from 'lucide-react';

export default function LeaderboardModal({ users, onClose }) {
  const [activeTab, setActiveTab] = useState('users');

  // Group pixels by user name
  const userCounts = users.reduce((acc, user) => {
    acc[user.name] = (acc[user.name] || 0) + 1;
    return acc;
  }, {});
  
  const sortedUsers = Object.entries(userCounts)
    .map(([name, pixels]) => ({ name, pixels }))
    .sort((a, b) => b.pixels - a.pixels);

  // Group pixels by country
  const countryCounts = users.reduce((acc, user) => {
    if (user.country) {
      acc[user.country] = (acc[user.country] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedCountries = Object.entries(countryCounts)
    .map(([name, pixels]) => ({ name, pixels }))
    .sort((a, b) => b.pixels - a.pixels);

  const activeList = activeTab === 'users' ? sortedUsers : sortedCountries;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-300">
      <div className="glass-panel w-[600px] max-h-[80vh] rounded-2xl p-8 flex flex-col border border-neonCyan/50 shadow-[0_0_50px_rgba(0,243,255,0.2)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold glow-text uppercase tracking-wide flex items-center gap-3">
            <Trophy className="text-yellow-400 w-8 h-8" />
            Clasament Global
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-lg transition-all flex justify-center items-center gap-2 ${activeTab === 'users' ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <User className="w-4 h-4" />
            Jucători
          </button>
          <button 
            onClick={() => setActiveTab('countries')}
            className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest rounded-lg transition-all flex justify-center items-center gap-2 ${activeTab === 'countries' ? 'bg-neonPurple/20 text-neonPurple border border-neonPurple/30' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <Globe2 className="w-4 h-4" />
            Țări
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
          {activeList.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors border border-white/5 hover:border-neonCyan/30">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${idx === 0 ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : idx === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-300' : idx === 2 ? 'bg-orange-400/20 text-orange-400 border border-orange-400' : 'bg-white/10 text-gray-400'}`}>
                  #{idx + 1}
                </div>
                <div>
                  <span className="font-semibold text-lg text-white">{item.name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-mono text-neonCyan font-bold">{item.pixels}</span>
                <span className="text-gray-400 text-sm ml-2 uppercase">px</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
