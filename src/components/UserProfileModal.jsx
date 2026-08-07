import React, { useState, useRef, useEffect } from 'react';
import { X, MapPin, Target, Shield, Link, Coins, Medal, Upload } from 'lucide-react';

export default function UserProfileModal({ username, purchasedPixels, bankFunds, onClose, onInvestInUser }) {
  const [investAmount, setInvestAmount] = useState(10);
  const [profilePic, setProfilePic] = useState(null);
  const fileInputRef = useRef(null);
  const currentUser = localStorage.getItem('hexglobe_username') || 'Anonim';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`hexglobe_profile_${username}`);
      if (saved) setProfilePic(saved);
    } catch(e) {}
  }, [username]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      localStorage.setItem(`hexglobe_profile_${username}`, base64);
      setProfilePic(base64);
    };
    reader.readAsDataURL(file);
  };
  if (!username) return null;

  const userPixels = purchasedPixels.filter(p => p.name === username);
  const totalDonated = userPixels.length * 10; // Mock calculation
  
  // Find which country they have the most pixels in
  let mainCountry = 'Nespecificat';
  if (userPixels.length > 0) {
    const counts = {};
    let max = 0;
    userPixels.forEach(p => {
       counts[p.country] = (counts[p.country] || 0) + 1;
       if (counts[p.country] > max) {
          max = counts[p.country];
          mainCountry = p.country;
       }
    });
  }

  return (
    <div className="fixed inset-0 z-[10000] overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-[#0a0a0f] w-full max-w-[420px] rounded-2xl flex flex-col border border-white/5 shadow-2xl relative">
          
          {/* Top Accent Line */}
          <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-t-2xl"></div>

          {/* Fixed Header with Close Button */}
          <div className="flex justify-end p-4 pb-0 shrink-0">
             <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-20"
             >
                <X className="w-4 h-4" />
             </button>
          </div>

          <div className="p-5 md:p-6 pt-2">

           {/* Header Info */}
           <div className="flex items-center gap-4 mb-6 mt-2">
              <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-4xl font-black text-black shadow-lg overflow-hidden relative border border-white/10">
                     {profilePic ? (
                       <img src={profilePic} alt={username} className="w-full h-full object-cover" />
                     ) : (
                       username.charAt(0).toUpperCase()
                     )}
                     {username === currentUser && (
                        <div 
                           className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                           onClick={() => fileInputRef.current?.click()}
                        >
                           <Upload className="w-6 h-6 text-white" />
                        </div>
                     )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              </div>
              
              <div className="flex flex-col min-w-0 pr-8">
                 <h2 className="text-xl md:text-2xl font-black text-white tracking-wide truncate">{username}</h2>
                 <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 mt-1 uppercase tracking-widest">
                    <span className="text-lg shrink-0">🪖</span> 
                    <span className="truncate">{userPixels.length > 500 ? 'Guvernator' : userPixels.length > 100 ? 'General' : 'Soldat'}</span>
                 </div>
                 <div className="text-xs text-gray-400 mt-1 truncate">
                    {userPixels.length} pixeli în {mainCountry}
                 </div>
              </div>
           </div>

           {/* Social Buttons */}
           <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a href={`https://instagram.com/${username}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#1a0f1a] hover:bg-[#2a1a2a] border border-[#bc13fe]/30 rounded-xl py-2.5 px-2 flex items-center justify-center gap-2 transition-colors min-w-0">
                 <span className="text-gray-400 shrink-0">📸</span>
                 <span className="text-[#bc13fe] font-bold text-sm truncate">@{username.replace(/\s+/g, '.').toLowerCase()}</span>
              </a>
              <a href={`https://${username.replace(/\s+/g, '').toLowerCase()}.md`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#0a1f24] hover:bg-[#133038] border border-neonCyan/30 rounded-xl py-2.5 px-2 flex items-center justify-center gap-2 transition-colors min-w-0">
                 <Link className="w-4 h-4 text-neonCyan shrink-0" />
                 <span className="text-neonCyan font-bold text-sm truncate">{username.replace(/\s+/g, '').toLowerCase()}.md</span>
              </a>
           </div>

           {/* Bio / Quote */}
           <div className="bg-[#15151a] border border-white/5 rounded-xl p-4 mb-6">
              <p className="text-gray-300 text-sm italic font-medium leading-relaxed">
                 "Salut, sunt {username} și acesta este colțul meu din {mainCountry}! 💪🚀"
              </p>
           </div>

           {/* Invest System */}
           <div className="bg-[#0c1418] border border-neonCyan/20 rounded-xl p-1.5 flex items-center gap-2 mb-8">
              <div className="flex items-center bg-black rounded-lg px-3 py-2 border border-white/5">
                 <input 
                   type="number"
                   value={investAmount}
                   onChange={(e) => setInvestAmount(Math.max(1, parseInt(e.target.value) || 1))}
                   className="w-12 bg-transparent text-white focus:outline-none text-center font-bold text-sm"
                 />
                 <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold ml-2">Pixeli</span>
              </div>
              <button
                onClick={() => {
                   if (onInvestInUser) {
                      const success = onInvestInUser(username, investAmount);
                      if (!success) alert("Fonduri insuficiente!");
                   }
                }}
                className="flex-1 bg-gradient-to-r from-[#003d4d] to-[#006680] hover:from-[#004d60] hover:to-[#007a99] text-white rounded-lg py-2.5 font-bold text-sm flex items-center justify-center gap-2 uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,243,255,0.15)]"
              >
                💎 Investește
              </button>
           </div>

           {/* Badges */}
           <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Insigne Obținute</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                 <div className="bg-[#1a1014] border border-white/5 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <span className="text-[#ff3366] text-xs">💧</span>
                    <span className="text-gray-300 text-xs font-bold">Patriot Începător</span>
                 </div>
                 {userPixels.length >= 10 && (
                   <div className="bg-[#241010] border border-red-900/30 rounded-lg px-3 py-1.5 flex items-center gap-2">
                      <span className="text-yellow-500 text-xs">👑</span>
                      <span className="text-red-500 text-xs font-bold">Împărat</span>
                   </div>
                 )}
              </div>
           </div>

           <div className="h-px w-full bg-white/5 mb-6"></div>

           {/* Rarest Badge */}
           <div className="flex flex-col items-center">
              <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Cea Mai Rară Insignă</h3>
              <div className="w-full bg-gradient-to-b from-[#3a151a] to-[#2a0f12] rounded-xl p-6 flex flex-col items-center justify-center border border-red-900/20 shadow-[0_10px_30px_rgba(220,38,38,0.1)]">
                 <div className="text-4xl mb-2 filter drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">👑</div>
                 <div className="text-xl font-black text-red-500 tracking-wide mb-1">Împărat</div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mitic</div>
              </div>
           </div>
           
          </div>
        </div>
      </div>
    </div>
  );
}
