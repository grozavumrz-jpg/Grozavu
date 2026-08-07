import React, { useState, useEffect } from 'react';
import { Trophy, Crosshair, MapPin, X, User, AtSign, Zap, Radio, Target, Award, Shield, Swords, Link } from 'lucide-react';
import { getRank } from '../utils/ranks';

import ExpansionChart from './ExpansionChart';
import CountryLogo from './CountryLogo';

export default function UIOverlay({ 
  selectedCountry, 
  selectedPixel, 
  selectedLogoName,
  selectedLogoEvent,
  purchasedPixels, 
  onClose, 
  onPurchase, 
  onShowLeaderboard, 
  onShowCountryDetails,
  onAttackEvent,
  onSelectCountry,
  onShowMissions,
  onShowMedals,
  onShowCosmetics,
  userBalance,
  onUpdateBalance,
  onAddAlliance,
  onInvestInUser,
  onRevolutionSuccess,
  countryBankFunds,
  onDonateToBank,
  activeAttacks = [],
  conqueredCountries = {},
  userInventory = [],
  equippedCosmetics = {},
  activeBoosts = [],
  onOpenPrivateChat,
  alliances = [],
}) {
  const [name, setName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activityFeed, setActivityFeed] = useState([]);
  const [countryMap, setCountryMap] = useState({});
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [attackTarget, setAttackTarget] = useState('');
  const audioRef = React.useRef(null);
  
  useEffect(() => {
    if (audioEnabled) {
      if (!audioRef.current) {
        audioRef.current = new Audio('https://upload.wikimedia.org/wikipedia/commons/3/34/Sound_Effect_-_Space_Ambient_Background.ogg'); // Reliable Space Ambient
        audioRef.current.loop = true;
        audioRef.current.volume = 0.5;
      }
      audioRef.current.play().catch((e) => {
        console.error("Audio playback blocked by browser policies:", e);
        // Silently fail instead of annoying alert, or toggle off
        setAudioEnabled(false);
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [audioEnabled]);



  useEffect(() => {
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => {
         const map = {};
         data.features.forEach(f => {
           if (f.properties.ISO_A2 && f.properties.ISO_A2 !== '-99') {
              map[f.properties.ADMIN] = f.properties.ISO_A2.toLowerCase();
           }
         });
         setCountryMap(map);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const templates = [
      // Standard events
      "</span><span class='font-bold text-white'>{u}</span> a cumpărat pixelul #{p} în <span class='text-neonCyan'>{c}</span>",
      "</span><span class='font-bold text-red-400'>{u}</span> a donat 50 pixeli pentru Banca Centrală",
      "</span><span class='font-bold text-white'>{u}</span> a deblocat medalia Cuceritor! 🏆",
      "</span><span class='font-bold text-purple-400'>{u}</span> a activat Rolul de Dictator 👑",
      
      // Psychological & Provocative Messages (FOMO & Ego)
      "</span><span class='text-red-500 font-bold'>⚠️ PROVOCARE:</span> <span class='font-bold'>{u}</span> tocmai a zis că țara ta e săracă și nu își permite nici 10 pixeli!",
      "</span><span class='text-orange-500 font-bold'>🔥 UMILINȚĂ:</span> <span class='font-bold text-white'>{u}</span> rade de scutul alianței tale! Zice că e de decor. Arată-i cine e șeful!",
      "</span><span class='text-yellow-400 font-bold'>💰 BOGĂȚIE:</span> <span class='font-bold'>{u}</span> a aruncat 100$ doar ca să-ți șteargă logo-ul de pe hartă în <span class='text-neonCyan'>{c}</span>. Tu ce faci, dormi?",
      "</span><span class='text-red-500 font-bold'>⚔️ INVAZIE:</span> Un noob numit <span class='font-bold text-white'>{u}</span> se pregătește să îți fure poziția de Președinte! Cumpără acum sau vei fi detronat!",
      "</span><span class='text-purple-400 font-bold'>👑 SUPREMAȚIE:</span> <span class='font-bold'>{u}</span> domină <span class='text-neonCyan'>{c}</span>. Logoul lui e pe tot ecranul. Al tău nici nu se vede!",
      "</span><span class='text-neonCyan font-bold'>💎 FOMO:</span> Mai sunt doar 12 pixeli liberi în zona ta! <span class='font-bold'>{u}</span> e cu cardul în mână. O să-i lași lui tot profitul?",
      "</span><span class='text-red-500 font-bold'>🤬 INSULTĂ:</span> <span class='font-bold'>{u}</span>: <i>\"Cei din {c} sunt prea zgârciți să construiască o Bancă Centrală. O s-o cumpăr eu!\"</i>",
      "</span><span class='text-green-400 font-bold'>🤑 PROFIT:</span> <span class='font-bold text-white'>{u}</span> tocmai a scos profit masiv din dividende pentru că și-a apărat țara. Fii ca el!"
    ];
    const users = ['DragonSlayer', 'NeonNinja', 'CyberWolf', 'PhoenixRo', 'StefanCelMare', 'IceBreaker', 'StormRider', 'VladTepes', 'MihaiViteazu', 'CryptoKing'];
    const countries = ['România', 'Germania', 'Franța', 'Italia', 'Japonia', 'Brazilia', 'SUA', 'Canada', 'Australia', 'Spania'];

    let timeoutId;
    const scheduleNext = () => {
      const delay = Math.floor(Math.random() * 8000) + 3000; // 3-11 sec (Faster for more pressure)
      timeoutId = setTimeout(() => {
        const u = users[Math.floor(Math.random() * users.length)];
        const c = countries[Math.floor(Math.random() * countries.length)];
        const p = Math.floor(Math.random() * 9000) + 1000;
        

        let text = templates[Math.floor(Math.random() * templates.length)]
          .replace('{u}', u)
          .replace('{c}', c)
          .replace('{p}', p);

        const newMsg = {
          id: Date.now(),
          text,
          time: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })
        };

        setActivityFeed(prev => [newMsg, ...prev].slice(0, 5));
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleBuy = () => {
    if (!name.trim()) return alert('Te rog introdu un nume!');
    setIsProcessing(true);

    // Purchase Sound Effect
    if (audioEnabled) {
      try {
        const sfx = document.getElementById('sfx-buy');
        if (sfx) {
          sfx.currentTime = 0;
          sfx.volume = 0.8;
          sfx.play().catch(e => console.log('SFX play failed:', e));
        }
      } catch(e) {
        console.error("Eroare la redarea sunetului", e);
      }
    }

    setTimeout(() => {
      if (website) {
        localStorage.setItem('hexglobe_website', website);
      }
      onPurchase({ name, instagram, website, bio });
      setIsProcessing(false);
      setName('');
      setInstagram('');
      setWebsite('');
      setBio('');
    }, 1000); // Simulate network request
  };

  const [expandedTopUser, setExpandedTopUser] = useState(null);
  const [miniLeaderboardTab, setMiniLeaderboardTab] = useState('users');
  const [rightPanelTab, setRightPanelTab] = useState('patriots');
  const [expandedWar, setExpandedWar] = useState(null);

  useEffect(() => {
    setRightPanelTab('patriots');
    setExpandedWar(null);
  }, [selectedCountry]);

  const userStats = {};
  purchasedPixels.forEach(p => {
    if (!userStats[p.name]) {
      userStats[p.name] = { 
        name: p.name, 
        pixels: 0, 
        instagram: p.instagram, 
        country: p.country 
      };
    }
    userStats[p.name].pixels += 1;
    if (p.instagram && !userStats[p.name].instagram) {
      userStats[p.name].instagram = p.instagram;
    }
  });

  const topUsers = Object.values(userStats)
    .sort((a, b) => b.pixels - a.pixels)
    .slice(0, 2);

  const countryStatsRaw = {};
  purchasedPixels.forEach(p => {
    if (p.country) {
      if (!countryStatsRaw[p.country]) {
        countryStatsRaw[p.country] = { name: p.country, pixels: 0 };
      }
      countryStatsRaw[p.country].pixels += 1;
    }
  });

  const topCountries = Object.values(countryStatsRaw)
    .sort((a, b) => b.pixels - a.pixels)
    .slice(0, 2);

  const activeMiniList = miniLeaderboardTab === 'users' ? topUsers : topCountries;

  const countryPixels = selectedCountry 
    ? purchasedPixels.filter(p => p.country === selectedCountry.ADMIN).length 
    : 0;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex flex-col justify-between p-6">
      {/* Cyber Grid Background overlay */}
      <div className="cyber-grid"></div>
      
      {/* Audio Elements */}
      <audio id="bgm-audio" loop src="/bgm.mp3" preload="auto" />
      <audio id="sfx-buy" src="https://actions.google.com/sounds/v1/ui/button_click.ogg" preload="auto" />

      {/* Audio toggle moved to dock - no header bar */}


      {/* Floating Icon Dock - Left Side (3 icons + audio) */}
      <div className="fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={onShowMissions}
          title="Misiuni"
          className="w-11 h-11 glass-panel rounded-xl flex items-center justify-center border border-neonCyan/30 text-neonCyan hover:bg-neonCyan/20 hover:shadow-[0_0_12px_rgba(0,243,255,0.5)] transition-all active:scale-95"
        >
          <Target className="w-5 h-5" />
        </button>
        <button
          onClick={onShowCosmetics}
          title="Magazin"
          className="w-11 h-11 glass-panel rounded-xl flex items-center justify-center border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:shadow-[0_0_12px_rgba(168,85,247,0.5)] transition-all active:scale-95"
        >
          <Award className="w-5 h-5" />
        </button>
        <button
          onClick={onShowMedals}
          title="Profilul Meu"
          className="w-11 h-11 glass-panel rounded-xl flex items-center justify-center border border-neonPurple/30 text-neonPurple hover:bg-neonPurple/20 hover:shadow-[0_0_12px_rgba(188,19,254,0.5)] transition-all active:scale-95"
        >
          <User className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            const newAudioState = !audioEnabled;
            setAudioEnabled(newAudioState);
            const bgm = document.getElementById('bgm-audio');
            if (bgm) {
              if (newAudioState) bgm.play().catch(e => console.log('Audio play failed:', e));
              else bgm.pause();
            }
          }}
          title={audioEnabled ? 'Oprește Muzica' : 'Pornește Muzica'}
          className={`w-11 h-11 glass-panel rounded-xl flex items-center justify-center transition-all active:scale-95 ${
            audioEnabled ? 'border-neonCyan/50 text-neonCyan shadow-[0_0_8px_rgba(0,243,255,0.3)]' : 'border-gray-700/30 text-gray-600'
          }`}
        >
          <Radio className={`w-5 h-5 ${audioEnabled ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 min-h-0 mt-0 w-full">
        
        {/* Leaderboard Left */}
        <div className="hidden md:flex fixed bottom-6 left-6 glass-panel w-80 rounded-2xl p-6 pointer-events-auto max-h-[calc(100vh-120px)] overflow-hidden flex-col z-30">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="text-yellow-400 w-5 h-5" />
            <h2 className="text-xl font-bold glow-text uppercase tracking-wide">Clasament</h2>
          </div>

          <div className="flex gap-2 mb-4 bg-black/40 p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setMiniLeaderboardTab('users')}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${miniLeaderboardTab === 'users' ? 'bg-neonCyan/20 text-neonCyan border border-neonCyan/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Jucători
            </button>
            <button 
              onClick={() => setMiniLeaderboardTab('countries')}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-widest rounded-md transition-all ${miniLeaderboardTab === 'countries' ? 'bg-neonPurple/20 text-neonPurple border border-neonPurple/30' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Țări
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            {activeMiniList.map((item, idx) => {
              const isExpanded = miniLeaderboardTab === 'users' && expandedTopUser === item.name;
              
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col bg-white/5 rounded-lg transition-all cursor-pointer border ${isExpanded ? 'border-neonCyan/50 bg-white/10' : 'border-transparent hover:border-neonCyan/30 hover:bg-white/10'}`}
                  onClick={() => miniLeaderboardTab === 'users' ? setExpandedTopUser(isExpanded ? null : item.name) : null}
                >
                  <div className="flex justify-between items-center p-3">
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${idx === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>#{idx + 1}</span>
                      <span className={`font-semibold ${idx === 0 ? 'text-neonCyan' : 'text-neonPurple'}`}>{item.name}</span>
                    </div>
                    <span className="text-sm font-mono">{item.pixels} px</span>
                  </div>
                  
                  {isExpanded && miniLeaderboardTab === 'users' && (
                    <div className="px-3 pb-3 pt-1 border-t border-white/5 text-xs animate-in slide-in-from-top-2">
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Donație Totală:</span>
                          <span className="text-green-400 font-bold">${item.pixels}.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Grad Obținut:</span>
                          <span className={`font-bold ${getRank(item.pixels).color} uppercase tracking-widest text-[10px]`}>{getRank(item.pixels).icon} {getRank(item.pixels).title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Locație:</span>
                          <span className="text-white font-medium">{item.country}</span>
                        </div>
                        {item.instagram && (
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-gray-400">Contact:</span>
                            <a 
                              href={`https://instagram.com/${item.instagram.replace('@', '')}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[11px] text-pink-400 hover:text-pink-300 font-bold"
                              onClick={e => e.stopPropagation()}
                            >
                              <AtSign className="w-3 h-3" /> @{item.instagram.replace('@', '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <button 
            onClick={onShowLeaderboard}
            className="w-full mt-6 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-2 rounded-lg transition-colors text-sm uppercase font-bold tracking-wider"
          >
            Vezi tot clasamentul
          </button>
        </div>

        {/* Selected Country/Pixel Panel Right */}
        {selectedCountry && conqueredCountries[selectedCountry.ADMIN] ? (
          <div className="flex fixed bottom-0 md:bottom-6 right-0 md:right-6 bg-black/95 md:bg-black/40 backdrop-blur-xl md:glass-panel w-full md:w-96 max-h-[85vh] md:max-h-[calc(100vh-120px)] flex-col rounded-2xl pointer-events-auto border-red-500 border-2 shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all duration-300 animate-in slide-in-from-bottom-10 md:slide-in-from-right-10 overflow-hidden z-50">
            <div className="absolute inset-0 bg-red-900/20 z-0 pointer-events-none"></div>
            
            <div className="p-6 pb-4 border-b border-red-500/30 shrink-0 relative z-10 bg-black/60">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="bg-red-500/20 text-red-500 border border-red-500/50 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse mb-2 inline-block">
                    TERITORIU OCUPAT
                  </div>
                  <h3 className="text-2xl font-bold text-white uppercase flex items-center gap-2">
                    <MapPin className="text-red-500 w-6 h-6" />
                    {selectedCountry.ADMIN}
                  </h3>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-black/50 p-1 rounded">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 relative z-10 flex flex-col justify-center text-center">
              <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">☠️</div>
              <h4 className="text-xl font-bold text-red-400 mb-2 uppercase tracking-widest">
                Supus Imperiului
              </h4>
              <p className="text-gray-300 text-sm mb-8 leading-relaxed px-2">
                Acest teritoriu aparține națiunii <strong className="text-white">{conqueredCountries[selectedCountry.ADMIN]}</strong>. 
                Pentru a obține independența sau a negocia o alianță, trebuie să plătiți tribut.
              </p>
              
              <button 
                onClick={() => alert("Aici va veni integrarea Stripe pentru Subscriptions!")}
                className="w-full bg-red-500/20 hover:bg-red-500/40 border border-red-500 text-red-100 font-bold py-4 rounded-xl text-sm transition-all uppercase tracking-widest flex flex-col justify-center items-center shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]"
              >
                <span>💰 Plătește Tribut Lunar</span>
                <span className="text-[10px] text-red-300 mt-1">($10.00 USD / Lună)</span>
              </button>
            </div>
          </div>
        ) : selectedCountry ? (
          <div className="flex fixed bottom-0 md:bottom-6 right-0 md:right-6 bg-black/95 md:bg-black/40 backdrop-blur-xl md:glass-panel w-full md:w-96 h-[85vh] md:h-auto md:max-h-[calc(100vh-120px)] flex-col rounded-t-3xl md:rounded-2xl pointer-events-auto border-t md:border border-neonCyan transition-all duration-300 animate-in slide-in-from-bottom-10 md:slide-in-from-right-10 overflow-hidden z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] md:shadow-none">
            <div className="p-6 pb-4 border-b border-white/10 shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white uppercase flex items-center gap-2">
                    <MapPin className="text-neonCyan w-6 h-6" />
                    {selectedCountry.ADMIN}
                  </h3>
                  <div className="text-xs font-mono text-gray-400 mt-1">
                    {countryPixels} / 5000 Pixeli Ocupați
                  </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4">
                <button 
                  onClick={onShowCountryDetails}
                  className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 mb-3"
                >
                  <Shield className="w-4 h-4 text-neonCyan" /> Vezi Diplomație & Banca Centrală
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Status Armată</span>
                  <span className={`text-sm font-black ${countryPixels >= 100 ? 'text-red-500 animate-pulse' : 'text-neonCyan'}`}>
                    {countryPixels >= 100 ? 'SUPERPUTERE' : `${(Math.min(100, (countryPixels / 5000) * 100)).toFixed(1)}%`}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden border border-white/5 relative">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-1000 ${countryPixels >= 100 ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-neonCyan shadow-[0_0_10px_#00f3ff]'}`}
                    style={{ width: `${Math.min(100, (countryPixels / 5000) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Tabs */}
              {countryPixels > 0 && (
                <div className="flex gap-2 mt-4 bg-black/40 p-1 rounded-lg border border-white/5">
                  <button 
                    onClick={() => setRightPanelTab('patriots')}
                    onTouchEnd={(e) => { e.preventDefault(); setRightPanelTab('patriots'); }}
                    className={`flex-1 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md transition-all ${rightPanelTab === 'patriots' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <span className="hidden md:inline">👤 Patrioți</span>
                    <span className="md:hidden text-sm">👤</span>
                  </button>
                  <button 
                    onClick={() => setRightPanelTab('wars')}
                    onTouchEnd={(e) => { e.preventDefault(); setRightPanelTab('wars'); }}
                    className={`flex-1 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md transition-all ${rightPanelTab === 'wars' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <span className="hidden md:inline">⚔️ Război</span>
                    <span className="md:hidden text-sm">⚔️</span>
                  </button>

                  <button 
                    onClick={() => setRightPanelTab('alliances')}
                    onTouchEnd={(e) => { e.preventDefault(); setRightPanelTab('alliances'); }}
                    className={`flex-1 py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-md transition-all ${rightPanelTab === 'alliances' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    <span className="hidden md:inline">🛡️ Alianțe</span>
                    <span className="md:hidden text-sm">🛡️</span>
                  </button>
                </div>
              )}
            </div>

            {/* Scrolling Content Area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1 space-y-2 bg-black/20 custom-scrollbar border-b border-white/10">
              {rightPanelTab === 'patriots' ? (
                <div className="flex flex-col gap-4">
                  <CountryLogo 
                    countryName={selectedCountry.ADMIN}
                    purchasedPixels={purchasedPixels}
                    userName={name || 'Eu'}
                    initialLogoName={selectedLogoName}
                    initialLogoEvent={selectedLogoEvent}
                    userBalance={userBalance}
                    onUpdateBalance={onUpdateBalance}
                    onInvestInUser={onInvestInUser}
                    onRevolutionSuccess={onRevolutionSuccess}
                    onBuyPixelsForLogo={(countryName) => {
                      const logoKey = `hexglobe_logo_${countryName}`;
                      const saved = localStorage.getItem(logoKey);
                      if (saved) {
                        const data = JSON.parse(saved);
                        data.currentPixels = (data.currentPixels || 0) + 1;
                        if (!data.supporters) data.supporters = [];
                        data.supporters.push({ name: name || 'Anonim', timestamp: Date.now() });
                        localStorage.setItem(logoKey, JSON.stringify(data));
                      }
                    }}
                  />
                </div>
              ) : rightPanelTab === 'wars' ? (() => {
                // REAL WARS LOGIC
                let currentWars = activeAttacks
                  .filter(a => a.source === selectedCountry.ADMIN || a.target === selectedCountry.ADMIN)
                  .map(a => {
                    const isAttacking = a.source === selectedCountry.ADMIN;
                    const opponent = isAttacking ? a.target : a.source;
                    const attackingCountry = a.source;
                    const troops = purchasedPixels.filter(p => p.country === attackingCountry).slice(0, 30);
                    
                    return {
                      id: a.id,
                      type: isAttacking ? 'attack' : 'defend',
                      target: opponent,
                      troops: troops.length > 0 ? troops : [{ name: 'Forțe Speciale' }]
                    };
                  });

                return (
                  <div className="flex flex-col gap-4">
                    <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                        <Crosshair className="w-4 h-4 text-red-500" /> Operațiuni Agresive
                      </h4>
                      {countryPixels < 500 ? (
                        <div className="text-xs text-red-400/80 bg-red-500/10 p-2 rounded border border-red-500/20">
                          ❌ Necesar: Minim 500 de pixeli ocupați în această țară pentru a putea lansa un atac împotriva altor națiuni.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <select 
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-500 text-sm"
                            value={attackTarget}
                            onChange={(e) => setAttackTarget(e.target.value)}
                          >
                            <option value="">-- Selectează Ținta --</option>
                            {['United States of America', 'Russia', 'China', 'Germany', 'France', 'Japan', 'Romania'].filter(c => c !== selectedCountry.ADMIN).map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => {
                              if (!attackTarget) return alert('Selectează o țară țintă!');
                              onAttackEvent(selectedCountry.ADMIN, attackTarget);
                              setAttackTarget('');
                            }}
                            className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] uppercase tracking-wider text-sm flex justify-center items-center gap-2"
                          >
                            <Swords className="w-4 h-4" /> LANSEAZĂ ATAC
                          </button>
                        </div>
                      )}
                    </div>

                    {currentWars.length === 0 ? (
                      <div className="text-center p-4 text-gray-500 text-sm">Pace totală. Această națiune nu este implicată în niciun război.</div>
                    ) : currentWars.map(war => {
                  const isExpanded = expandedWar === war.id;
                  const isAttack = war.type === 'attack';
                  return (
                    <div key={war.id} className={`bg-black/40 border rounded-xl overflow-hidden transition-all ${isAttack ? 'border-red-500/30' : 'border-orange-500/30'}`}>
                       <div 
                         className={`p-3 cursor-pointer flex justify-between items-center ${isAttack ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-orange-500/10 hover:bg-orange-500/20'}`}
                         onClick={() => setExpandedWar(isExpanded ? null : war.id)}
                       >
                         <div>
                           <div className={`text-[10px] font-bold uppercase tracking-widest ${isAttack ? 'text-red-400' : 'text-orange-400'}`}>
                             {isAttack ? `🎯 ${selectedCountry.ADMIN} ATACĂ` : `🛡️ ATACAT DE`}
                           </div>
                           <div className="font-bold text-white mt-1 flex items-center gap-2">
                             {countryMap[war.target] && (
                               <img src={`https://flagcdn.com/w20/${countryMap[war.target]}.png`} className="w-4 h-3 shadow-sm rounded-sm" />
                             )}
                             {war.target}
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="text-xl font-black text-white">{war.troops.length}</div>
                           <div className="text-[9px] text-gray-400 uppercase">Patrioți Implicați</div>
                         </div>
                       </div>
                       
                       {isExpanded && (
                         <div className="p-3 border-t border-white/5 space-y-2">
                           <div className="text-xs text-gray-400 font-bold mb-2 uppercase border-b border-white/10 pb-1">Lista Trupelor:</div>
                           {war.troops.map((t, i) => (
                             <div key={i} className="flex justify-between items-center bg-white/5 p-1.5 rounded text-xs">
                               <div className="font-medium text-gray-300">👤 {t.name}</div>
                               <div className="text-neonCyan font-bold">$1</div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                  );
                })}
                </div>
              );
              })() : rightPanelTab === 'alliances' ? (
                <div className="flex flex-col gap-4 p-2">
                  <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                     <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-3 flex justify-between items-center">
                        <span>Alianțe Active</span>
                        <span className="text-purple-400 text-xs bg-purple-500/20 px-2 py-0.5 rounded-full">
                           {alliances.filter(a => a.countryA === selectedCountry.ADMIN || a.countryB === selectedCountry.ADMIN).length} / 2
                        </span>
                     </h4>
                     
                     {alliances.filter(a => a.countryA === selectedCountry.ADMIN || a.countryB === selectedCountry.ADMIN).length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-white/10 rounded-lg">
                           <Shield className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
                           <p className="text-xs text-gray-500 italic">Nicio alianță activă. Fii primul care înființează una!</p>
                        </div>
                     ) : (
                        <div className="space-y-2">
                           {alliances.filter(a => a.countryA === selectedCountry.ADMIN || a.countryB === selectedCountry.ADMIN).map((a, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-gradient-to-r from-black/60 to-black/30 border border-white/10 rounded-lg p-2.5 hover:border-white/30 transition-all">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-black flex items-center justify-center border" style={{ borderColor: a.color, boxShadow: `0 0 10px ${a.color}40` }}>
                                       <span className="text-lg" style={{ filter: `drop-shadow(0 0 5px ${a.color})` }}>{a.crest}</span>
                                    </div>
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">{a.name}</span>
                                 </div>
                                 <button onClick={() => alert('Vei putea adera la alianțe în versiunea finală!')} className="text-[10px] font-bold bg-white text-black px-3 py-1.5 rounded hover:bg-neonCyan hover:shadow-[0_0_10px_#00f3ff] transition-all uppercase tracking-widest">Aderă</button>
                              </div>
                           ))}
                        </div>
                     )}
                     
                     <div className="mt-4 pt-4 border-t border-white/10">
                        <button 
                          onClick={() => {
                             const currentUser = localStorage.getItem('hexglobe_username') || 'Anonim';
                             const userPx = userStats[currentUser]?.pixels || 0;
                             if (userPx < 1000) {
                                alert(`Trebuie să fii Președinte (minim 1000 pixeli) pentru a înființa o Alianță! Tu ai momentan ${userPx} pixeli pe glob.`);
                             } else {
                                onShowCountryDetails();
                             }
                          }}
                          className="w-full bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500 text-purple-100 font-bold py-3 rounded-xl text-xs transition-all uppercase tracking-widest flex flex-col justify-center items-center shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                        >
                           <span>🛡️ Înființează Alianță Nouă</span>
                           <span className="text-[9px] text-purple-300 mt-1 font-mono">Cerere: Rank Președinte (1000 Pixeli)</span>
                        </button>
                     </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Purchase Form (Fixed Bottom) */}
            <div className="p-6 shrink-0">
              <div className="bg-black/40 rounded-lg p-3 mb-4 border border-white/5 space-y-3">
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-md border border-white/10 focus-within:border-neonCyan transition-colors">
                  <User className="text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Numele tău" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 text-xs"
                  />
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-md border border-white/10 focus-within:border-neonPurple transition-colors">
                  <AtSign className="text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Instagram (Opțional)" 
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 text-xs"
                  />
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-md border border-white/10 focus-within:border-neonCyan transition-colors">
                  <Link className="text-gray-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Website / TikTok (Opțional)" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 text-xs"
                  />
                </div>
                
                <div className="flex items-start gap-3 bg-white/5 p-2 rounded-md border border-white/10 focus-within:border-neonCyan transition-colors">
                  <textarea 
                    placeholder="Câteva cuvinte despre tine / mesaj (Opțional)" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    maxLength={100}
                    className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500 text-xs resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mb-4 px-2">
                  <span className="text-gray-400 text-xs">Cost Pixel:</span>
                  <span className="text-white text-sm font-bold font-mono">$1.00 USD</span>
              </div>
              
              {/* FOMO Attackers Counter */}
              <div className="bg-neonCyan/10 border border-neonCyan/30 rounded-lg p-2 mb-4 flex items-center justify-center gap-2 animate-pulse">
                <span className="text-neonCyan text-sm">👤</span>
                <span className="text-neonCyan/80 text-xs font-bold uppercase tracking-wide">
                  <span className="text-white font-black">{Math.floor(Date.now() / 150000 % 15) + 3 + (countryPixels > 50 ? 25 : 0)}</span> utilizatori online în țara ta
                </span>
              </div>

              <button 
                onClick={handleBuy}
                disabled={isProcessing}
                className={`w-full font-bold py-3 rounded-xl text-sm transition-all uppercase tracking-widest flex justify-center items-center ${
                  countryPixels >= 100 
                  ? 'bg-red-500/20 hover:bg-red-500/40 border border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]'
                  : 'bg-neonCyan/20 hover:bg-neonCyan/40 border border-neonCyan text-neonCyan shadow-[0_0_15px_rgba(0,243,255,0.3)] hover:shadow-[0_0_25px_rgba(0,243,255,0.6)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProcessing ? 'Se procesează...' : (countryPixels >= 100 ? '🔥 APĂRĂ ȚARA / CUMPĂRĂ PIXEL' : 'Cumpără Pixel')}
              </button>
            </div>
          </div>
        ) : selectedPixel ? (
          <div className="hidden md:flex glass-panel w-96 rounded-2xl p-6 pointer-events-auto border-neonPurple border transition-all duration-300">
             <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white uppercase flex items-center gap-2">
                  <User className="text-neonPurple w-6 h-6" />
                  Pixel Ocupat
                </h3>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-black/40 rounded-xl p-6 mt-4 border border-neonPurple/30 text-center">
              <div className="w-16 h-16 bg-neonPurple/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-neonPurple shadow-[0_0_15px_rgba(188,19,254,0.5)]">
                <span className="text-2xl">👾</span>
              </div>
              <h4 className="text-xl font-bold text-white mb-1">{selectedPixel.name}</h4>
              {selectedPixel.instagram && (
                <a href={`https://instagram.com/${selectedPixel.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="text-neonPurple hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium mt-1">
                  <AtSign className="w-4 h-4" /> @{selectedPixel.instagram.replace('@', '')}
                </a>
              )}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm">📍 Locație: <span className="text-neonCyan font-semibold">{selectedPixel.country}</span></p>
              </div>
            </div>
          </div>
        ) : (
            <div className="hidden md:block w-96 p-6">
            <p className="text-gray-400 text-sm animate-pulse text-right">
              Selectează o țară de pe glob...
            </p>
          </div>
        )}
      </div>

      {/* Live Battle Feed (Notifications) */}
      {!selectedCountry && !selectedPixel && (
        <div className="hidden md:flex fixed bottom-6 right-6 w-[350px] pointer-events-none z-50">
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-2 overflow-hidden border-neonPurple/30 shadow-[0_0_20px_rgba(188,19,254,0.15)] w-full">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              <Radio className="w-4 h-4 text-neonPurple animate-pulse" />
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">NOTIFICATIONS</h3>
              <div className="ml-auto flex items-center gap-1 bg-neonPurple/20 px-2 py-0.5 rounded border border-neonPurple/50">
                 <div className="w-1.5 h-1.5 bg-neonPurple rounded-full animate-pulse"></div>
                 <span className="text-[9px] text-neonPurple font-bold uppercase tracking-widest">Live</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 relative h-[140px] overflow-hidden">
              {activityFeed.length === 0 ? (
                <div className="text-xs text-gray-500 italic text-center mt-4">Se scanează activitatea...</div>
              ) : (
                activityFeed.map((msg) => (
                  <div key={msg.id} className="text-[13px] bg-black/40 rounded-lg p-2 border border-white/5 animate-in fade-in slide-in-from-top-2 flex gap-3 items-center">
                    <span className="text-[10px] text-gray-500 font-mono shrink-0">{msg.time}</span>
                    <span dangerouslySetInnerHTML={{ __html: msg.text }} className="text-gray-300" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Countries Modal */}
      {showAllCountries && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 pointer-events-auto">
          <div className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl border border-neonCyan/50 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
                <MapPin className="text-neonCyan w-6 h-6" />
                Toate Țările Disponibile
              </h2>
              <button onClick={() => setShowAllCountries(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar grid grid-cols-2 gap-4">
              {Object.keys(countryMap).sort().map(countryName => (
                <div 
                  key={countryName} 
                  onClick={() => {
                    if (onSelectCountry) onSelectCountry(countryName);
                    setShowAllCountries(false);
                  }}
                  className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center gap-3 hover:bg-white/10 hover:border-neonCyan/50 transition-colors cursor-pointer"
                >
                  <img src={`https://flagcdn.com/w40/${countryMap[countryName]}.png`} className="w-8 h-6 rounded-sm shadow-md" alt={countryName} />
                  <span className="text-gray-200 font-medium">{countryName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
