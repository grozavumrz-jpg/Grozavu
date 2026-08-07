import React, { useState, useEffect } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import GlobeComponent from './components/GlobeComponent';
import UIOverlay from './components/UIOverlay';
import LeaderboardModal from './components/LeaderboardModal';
import LandingPage from './components/LandingPage';
import CountryDetailsModal from './components/CountryDetailsModal';
import AlienFleet from './components/AlienFleet';
import BottomChatBar from './components/BottomChatBar';
import FlashEvent from './components/FlashEvent';
import DailyMissions from './components/DailyMissions';
import UserProfile from './components/UserProfile';
import LuckyWheel from './components/LuckyWheel';
import UfoPanel from './components/UfoPanel';
import AttackAlert from './components/AttackAlert';
import CosmeticsShop from './components/CosmeticsShop';
import PrivateChat from './components/PrivateChat';
import AllianceDetailsModal from './components/AllianceDetailsModal';
import UserProfileModal from './components/UserProfileModal';
function App() {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedPixel, setSelectedPixel] = useState(null);
  const [selectedLogoName, setSelectedLogoName] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showCountryDetails, setShowCountryDetails] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeAttacks, setActiveAttacks] = useState([]);
  const [selectedAlliance, setSelectedAlliance] = useState(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState(null);
  
  // New engagement feature states
  const [showMissions, setShowMissions] = useState(false);
  const [showMedals, setShowMedals] = useState(false);
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);
  const [lastReward, setLastReward] = useState(null);
  const [showUfoPanel, setShowUfoPanel] = useState(false);
  const [showCosmeticsShop, setShowCosmeticsShop] = useState(false);
  const [alliances, setAlliances] = useState(() => {
    const defaultAlliances = [
      { countryA: 'Romania', countryB: 'Moldova', expiresAt: Date.now() + 100000000, name: 'Lupii Daci', crest: '🐺', color: '#bc13fe', creator: 'VladTepes', website: 'www.lupiidaci.ro', logoUrl: 'https://images.unsplash.com/photo-1596726916538-4e1223e71dcb?auto=format&fit=crop&q=80&w=200', hp: 1000, maxHp: 1000 },
      { countryA: 'United States of America', countryB: 'Canada', expiresAt: Date.now() + 100000000, name: 'Vulturul de Fier', crest: '🦅', color: '#ff4444', creator: 'CryptoKing', website: 'www.iron-eagle.us', logoUrl: 'https://images.unsplash.com/photo-1555621415-081cf50d2493?auto=format&fit=crop&q=80&w=200', hp: 1000, maxHp: 1000 }
    ];
    const saved = localStorage.getItem('hexglobe_alliances');
    return saved ? JSON.parse(saved).slice(0, 2) : defaultAlliances;
  });
  
  // Track how many pixels were donated for each country's bank
  const [countryBankFunds, setCountryBankFunds] = useState(() => {
    const saved = localStorage.getItem('hexglobe_bank_funds');
    return saved ? JSON.parse(saved) : {};
  });

  // Economy State
  const [userBalance, setUserBalance] = useState(() => {
    return parseInt(localStorage.getItem('hexglobe_user_balance') || '0', 10);
  });
  
  const [userInventory, setUserInventory] = useState(() => {
    const saved = localStorage.getItem('hexglobe_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [equippedCosmetics, setEquippedCosmetics] = useState(() => {
    const saved = localStorage.getItem('hexglobe_equipped');
    return saved ? JSON.parse(saved) : { title: null, chat: null, avatar: null };
  });

  const [activeBoosts, setActiveBoosts] = useState(() => {
    const saved = localStorage.getItem('hexglobe_boosts');
    return saved ? JSON.parse(saved) : [];
  });

  const [activePrivateChats, setActivePrivateChats] = useState([]);

  const handleOpenPrivateChat = (username) => {
    if (username === 'Eu' || username === 'Anonim') return;
    if (!activePrivateChats.includes(username)) {
      setActivePrivateChats(prev => [...prev, username]);
    }
  };

  const handleClosePrivateChat = (username) => {
    setActivePrivateChats(prev => prev.filter(u => u !== username));
  };

  const updateUserBalance = (amount) => {
    setUserBalance(prev => {
      const newBal = prev + amount;
      return newBal;
    });
  };

  const unlockCosmetic = (itemId) => {
    setUserInventory(prev => {
      if (prev.includes(itemId)) return prev;
      const newInv = [...prev, itemId];
      return newInv;
    });
  };

  // Track online time
  useEffect(() => {
    localStorage.setItem('hexglobe_user_balance', userBalance.toString());
  }, [userBalance]);

  useEffect(() => {
    localStorage.setItem('hexglobe_inventory', JSON.stringify(userInventory));
  }, [userInventory]);

  useEffect(() => {
    localStorage.setItem('hexglobe_equipped', JSON.stringify(equippedCosmetics));
  }, [equippedCosmetics]);

  useEffect(() => {
    localStorage.setItem('hexglobe_boosts', JSON.stringify(activeBoosts));
  }, [activeBoosts]);

  useEffect(() => {
    localStorage.setItem('hexglobe_bank_funds', JSON.stringify(countryBankFunds));
  }, [countryBankFunds]);

  useEffect(() => {
    localStorage.setItem('hexglobe_alliances', JSON.stringify(alliances));
  }, [alliances]);

  const handleAttackAlliance = (allianceName, amount, isDefend) => {
    if (userBalance < amount) return false;
    updateUserBalance(-amount);

    setAlliances(prev => prev.map(a => {
       if (a.name === allianceName) {
          let newHp = isDefend ? a.hp + amount : a.hp - amount;
          if (newHp > a.maxHp) newHp = a.maxHp;
          
          let newConqueror = a.conqueror;
          let newFlag = a.conquerorFlag;

          if (newHp <= 0) {
             newHp = a.maxHp; // Refill HP for the new owner
             newConqueror = "Eu"; // the current player
             newFlag = "ro"; // hardcoded flag for player
             alert(`Felicitări! Ai distrus apărarea alianței ${a.name} și acum îți aparține!`);
          }

          // Trigger visual effects on both countries of the alliance
          const color = isDefend ? '#22c55e' : '#ef4444'; // Green if defending, Red if attacking
          setActiveAttacks(attacks => [
             ...attacks,
             { target: a.countryA, id: Date.now(), color: color, laserColor: color, lasersCount: 3 },
             { target: a.countryB, id: Date.now() + 1, color: color, laserColor: color, lasersCount: 3 }
          ]);
          setTimeout(() => {
             setActiveAttacks(attacks => attacks.slice(2));
          }, 3000);

          return { ...a, hp: newHp, conqueror: newConqueror, conquerorFlag: newFlag };
       }
       return a;
    }));
    return true;
  };

  const handleInvestInUser = (username, amount) => {
     if (userBalance < amount) return false;
     updateUserBalance(-amount);
     
     // To invest in a user, we simply generate dummy "pixels" for them in the db
     setPurchasedPixels(prev => {
        const existing = prev.find(p => p.name === username);
        // Add a single "bulk" pixel to represent the investment, preventing array explosion
         const dummyPixel = {
            name: username,
            country: existing ? existing.country : "Romania",
            lat: existing ? existing.lat + (Math.random() - 0.5) * 1 : 0,
            lng: existing ? existing.lng + (Math.random() - 0.5) * 1 : 0,
            isBulk: true,
            amount: amount
         };

         // Find existing pixel to target laser
        if (existing && existing.lat && existing.lng) {
           setActiveAttacks(attacks => [
              ...attacks,
              { lat: existing.lat, lng: existing.lng, id: Date.now(), color: '#00f3ff', laserColor: '#00f3ff', lasersCount: 5 }
           ]);
           setTimeout(() => {
              setActiveAttacks(attacks => attacks.slice(1));
           }, 3000);
        }

        return [...prev, dummyPixel];
     });
     alert(`Ai investit ${amount} pixeli în ${username}!`);
     return true;
  };

  const handleRevolutionSuccess = (countryName, emperorName, revolutionaries) => {
     setPurchasedPixels(prev => {
        let newPixels = [...prev];
        const emperorPixelsArr = newPixels.filter(p => p.name === emperorName && p.country === countryName);
        let emperorTotal = 0;
        emperorPixelsArr.forEach(p => { emperorTotal += (p.amount || 1); });
        
        const loss = Math.floor(emperorTotal / 2);
        if (loss <= 0) return prev;

        let remainingLoss = loss;
        for (let i = 0; i < newPixels.length; i++) {
           if (newPixels[i].name === emperorName && newPixels[i].country === countryName) {
              const amt = newPixels[i].amount || 1;
              if (remainingLoss >= amt) {
                 newPixels[i].amount = 0; 
                 remainingLoss -= amt;
              } else {
                 newPixels[i].amount = amt - remainingLoss;
                 remainingLoss = 0;
              }
              if (remainingLoss <= 0) break;
           }
        }
        
        newPixels = newPixels.filter(p => p.amount !== 0);

        let totalContributions = 0;
        Object.values(revolutionaries).forEach(amt => { totalContributions += amt; });
        
        if (totalContributions > 0) {
           Object.entries(revolutionaries).forEach(([revName, revAmt]) => {
              const share = Math.floor((revAmt / totalContributions) * loss);
              if (share > 0) {
                 const existing = newPixels.find(p => p.name === revName && p.country === countryName);
                 newPixels.push({
                    lat: existing ? existing.lat : 45 + (Math.random() - 0.5),
                    lng: existing ? existing.lng : 25 + (Math.random() - 0.5),
                    color: 'rgba(255,0,0,0.8)',
                    name: revName,
                    country: countryName,
                    amount: share,
                    isBulk: true
                 });
              }
           });
        }
        return newPixels;
     });
     
     alert(`🔥 REVOLUȚIE REUȘITĂ ÎN ${countryName.toUpperCase()}! ${emperorName} a fost detronat și a pierdut ${Math.floor(emperorTotal / 2)} pixeli!`);
  };

  useEffect(() => {
    const handleMapPixelClick = (e) => {
      const { country, lat, lng, name } = e.detail;
      setSelectedCountry({ ADMIN: country, clickLat: lat, clickLng: lng, preventZoom: true });
      setSelectedLogoName({ name, timestamp: Date.now() }); // Force update every time
    };
    window.addEventListener('mapPixelClick', handleMapPixelClick);
    const handleMapAllianceClick = (e) => {
      setSelectedAlliance(e.detail);
    };
    window.addEventListener('mapAllianceClick', handleMapAllianceClick);

    return () => {
      window.removeEventListener('mapPixelClick', handleMapPixelClick);
      window.removeEventListener('mapAllianceClick', handleMapAllianceClick);
    };
  }, []);

  // World Boss State
  const [worldBoss, setWorldBoss] = useState(() => { return null;
    try {
      const saved = localStorage.getItem('hexglobe_worldBoss');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      active: true,
      country: "Japan",
      lat: 36.2048,
      lng: 138.2529,
      hp: 50000,
      maxHp: 50000,
      attackers: []
    };
  });
  
  useEffect(() => {
    localStorage.setItem('hexglobe_worldBoss', JSON.stringify(worldBoss));
  }, [worldBoss]);
  
  // MOCK: Conquered Countries (e.g. Romania conquered its neighbors)
  const [conqueredCountries, setConqueredCountries] = useState(() => {
    try {
      const saved = localStorage.getItem('hexglobe_conqueredCountries');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      "Hungary": "Romania",
      "Moldova": "Romania",
      "Bulgaria": "Romania"
    };
  });

  useEffect(() => {
    localStorage.setItem('hexglobe_conqueredCountries', JSON.stringify(conqueredCountries));
  }, [conqueredCountries]);
  
  // Generate 100 unique Romanian players with profiles, websites and logos
  const romanianNames = [
    'Ionut Pop', 'Alex Dragomir', 'Mihai Viteazu', 'Stefan Cel Mare', 'Andrei Muresan',
    'Vlad Tepes', 'Cristian Enache', 'Dan Popescu', 'Radu Negru', 'George Lazar',
    'Adrian Costea', 'Bogdan Tudor', 'Catalin Morar', 'Dragos Filip', 'Emil Stan',
    'Florin Popa', 'Gabriel Iancu', 'Horia Brenciu', 'Ion Barbu', 'Liviu Marin',
    'Marius Niculae', 'Nicolae Balcescu', 'Ovidiu Preda', 'Petru Rares', 'Razvan Dima',
    'Silviu Lung', 'Tudor Vladimirescu', 'Vasile Conta', 'Mircea Eliade', 'Ciprian Tatarusanu',
    'Dorin Rotariu', 'Eugen Trică', 'Felix Magath', 'Gheorghe Hagi', 'Ilie Nastase',
    'Jean Barbu', 'Kelemen Hunor', 'Laurentiu Duta', 'Marian Dragulescu', 'Nicu Gheara',
    'Octavian Popescu', 'Pavel Nedved', 'Robert Negoita', 'Sorin Oprescu', 'Traian Basescu',
    'Lucian Bute', 'Victor Ponta', 'Xander Pop', 'Zenon Dobre', 'Alin Stoica',
    'CyberWolf_RO', 'DragonSlayer_RO', 'NeonNinja_RO', 'PhoenixFire_RO', 'IceBreaker_RO',
    'StormRider_RO', 'ShadowKing_RO', 'DarkKnight_RO', 'CryptoKing_RO', 'PixelMaster_RO',
    'RocketMan_RO', 'LaserEyes_RO', 'TurboMax_RO', 'BladeRunner_RO', 'NightOwl_RO',
    'SunWarrior_RO', 'MoonWalker_RO', 'StarLord_RO', 'ThunderBolt_RO', 'FireStorm_RO',
    'AquaMan_RO', 'IronFist_RO', 'GoldDigger_RO', 'SilverFox_RO', 'BronzeAge_RO',
    'DiamondHands_RO', 'PlatinumX_RO', 'TitaniumRO', 'ChromeHeart_RO', 'NeonLight_RO',
    'GlitchMaster_RO', 'ByteForce_RO', 'DataStorm_RO', 'CodeBreaker_RO', 'HexMaster_RO',
    'PixelArt_RO', 'VoxelKing_RO', 'BitCrusher_RO', 'WaveRider_RO', 'BassDropRO',
    'EchoFox_RO', 'AlphaWolf_RO', 'BetaTest_RO', 'GammaRay_RO', 'DeltaForce_RO',
    'OmegaX_RO', 'SigmaGrind_RO', 'ZetaPrime_RO', 'ThetaWave_RO', 'KappaKing_RO'
  ];

  const websitesList = [
    'ionutpop.ro', 'alexdragomir.com', 'mihaiviteazu.ro', 'stefancelmare.md', 'andreimuresan.dev',
    'vladtepes.ro', 'cristianenache.com', 'danpopescu.ro', 'radunegru.net', 'georgelazar.ro',
    'adriancostea.com', 'bogdantudor.ro', 'catalinmorar.ro', 'dragosfilip.dev', 'emilstan.ro',
    'florinpopa.com', 'gabrieliancu.ro', 'horiabrenciu.ro', 'ionbarbu.net', 'liviuofficialro.com',
    'mariusniculae.ro', 'balcescu.ro', 'ovidiupreda.com', 'petrurares.ro', 'razvandima.dev',
    'silviulung.ro', 'tudorvladimirescu.ro', 'vasileconta.net', 'mirceaeliade.ro', 'ciprian.ro',
    'dorinrotariu.com', 'trica.ro', 'felixm.com', 'gheorghehagi.ro', 'ilienastase.ro',
    'jeanbarbu.ro', 'kelemen.ro', 'laurentiuduta.com', 'dragulescu.ro', 'nicugheara.ro',
    'tiktok.com/@octavian_pop', 'tiktok.com/@pavel_ro', 'robertnegoita.ro', 'sorin.ro', 'traian.ro',
    'lucianbute.com', 'victorponta.ro', 'xanderpop.dev', 'zenondobre.ro', 'alinstoica.com',
    'cyberwolf.gg', 'dragonslayer.gg', 'neonninja.gg', 'phoenixfire.gg', 'icebreaker.gg',
    'stormrider.gg', 'shadowking.gg', 'darkknight.gg', 'cryptoking.gg', 'pixelmaster.gg',
    'rocketman.gg', 'lasereyes.gg', 'turbomax.gg', 'bladerunner.gg', 'nightowl.gg',
    'sunwarrior.gg', 'moonwalker.gg', 'starlord.gg', 'thunderbolt.gg', 'firestorm.gg',
    'aquaman.gg', 'ironfist.gg', 'golddigger.gg', 'silverfox.gg', 'bronzeage.gg',
    'diamondhands.gg', 'platinumx.gg', 'titanium.gg', 'chromeheart.gg', 'neonlight.gg',
    'glitchmaster.dev', 'byteforce.dev', 'datastorm.dev', 'codebreaker.dev', 'hexmaster.dev',
    'pixelart.dev', 'voxelking.dev', 'bitcrusher.dev', 'waverider.dev', 'bassdrop.dev',
    'echofox.dev', 'alphawolf.dev', 'betatest.dev', 'gammaray.dev', 'deltaforce.dev',
    'omegax.dev', 'sigmagrind.dev', 'zetaprime.dev', 'thetawave.dev', 'kappaking.dev'
  ];

  const instagramList = [
    'ionut_3d', 'alex.drago', 'mihai_viteazu', 'stefan.mare', 'andrei.m',
    'vlad.tepes', 'cristi.e', 'dan.pop', 'radu.negru', 'george.lazar',
    'adrian.c', 'bogdan.t', 'catalin.m', 'dragos.f', 'emil.stan',
    'florin.popa', 'gabriel.i', 'horia.b', 'ion.barbu', 'liviu.m',
    'marius.n', 'nicolae.b', 'ovidiu.p', 'petru.r', 'razvan.d',
    'silviu.l', 'tudor.v', 'vasile.c', 'mircea.e', 'ciprian.t',
    'dorin.r', 'eugen.t', 'felix.m', 'gheorghe.hagi', 'ilie.n',
    'jean.b', 'kelemen.h', 'laurentiu.d', 'marian.d', 'nicu.g',
    'octavian.p', 'pavel.n', 'robert.n', 'sorin.o', 'traian.b',
    'lucian.b', 'victor.p', 'xander.p', 'zenon.d', 'alin.s',
    'cyberwolf_ro', 'dragonslayer_ro', 'neonninja_ro', 'phoenixfire_ro', 'icebreaker_ro',
    'stormrider_ro', 'shadowking_ro', 'darkknight_ro', 'cryptoking_ro', 'pixelmaster_ro',
    'rocketman_ro', 'lasereyes_ro', 'turbomax_ro', 'bladerunner_ro', 'nightowl_ro',
    'sunwarrior_ro', 'moonwalker_ro', 'starlord_ro', 'thunderbolt_ro', 'firestorm_ro',
    'aquaman_ro', 'ironfist_ro', 'golddigger_ro', 'silverfox_ro', 'bronzeage_ro',
    'diamondhands_ro', 'platinumx_ro', 'titanium_ro', 'chromeheart_ro', 'neonlight_ro',
    'glitchmaster', 'byteforce', 'datastorm', 'codebreaker', 'hexmaster',
    'pixelart', 'voxelking', 'bitcrusher', 'waverider', 'bassdrop',
    'echofox', 'alphawolf', 'betatest', 'gammaray', 'deltaforce',
    'omegax', 'sigmagrind', 'zetaprime', 'thetawave', 'kappaking'
  ];

  const dummyRomaniaPixels = romanianNames.map((playerName, i) => {
    const row = Math.floor(i / 10);
    const col = i % 10;
    const latStep = 0.3; // Approx 30km
    const lngStep = 0.4; // Approx 30km at this latitude
    return {
      lat: 45.9432 + (4.5 - row) * latStep, // top to bottom
      lng: 24.9668 + (col - 4.5) * lngStep, // left to right
      name: playerName,
      instagram: instagramList[i] || '',
      website: websitesList[i] || '',
      bio: i < 15 ? `Salut, sunt ${playerName} și acesta este colțul meu din România! 💪🚀` : '',
      country: "Romania"
    };
  });

  // Seed 5 logos for the first 5 players
  useEffect(() => {
    const logos = ['/logos/logo1.png', '/logos/logo2.png', '/logos/logo3.png', '/logos/logo4.png', '/logos/logo5.png'];
    const topPlayers = dummyRomaniaPixels.slice(0, 5);
    topPlayers.forEach((p, idx) => {
      const key = `hexglobe_logo_Romania_${p.name}`;
      // Force overwrite for demonstration purposes so the user always sees them
      const logoData = {
        imageBase64: logos[idx],
        ownerName: p.name,
        ownerWebsite: p.website || '',
        ownerInstagram: p.instagram || '',
        targetPixels: 100,
        currentPixels: idx < 2 ? 100 : 45, // first 2 are complete, rest incomplete
        supporters: [{ name: 'Sponsor Anonim', timestamp: Date.now() }]
      };
      localStorage.setItem(key, JSON.stringify(logoData));
    });
  }, []);

  const [purchasedPixels, setPurchasedPixels] = useState(() => {
    try {
      const saved = localStorage.getItem('hexglobe_purchasedPixels');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return [
      ...dummyRomaniaPixels,
      { lat: 37.0902, lng: -95.7129, name: "NeonNinja", instagram: "cyber.ninja", website: "neonninja.gg", country: "United States of America" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('hexglobe_purchasedPixels', JSON.stringify(purchasedPixels));
  }, [purchasedPixels]);

  useEffect(() => {
    const timer = setInterval(() => {
      // 1. Update online time
      const current = parseInt(localStorage.getItem('onlineTimeMinutes') || '0', 10);
      localStorage.setItem('onlineTimeMinutes', current + 1);

      // 2. Central Bank Dividends (Accelerated for prototype: 1 Px / minute instead of hour)
      const currentUser = localStorage.getItem('hexglobe_username') || 'Anonim';
      
      // Get all countries where the user is a patriot (has at least 1 pixel)
      const userCountries = new Set(
         purchasedPixels
            .filter(p => p.name === currentUser)
            .map(p => p.country)
      );

      let pixelsGained = 0;
      userCountries.forEach(country => {
         // Check if this country has a built Central Bank (>= 1000 funds)
         if (countryBankFunds[country] >= 1000) {
            pixelsGained += 1;
         }
      });

      if (pixelsGained > 0) {
         updateUserBalance(pixelsGained);
         // Optional: Fire a local event or console log to indicate passive income
         console.log(`Passive Income: +${pixelsGained} Px from Central Banks`);
      }
    }, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [countryBankFunds, purchasedPixels]);

  const handlePurchase = (purchaseData) => {
    // Add new pixel to state
    setPurchasedPixels([...purchasedPixels, {
      lat: selectedCountry.clickLat,
      lng: selectedCountry.clickLng,
      name: purchaseData.name,
      instagram: purchaseData.instagram,
      website: purchaseData.website,
      bio: purchaseData.bio,
      country: selectedCountry.ADMIN
    }]);

    // Check if hitting World Boss
    if (worldBoss && worldBoss.active && selectedCountry.ADMIN === worldBoss.country) {
       setWorldBoss(prev => {
         const newHp = Math.max(0, prev.hp - 2500); // 2500 damage per pixel for demo
         const newAttackers = [...(prev.attackers || []), purchaseData.name];
         
         if (newHp === 0) {
           setTimeout(() => {
             const uniqueAttackers = Array.from(new Set(newAttackers));
             const rewardsList = uniqueAttackers.map(a => `• ${a} a primit 100 Pixeli + Medalie UFO`).join('\n');
             alert(`💥 ALIEN MOTHERSHIP A FOST DISTRUS!\n\nToți cei care au atacat au primit drop-uri:\n${rewardsList}`);
             
             handleWheelReward({ type: "Medalie Eroică", value: "Salvatorul Terrei" });
             setShowLuckyWheel(true);
           }, 1000);
           return { ...prev, active: false, hp: 0, attackers: newAttackers };
         }
         return { ...prev, hp: newHp, attackers: newAttackers };
       });
       // Massive explosion effect
       setActiveAttacks(prev => [...prev, 
         { target: selectedCountry.ADMIN, id: Date.now() },
         { target: selectedCountry.ADMIN, id: Date.now() + 1 }
       ]);
    } else {
       // Normal attack ring
       setActiveAttacks(prev => [...prev, { target: selectedCountry.ADMIN, id: Date.now() }]);
       setTimeout(() => {
         setActiveAttacks(prev => prev.slice(1));
       }, 4000);
       
       // Show lucky wheel after normal purchase
       setShowLuckyWheel(true);
    }

    // Close the country panel
    setSelectedCountry(null);
  };

  const handleUfoAttack = () => {
    if (worldBoss && worldBoss.active) {
       setWorldBoss(prev => {
         const newHp = Math.max(0, prev.hp - 1000); // 1000 damage per click
         const newAttackers = [...(prev.attackers || []), "TU (Click)"];
         if (newHp === 0) {
           setTimeout(() => {
             setShowUfoPanel(false);
             const uniqueAttackers = Array.from(new Set(newAttackers));
             const rewardsList = uniqueAttackers.map(a => `• ${a} a primit 100 Pixeli + Medalie UFO`).join('\n');
             alert(`💥 ALIEN MOTHERSHIP A FOST DISTRUS!\n\nToți cei care au atacat au primit drop-uri:\n${rewardsList}`);
             
             handleWheelReward({ type: "Medalie Eroică", value: "Salvatorul Terrei" });
             setShowLuckyWheel(true);
           }, 1000);
           return { ...prev, active: false, hp: 0, attackers: newAttackers };
         }
         return { ...prev, hp: newHp, attackers: newAttackers };
       });
       
       // Massive explosion effect
       setActiveAttacks(prev => [...prev, 
         { target: worldBoss.country, id: Date.now() },
         { target: worldBoss.country, id: Date.now() + 1 }
       ]);
    }
  };

  const handleAddAlliance = (allianceData) => {
    const countryAlliances = alliances.filter(a => a.countryA === allianceData.countryA || a.countryB === allianceData.countryA);
    if (countryAlliances.length >= 2) {
      alert(`Națiunea ${allianceData.countryA} a atins numărul maxim de 2 Alianțe!`);
      return;
    }
    setAlliances(prev => [
      ...prev,
      { 
        ...allianceData,
        expiresAt: Date.now() + allianceData.durationDays * 24 * 60 * 60 * 1000,
        color: allianceData.color || '#00f3ff'
      }
    ]);
  };

  const handleAttackEvent = (c1, c2) => {
    // Check if alliance exists
    const isAllied = alliances.some(a => 
      ((a.countryA === c1 && a.countryB === c2) || (a.countryA === c2 && a.countryB === c1)) &&
      a.expiresAt > Date.now()
    );

    if (isAllied) {
      alert(`Pact de neagresiune activ între ${c1} și ${c2}! Nu poți ataca.`);
      return;
    }

    setActiveAttacks(prev => [...prev, { source: c1, target: c2, id: Date.now() }]);
    setTimeout(() => {
      setActiveAttacks(prev => prev.slice(1));
    }, 4000);
  };

  const handleWheelReward = (reward) => {
    setLastReward(reward);
    // Could apply reward effects here in the future
  };

  return (
    <div 
      className="relative w-full h-screen text-white overflow-hidden bg-black"
      style={{ backgroundImage: 'url(//unpkg.com/three-globe/example/img/night-sky.png)' }}
    >
      <div className="cyber-grid"></div>
      <div className="absolute inset-0 z-0 touch-none">
        <GlobeComponent 
        selectedCountry={selectedCountry}
        onCountryClick={(country) => {
            if(!hasStarted) return;
            setSelectedCountry(country);
            setSelectedPixel(null);
            setSelectedLogoName(null);
            
            // Track visited countries for mission
          try {
            const visited = JSON.parse(localStorage.getItem('visitedCountries') || '[]');
            if (!visited.includes(country.ADMIN)) {
              visited.push(country.ADMIN);
              localStorage.setItem('visitedCountries', JSON.stringify(visited));
            }
          } catch(e) { console.error(e); }
        }} 
        onPixelClick={(pixel) => {
          if(!hasStarted) return;
          setSelectedPixel(pixel);
          setSelectedCountry(null);
          setShowUfoPanel(false);
        }}
        onUfoClick={() => {
          if(!hasStarted) return;
          setShowUfoPanel(true);
          setSelectedCountry(null);
          setSelectedPixel(null);
        }}
        isUfoPanelOpen={showUfoPanel}
        purchasedPixels={purchasedPixels} 
        activeAttacks={activeAttacks}
        conqueredCountries={conqueredCountries}
        
        alliances={alliances}
        onAttackBoss={handleUfoAttack}
      />
      </div>
      
      {hasStarted && <AlienFleet />}

      {hasStarted && (
        <div className={selectedCountry ? "hidden md:block" : "block"}>
          <BottomChatBar 
            countryName={selectedCountry ? selectedCountry.ADMIN : 'Lume'}
            equippedCosmetics={equippedCosmetics}
            activeBoosts={activeBoosts}
            userName={name || 'Eu'}
            userPixelsCount={userBalance}
            onOpenPrivateChat={handleOpenPrivateChat}
            purchasedPixels={purchasedPixels}
          />
        </div>
      )}

      {hasStarted && <FlashEvent />}

      {hasStarted && activeAttacks.length > 0 && activeAttacks[activeAttacks.length - 1].source && (
        <AttackAlert attack={activeAttacks[activeAttacks.length - 1]} />
      )}

      {!hasStarted ? (
        <LandingPage onStart={() => setHasStarted(true)} />
      ) : (
        <>
          <UIOverlay 
            selectedCountry={selectedCountry} 
            selectedPixel={selectedPixel}
            selectedLogoName={selectedLogoName?.name}
            selectedLogoEvent={selectedLogoName}
            purchasedPixels={purchasedPixels}
            userBalance={userBalance}
            onUpdateBalance={updateUserBalance}
            onSelectCountry={(countryName) => {
              setSelectedCountry({ ADMIN: countryName });
              setSelectedPixel(null);
            }}
            activeAttacks={activeAttacks}
            onClose={() => {
              setSelectedCountry(null);
              setSelectedPixel(null);
            }}
            conqueredCountries={conqueredCountries}
            onPurchase={handlePurchase}
            onShowLeaderboard={() => setShowLeaderboard(true)}
            onShowCountryDetails={() => setShowCountryDetails(true)}
            alliances={alliances}
            onAddAlliance={handleAddAlliance}
            onAttackAlliance={handleAttackAlliance}
            onInvestInUser={handleInvestInUser}
            onAttackEvent={handleAttackEvent}
            onShowMissions={() => setShowMissions(true)}
            onShowMedals={() => setShowMedals(true)}
            onShowCosmetics={() => setShowCosmeticsShop(true)}
            userInventory={userInventory}
            equippedCosmetics={equippedCosmetics}
            activeBoosts={activeBoosts}
            onOpenPrivateChat={handleOpenPrivateChat}
          />
          <CosmeticsShop 
            isOpen={showCosmeticsShop}
            onClose={() => setShowCosmeticsShop(false)}
            balance={userBalance}
            onUpdateBalance={updateUserBalance}
            inventory={userInventory}
            equippedCosmetics={equippedCosmetics}
            onEquip={(type, itemId) => {
              setEquippedCosmetics(prev => ({ ...prev, [type]: prev[type] === itemId ? null : itemId }));
            }}
            onActivateBoost={(boostId) => {
              if (!activeBoosts.includes(boostId)) {
                setActiveBoosts(prev => [...prev, boostId]);
              }
            }}
            onUnlock={(itemId, cost) => {
              updateUserBalance(-cost);
              unlockCosmetic(itemId);
              alert("Cosmetic deblocat cu succes!");
            }}
          />
          <UfoPanel 
            isOpen={showUfoPanel} 
            onClose={() => setShowUfoPanel(false)} 
             
            onAttack={handleUfoAttack} 
          />
        </>
      )}
      
      {showLeaderboard && hasStarted && (
        <LeaderboardModal 
          users={purchasedPixels} 
          onClose={() => setShowLeaderboard(false)} 
        />
      )}

      {showCountryDetails && selectedCountry && hasStarted && (
        <CountryDetailsModal 
          country={selectedCountry}
          pixels={purchasedPixels.filter(p => p.country === selectedCountry.ADMIN)}
          onClose={() => setShowCountryDetails(false)}
          alliances={alliances}
          onAddAlliance={handleAddAlliance}
          onInvestInUser={handleInvestInUser}
          onRevolutionSuccess={handleRevolutionSuccess}
          countryBankFunds={countryBankFunds}
          onDonateToBank={(amount) => {
            if (userBalance < amount) {
               alert("Fonduri insuficiente pentru a dona această sumă.");
               return;
            }
            updateUserBalance(-amount);
            setCountryBankFunds(prev => {
              const currentFund = prev[selectedCountry.ADMIN] || 0;
              return { ...prev, [selectedCountry.ADMIN]: currentFund + amount };
            });
          }}
        />
      )}

      {/* Daily Missions Panel */}
      {hasStarted && (
        <DailyMissions
          purchasedPixels={purchasedPixels}
          isOpen={showMissions}
          onClose={() => setShowMissions(false)}
        />
      )}

      {/* User Profile Modal */}
      {hasStarted && (
        <UserProfile
          isOpen={showMedals}
          onClose={() => setShowMedals(false)}
          purchasedPixels={purchasedPixels}
          conqueredCountries={conqueredCountries}
        />
      )}

      {/* Lucky Wheel Modal - shows after purchase */}
      {hasStarted && (
        <LuckyWheel 
          isOpen={showLuckyWheel} 
          onClose={() => setShowLuckyWheel(false)} 
          userBalance={userBalance}
          onUpdateBalance={updateUserBalance}
          onReward={(reward) => {
            if (reward.type === 'pixel') {
               updateUserBalance(reward.value);
            }
            setLastReward(reward);
            setTimeout(() => setShowLuckyWheel(false), 3000);
          }} 
        />
      )}

      {/* Render Active Private Chats */}
      {activePrivateChats.map((username, index) => (
        <PrivateChat 
          key={username}
          chatUser={username}
          onClose={() => handleClosePrivateChat(username)}
          positionIndex={index}
        />
      ))}

      {selectedAlliance && (
        <AllianceDetailsModal 
          alliance={alliances.find(a => a.name === selectedAlliance.name) || selectedAlliance} 
          purchasedPixels={purchasedPixels} 
          onClose={() => setSelectedAlliance(null)}
          onViewCreator={(creator) => setSelectedUserProfile(creator)}
          onAttackAlliance={handleAttackAlliance}
        />
      )}

      {selectedUserProfile && (
        <UserProfileModal 
          username={selectedUserProfile} 
          purchasedPixels={purchasedPixels} 
          bankFunds={countryBankFunds}
          onClose={() => setSelectedUserProfile(null)}
          onInvestInUser={handleInvestInUser}
        />
      )}
      <SpeedInsights />
    </div>
  );
}

export default App;
