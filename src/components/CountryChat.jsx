import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Globe2, MapPin, MessageSquare, Crown } from 'lucide-react';
import { getRank } from '../utils/ranks';

const mockMessages = [
  'Hai băieți, cumpărați acum că e ieftin!', 'Se pregătește un atac masiv, fiți pe fază.', 'A mai luat cineva pixeli azi?', 
  'E momentul să ne extindem granițele!', 'Nu lăsați garda jos!', 'Am băgat și eu 10 dolari pentru țară 🇷🇴',
  'Cine e pe locul 1 la noi?', 'Suntem atacați în sud, faceți ceva!', 'Pixel cu pixel facem imperiu!',
  'Respect pentru cei care donează!', 'Vedeți că a scăzut prețul', 'Eu zic să ne aliem cu vecinii.',
  'Unde sunt balenele noastre?', 'Forță maximă azi! 🔥', 'Am impresia că ne vânează cineva...',
  'Mai trebuie vreo 20 de pixeli să trecem nivelul.', 'Să ne organizăm pe Discord băieți!', 'Salutări de la un patriot!',
  'Nu dați înapoi, e șansa noastră!', 'Merge site-ul cam greu de la atâtea atacuri 😂', 'Cine a pus muzica asta șmecheră?'
];

const internationalMessages = [
  'Hello from USA! 🇺🇸', 'Is anyone attacking France?', 'We need backup in Germany!', 'GG everyone.',
  'How do I buy more pixels?', 'This game is crazy! 🔥', 'Looking for alliance.', 'Brazil is taking over 🇧🇷',
  'Can someone explain the mechanics?', 'Let\'s go boys!', 'Peace treaty anyone?', 'I just spent $100 lol',
  'Who wants to team up?', 'Defend your borders!', 'We are unstoppable 🚀', 'Greetings from Japan 🇯🇵'
];

const mockUsernames = ['Patriot_RO', 'DragonSlayer', 'NeonNinja', 'CyberWolf', 'GeneralRo', 'StefanCelMare', 'Ionut_Z', 'Andrei44', 'VladTepes', 'MihaiViteazu', 'GamerBoi', 'CryptoKing', 'PixelMaster'];
const intUsernames = ['JohnDoe', 'Alex_Smith', 'Nakamoto', 'SvenG', 'Pierre', 'Luigi', 'Maria_B', 'CryptoWhale', 'NinjaXX', 'GlobalTrotter'];

const CountryChat = ({ countryName = 'România', isVisible = true, equippedCosmetics = {}, activeBoosts = [], userName = 'Eu', userPixelsCount = 0, onOpenPrivateChat }) => {
  const [channel, setChannel] = useState('local'); // 'local' or 'global'
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const getStorageKey = () => `hexglobe_chat_${channel === 'local' ? countryName : 'international'}`;

  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey());
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([]);
    }
  }, [channel, countryName]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(getStorageKey(), JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, channel, countryName]);

  useEffect(() => {
    if (!isVisible) return;
    let timeoutId;

    const generateNextMessage = () => {
      const isGlobal = channel === 'global';
      const msgList = isGlobal ? internationalMessages : mockMessages;
      const userList = isGlobal ? intUsernames : mockUsernames;

      const randomMsg = msgList[Math.floor(Math.random() * msgList.length)];
      const randomUser = userList[Math.floor(Math.random() * userList.length)];
      
      const newMsg = {
        id: Date.now(),
        user: randomUser,
        text: randomMsg,
        timestamp: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
        isLocal: false,
        mockPixels: Math.floor(Math.random() * 50) + 1, // random pixels for mock rank
        isDictator: Math.random() > 0.9 // 10% chance a mock user is dictator
      };
      
      setMessages(prev => [...prev, newMsg].slice(-50));

      const nextInterval = Math.floor(Math.random() * 30000) + 15000;
      timeoutId = setTimeout(generateNextMessage, nextInterval);
    };

    const nextInterval = Math.floor(Math.random() * 10000) + 5000;
    timeoutId = setTimeout(generateNextMessage, nextInterval);

    return () => clearTimeout(timeoutId);
  }, [isVisible, channel]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now(),
      user: userName,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
      isLocal: true,
      pixels: userPixelsCount,
      isDictator: activeBoosts.includes('boost_dictator')
    };

    setMessages(prev => [...prev, newMsg].slice(-50));
    setInputText('');
  };

  if (!isVisible) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-black/60 border border-[#00f3ff]/30 rounded-lg backdrop-blur-md overflow-hidden glass-panel">
      
      <div className="flex border-b border-white/10 bg-black/40">
        <button 
          onClick={() => setChannel('local')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-1 transition-all ${channel === 'local' ? 'bg-[#00f3ff]/20 text-[#00f3ff] border-b-2 border-[#00f3ff]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <MapPin size={12} /> {countryName}
        </button>
        <button 
          onClick={() => setChannel('global')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest flex justify-center items-center gap-1 transition-all ${channel === 'global' ? 'bg-[#bc13fe]/20 text-[#bc13fe] border-b-2 border-[#bc13fe]' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Globe2 size={12} /> Global
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-xs mt-4 italic">Niciun mesaj încă. Fii primul care scrie!</div>
        )}
        {messages.map((msg) => {
          const hasFire = msg.isLocal && equippedCosmetics?.title === 'title_fire';
          const hasNeon = msg.isLocal && equippedCosmetics?.title === 'title_neon';
          const hasRainbow = msg.isLocal && equippedCosmetics?.title === 'title_rainbow';
          const hasHolo = msg.isLocal && equippedCosmetics?.avatar === 'avatar_holo';
          const hasGold = msg.isLocal && equippedCosmetics?.chat === 'chat_gold';
          const hasBlood = msg.isLocal && equippedCosmetics?.chat === 'chat_blood';
          const isDictator = msg.isDictator;

          let nameClasses = 'text-[10px] text-gray-400 mb-1 flex items-center gap-1';
          if (hasRainbow) nameClasses = 'mb-1 flex items-center gap-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-black text-xs';
          else if (hasNeon) nameClasses = 'mb-1 flex items-center gap-1 text-[#00f3ff] font-black drop-shadow-[0_0_5px_rgba(0,243,255,0.8)] text-xs';
          else if (hasFire) nameClasses = 'mb-1 flex items-center gap-1 text-orange-500 font-black drop-shadow-[0_0_5px_rgba(249,115,22,0.8)] text-xs';
          
          let bubbleClasses = msg.isLocal 
                ? 'bg-[#00f3ff]/20 text-white border border-[#00f3ff]/40 rounded-tr-none' 
                : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none';
                
          if (hasGold) bubbleClasses = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-tr-none font-bold shadow-[0_0_10px_rgba(234,179,8,0.2)]';
          if (hasBlood) bubbleClasses = 'bg-red-500/20 text-red-500 border border-red-500/50 rounded-tr-none font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)]';

          const pixelCount = msg.isLocal ? msg.pixels || userPixelsCount : msg.mockPixels || 0;
          const rank = getRank(pixelCount);

          return (
            <div key={msg.id} className={`flex flex-col ${msg.isLocal ? 'items-end' : 'items-start'}`}>
              <span className={nameClasses}>
                {!msg.isLocal && <User size={10} className={channel === 'global' ? 'text-[#bc13fe]' : 'text-[#00f3ff]'} />}
                {hasHolo && (
                  <div className="w-5 h-5 rounded-full bg-[#00f3ff]/30 animate-pulse border border-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.8)] flex items-center justify-center">
                    <User size={12} className="text-[#00f3ff]"/>
                  </div>
                )}
                <span 
                  className={`hover:underline cursor-pointer flex items-center gap-1 ${!msg.isLocal && onOpenPrivateChat ? 'text-white' : ''}`}
                  onClick={() => !msg.isLocal && onOpenPrivateChat && onOpenPrivateChat(msg.user)}
                  title="Trimite mesaj privat"
                >
                  {isDictator && <Crown size={12} className="text-yellow-500 drop-shadow-[0_0_5px_yellow]" title="Dictator" />}
                  {msg.user}
                  <span className={`text-[9px] uppercase font-black ${rank.color} bg-black/40 px-1 rounded`}>{rank.icon} {rank.title}</span>
                </span>
                <span className="opacity-50 text-[9px] font-normal text-gray-400">{msg.timestamp}</span>
              </span>
              <div className={`px-3 py-1.5 rounded-lg text-sm max-w-[85%] break-words ${bubbleClasses}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-2 border-t border-white/10 flex gap-2 items-center bg-black/40 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          maxLength={200}
          placeholder={`Mesaj ${channel === 'local' ? 'local' : 'global'}...`}
          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-[#00f3ff]/50 transition-colors"
        />
        <button
          type="submit"
          className="bg-[#00f3ff]/20 hover:bg-[#00f3ff]/40 text-[#00f3ff] p-1.5 rounded border border-[#00f3ff]/50 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default CountryChat;
