import React, { useState, useRef } from 'react';
import { X, Lock, Shield, User as UserIcon, Calendar, Target, Globe2, Camera, Link, Hash, LogOut } from 'lucide-react';
import { checkMedals } from '../utils/medals';
import { supabase } from '../supabaseClient';

export default function UserProfile({ isOpen, onClose, purchasedPixels = [], conqueredCountries = 0 }) {
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(() => localStorage.getItem('hexglobe_avatar') || null);
  const [website, setWebsite] = useState(() => localStorage.getItem('hexglobe_website') || '');
  const [tiktok, setTiktok] = useState(() => localStorage.getItem('hexglobe_tiktok') || '');
  const [session, setSession] = useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.avatar_url) {
        setAvatar(session.user.user_metadata.avatar_url);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.avatar_url) {
        setAvatar(session.user.user_metadata.avatar_url);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      alert("Eroare la conectare: " + error.message + "\n(Ai configurat Google Client ID in Supabase?)");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (!isOpen) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setAvatar(base64);
        localStorage.setItem('hexglobe_avatar', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveWebsite = (val) => {
    setWebsite(val);
    localStorage.setItem('hexglobe_website', val);
  };

  const handleSaveTiktok = (val) => {
    setTiktok(val);
    localStorage.setItem('hexglobe_tiktok', val);
  };

  const specialMedals = JSON.parse(localStorage.getItem('hexglobe_special_medals') || '[]');
  const userMedals = checkMedals(purchasedPixels, conqueredCountries, specialMedals);

  // Generate Rank
  const getRank = (pixelsCount) => {
    if (pixelsCount >= 500) return { name: 'Împărat', color: 'text-yellow-400' };
    if (pixelsCount >= 100) return { name: 'Comandant Suprem', color: 'text-[#bc13fe]' };
    if (pixelsCount >= 50) return { name: 'General', color: 'text-red-500' };
    if (pixelsCount >= 10) return { name: 'Căpitan', color: 'text-[#00f3ff]' };
    if (pixelsCount >= 1) return { name: 'Soldat', color: 'text-green-400' };
    return { name: 'Civil', color: 'text-gray-400' };
  };

  const rank = getRank(purchasedPixels.length);
  const totalSpent = purchasedPixels.length * 1; // Assuming $1 per pixel
  const activeCountries = new Set(purchasedPixels.map(p => p.country)).size;
  
  // Registration date mock
  let regDate = localStorage.getItem('hexglobe_reg_date');
  if (!regDate) {
    regDate = new Date().toLocaleDateString('ro-RO');
    localStorage.setItem('hexglobe_reg_date', regDate);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a1a]/95 border border-[#bc13fe]/40 rounded-2xl shadow-[0_0_30px_rgba(188,19,254,0.3)] flex flex-col overflow-hidden glass-panel">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[#00f3ff]/30 flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-[#bc13fe]/10 to-transparent shrink-0 gap-4 relative">
          
          {/* Close button - absolute top right on mobile */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 md:static p-2 rounded-full bg-white/10 md:bg-transparent hover:bg-white/20 text-gray-200 hover:text-white transition-colors z-20"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <div className="flex items-center gap-4 md:gap-6 pr-10 md:pr-0">
            <div 
              className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full bg-gradient-to-br from-[#00f3ff] to-[#bc13fe] flex items-center justify-center border-2 border-white/20 shadow-lg cursor-pointer group overflow-hidden"
              onClick={handleAvatarClick}
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
              />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-bold text-white tracking-wider flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span>PROFIL</span> <span className="text-[#bc13fe]">PERSONAL</span>
              </h2>
              <div className="flex items-center gap-2 mt-1 md:mt-2">
                <Shield className={`w-4 h-4 md:w-5 md:h-5 ${rank.color}`} />
                <span className={`font-bold uppercase tracking-widest text-xs md:text-sm ${rank.color}`}>{rank.name}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
            {session ? (
              <div className="flex flex-col items-end">
                <span className="text-xs text-green-400 font-bold mb-1">Conectat: {session.user?.email}</span>
                <button 
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/30 hover:bg-red-500/40 text-red-400 text-xs font-bold py-2 md:py-2.5 px-4 rounded-xl transition-all shadow-lg"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" /> Deconectare
                </button>
              </div>
            ) : (
              <button 
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-xs font-bold py-2 md:py-2.5 px-4 rounded-xl transition-all shadow-lg"
                onClick={handleGoogleLogin}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Conectează Google
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-white/10">
              <Target className="text-[#00f3ff] mb-2" />
              <span className="text-2xl font-bold text-white">{purchasedPixels.length}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Pixeli Cumpărați</span>
            </div>
            <div className="glass-panel bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-white/10">
              <Globe2 className="text-green-400 mb-2" />
              <span className="text-2xl font-bold text-white">{activeCountries}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Țări Active</span>
            </div>
            <div className="glass-panel bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-white/10">
              <span className="text-yellow-400 mb-2 text-xl font-bold">$</span>
              <span className="text-2xl font-bold text-white">${totalSpent}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Investiție Totală</span>
            </div>
            <div className="glass-panel bg-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center border border-white/10">
              <Calendar className="text-[#bc13fe] mb-2" />
              <span className="text-lg font-bold text-white">{regDate}</span>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Membru Din</span>
            </div>
          </div>

          {/* Social / Links Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel bg-white/5 p-4 rounded-xl border border-white/10">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <Link className="w-4 h-4 text-[#00f3ff]" /> Website
              </label>
              <input 
                type="text" 
                value={website}
                onChange={(e) => handleSaveWebsite(e.target.value)}
                placeholder="https://your-website.com"
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-[#00f3ff] transition-colors"
              />
            </div>
            <div className="glass-panel bg-white/5 p-4 rounded-xl border border-white/10">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <Hash className="w-4 h-4 text-[#bc13fe]" /> TikTok Username
              </label>
              <input 
                type="text" 
                value={tiktok}
                onChange={(e) => handleSaveTiktok(e.target.value)}
                placeholder="@username"
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:border-[#bc13fe] transition-colors"
              />
            </div>
          </div>

          {/* Medals Grid */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Colecția de Medalii</h3>
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
    </div>
  );
}
