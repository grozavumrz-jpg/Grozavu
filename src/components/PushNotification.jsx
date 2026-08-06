import React, { useState, useEffect } from 'react';
import { Info, AlertTriangle, Trophy } from 'lucide-react';

const NAMES = ['NeonNinja', 'DragonSlayer', 'CyberWolf', 'ShadowKing', 'PhoenixRo', 'IceBreaker', 'StormRider', 'DarkKnight'];
const COUNTRIES = ['Germania', 'Franța', 'Italia', 'Spania', 'Japonia', 'Brazilia', 'Australia', 'Canada'];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const PushNotification = ({ purchasedPixels = [], worldBoss }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (worldBoss && worldBoss.active) {
       setNotifications(prev => [{
          id: Date.now() + Math.random(),
          text: `🛸 ALERTĂ MAXIMĂ! Un OZN GIGANTIC a invadat ${worldBoss.country}! Atacați-l acum!`,
          type: 'attack',
          timestamp: new Date()
       }, ...prev].slice(0, 3));
    }
  }, [worldBoss?.active, worldBoss?.country]);

  useEffect(() => {
    let timeoutId;
    const generateNotification = () => {
      const realNames = [...new Set(purchasedPixels.map(p => p.name))];
      const allNames = realNames.length > 0 ? [...NAMES, ...realNames, ...realNames] : NAMES; // Give real names higher weight
      
      const getRandomName = () => getRandomItem(allNames);
      const types = ['info', 'attack', 'achievement'];
      const type = getRandomItem(types);
      let text = '';
      
      const attackTemplates = [
        `🔥 {name} a lansat un atac surpriză în {country}!`,
        `⚠️ {country} este sub asediu masiv! Forțele se adună!`,
        `⚔️ Război total în {country}! {name} a cumpărat 10 pixeli dintr-un foc!`,
        `🚨 Alertă roșie! {country} pierde teritoriu în fața patrioților!`,
        `💥 Explozie de cumpărări! {name} a dominat piața din {country}!`,
        `🎯 Lovitură tactică! {name} tocmai a preluat controlul unui sector în {country}.`,
        `🔥 Flancul estic din {country} a picat! {name} înaintează.`,
        `⚠️ Zvonuri despre o invazie iminentă în {country}! Pregătiți-vă!`,
        `⚔️ {name} a declarat război deschis împotriva alianțelor din {country}!`,
        `🚨 Trupele lui {name} au ajuns în capitala din {country}!`
      ];

      const infoTemplates = [
        `ℹ️ {name} a primit un bonus secret de loialitate!`,
        `🌐 Economia din {country} se stabilizează datorită investițiilor.`,
        `💡 Sfat tactic: Apără-ți mereu teritoriile de bază înainte să ataci!`,
        `📉 Oportunitate! Prețurile terenurilor din {country} ar putea scădea curând.`,
        `ℹ️ {name} tocmai s-a alăturat jocului! Fii cu ochii pe el.`,
        `🤝 Alianță nouă formată la granițele cu {country}?`,
        `📈 {name} are cea mai rapidă expansiune de astăzi!`,
        `ℹ️ Sistemul a detectat anomalii masive de activitate în {country}.`,
        `🔍 {name} explorează teritorii necunoscute...`,
        `💡 Știai că poți primi medalii pentru cumpărarea de pixeli în țări noi?`
      ];

      const achievementTemplates = [
        `🏆 {name} a deblocat medalia de Cuceritor Suprem!`,
        `🌟 Incredibil! {name} a ajuns la rangul de Legendă!`,
        `🎖️ {name} a câștigat badge-ul de Veteran. Respect!`,
        `👑 {name} tocmai a fondat un Imperiu extins în 3 țări!`,
        `💎 O nouă Superputere s-a născut: {name}!`,
        `🏆 Pentru eforturile sale, {name} a fost medaliat ca Patriot de Onoare!`,
        `🌟 {name} a spart toate recordurile! Cea mai rapidă expansiune.`,
        `🎖️ Primul pixel, primii pași! {name} a primit Medalia de Începător.`,
        `👑 Lumea întreagă privește cum {name} construiește un imperiu colosal.`,
        `🏆 {name} domină complet piața de pixeli!`
      ];

      if (type === 'attack') {
        text = getRandomItem(attackTemplates).replace('{name}', getRandomName()).replace('{country}', getRandomItem(COUNTRIES));
      } else if (type === 'achievement') {
        text = getRandomItem(achievementTemplates).replace('{name}', getRandomName()).replace('{country}', getRandomItem(COUNTRIES));
      } else {
        text = getRandomItem(infoTemplates).replace('{name}', getRandomName()).replace('{country}', getRandomItem(COUNTRIES));
      }

      const newNotif = {
        id: Date.now() + Math.random(),
        text,
        type,
        timestamp: new Date()
      };

      setNotifications(prev => [newNotif, ...prev].slice(0, 3));

      const nextDelay = Math.floor(Math.random() * (45 - 15 + 1) + 15) * 1000;
      timeoutId = setTimeout(generateNotification, nextDelay);
    };

    const initialDelay = Math.floor(Math.random() * (45 - 15 + 1) + 15) * 1000;
    timeoutId = setTimeout(generateNotification, initialDelay);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(0, prev.length - 1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const getBorderColor = (type) => {
    switch (type) {
      case 'info': return 'border-l-[#00f3ff]';
      case 'attack': return 'border-l-red-500';
      case 'achievement': return 'border-l-yellow-400';
      default: return 'border-l-white';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5 text-[#00f3ff]" />;
      case 'attack': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'achievement': return <Trophy className="w-5 h-5 text-yellow-400" />;
      default: return null;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      <style>{`
        @keyframes slideInDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-down {
          animation: slideInDown 0.4s ease-out forwards;
        }
      `}</style>
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className={`glass-panel px-4 py-3 rounded flex items-center gap-3 border-l-4 ${getBorderColor(notif.type)} bg-black/80 backdrop-blur-md text-white shadow-lg animate-slide-in-down`}
          style={{
             boxShadow: '0 0 15px rgba(0,0,0,0.5)'
          }}
        >
          {getIcon(notif.type)}
          <span className="text-sm font-medium tracking-wide">{notif.text}</span>
        </div>
      ))}
    </div>
  );
};

export default PushNotification;
