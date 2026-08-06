import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Globe2, MapPin, MessageSquare, Crown } from 'lucide-react';
import { getRank } from '../utils/ranks';

const mockMessages = [
  'Hai băieți, cumpărați acum că e ieftin!', 'Se pregătește un atac masiv, fiți pe fază.', 'A mai luat cineva pixeli azi?', 
  'E momentul să ne extindem granițele!', 'Nu lăsați garda jos!', 'Am băgat și eu 10 dolari pentru țară 🇷🇴',
  'Cine e pe locul 1 la noi?', 'Suntem atacați în sud, faceți ceva!', 'Pixel cu pixel facem imperiu!',
  'Respect pentru cei care donează!', 'Vedeți că a scăzut prețul', 'Eu zic să ne aliem cu vecinii.',
  'Unde sunt balenele noastre?', 'Forță maximă azi! 🔥', 'Am impresia că ne vânează cineva...',
  'Mai trebuie vreo 20 de pixeli să trecem nivelul.', 'Să ne organizăm pe Discord băieți!', 'Salutări de la un patriot!'
];

const internationalMessages = [
  'Hello from USA! 🇺🇸', 'Is anyone attacking France?', 'We need backup in Germany!', 'GG everyone.',
  'How do I buy more pixels?', 'This game is crazy! 🔥', 'Looking for alliance.', 'Brazil is taking over 🇧🇷',
  'Can someone explain the mechanics?', 'Let\'s go boys!', 'Peace treaty anyone?', 'I just spent $100 lol',
  'Who wants to team up?', 'Greetings from Japan 🇯🇵'
];

const mockUsernames = ['Patriot_RO', 'DragonSlayer', 'NeonNinja', 'CyberWolf', 'GeneralRo', 'StefanCelMare', 'Ionut_Z', 'Andrei44', 'VladTepes', 'MihaiViteazu'];
const intUsernames = ['JohnDoe', 'Alex_Smith', 'Nakamoto', 'SvenG', 'Pierre', 'Luigi', 'Maria_B', 'CryptoWhale', 'NinjaXX', 'GlobalTrotter'];

export default function BottomChatBar({ 
  countryName = 'Lume', 
  equippedCosmetics = {}, 
  activeBoosts = [], 
  userName = 'Eu', 
  userPixelsCount = 0, 
  onOpenPrivateChat 
}) {
  const [channel, setChannel] = useState('global');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
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
        mockPixels: Math.floor(Math.random() * 50) + 1,
        isDictator: Math.random() > 0.9 
      };
      
      setMessages(prev => [...prev, newMsg].slice(-50));
      const nextInterval = Math.floor(Math.random() * 30000) + 15000;
      timeoutId = setTimeout(generateNextMessage, nextInterval);
    };

    const nextInterval = Math.floor(Math.random() * 10000) + 5000;
    timeoutId = setTimeout(generateNextMessage, nextInterval);

    return () => clearTimeout(timeoutId);
  }, [channel]);

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

  if (!isExpanded) {
    return (
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 mb-2">
        <button 
          onClick={() => setIsExpanded(true)}
          className="glass-panel px-6 py-2 rounded-t-xl bg-black/80 border-t border-x border-white/20 text-neonCyan font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-[0_0_15px_rgba(0,243,255,0.3)]"
        >
          <MessageSquare className="w-5 h-5" /> Deschide Centrul de Comandă (Chat)
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div className="w-full max-w-5xl bg-black/85 backdrop-blur-xl border-t border-x border-white/10 rounded-t-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto flex flex-col transition-all duration-300 h-64">
        
        {/* Header & Tabs */}
        <div className="flex justify-between items-center bg-black/60 border-b border-white/10 rounded-t-2xl">
          <div className="flex">
            <button 
              onClick={() => setChannel('global')}
              className={`px-8 py-3 text-sm font-black uppercase tracking-widest flex justify-center items-center gap-2 transition-all rounded-tl-2xl ${channel === 'global' ? 'bg-[#bc13fe]/20 text-[#bc13fe] border-t-2 border-[#bc13fe]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Globe2 size={16} /> Global
            </button>
            <button 
              onClick={() => setChannel('local')}
              className={`px-8 py-3 text-sm font-black uppercase tracking-widest flex justify-center items-center gap-2 transition-all ${channel === 'local' ? 'bg-[#00f3ff]/20 text-[#00f3ff] border-t-2 border-[#00f3ff]' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <MapPin size={16} /> Național {countryName !== 'Lume' && `(${countryName})`}
            </button>
          </div>
          <button 
            onClick={() => setIsExpanded(false)}
            className="px-6 py-2 text-gray-500 hover:text-white transition-colors"
          >
            ▼ Ascunde
          </button>
        </div>

        {/* Messages Area - Wide format */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-2 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-4 italic">Niciun mesaj. Începe transmisia!</div>
          )}
          {messages.map((msg) => {
            const hasFire = msg.isLocal && equippedCosmetics?.title === 'title_fire';
            const hasNeon = msg.isLocal && equippedCosmetics?.title === 'title_neon';
            const hasRainbow = msg.isLocal && equippedCosmetics?.title === 'title_rainbow';
            const hasHolo = msg.isLocal && equippedCosmetics?.avatar === 'avatar_holo';
            const hasGold = msg.isLocal && equippedCosmetics?.chat === 'chat_gold';
            const hasBlood = msg.isLocal && equippedCosmetics?.chat === 'chat_blood';
            
            const pixelCount = msg.isLocal ? msg.pixels || userPixelsCount : msg.mockPixels || 0;
            const rank = getRank(pixelCount);

            let nameClasses = 'text-xs text-gray-400 font-bold';
            if (hasRainbow) nameClasses = 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-black text-xs';
            else if (hasNeon) nameClasses = 'text-[#00f3ff] font-black drop-shadow-[0_0_5px_rgba(0,243,255,0.8)] text-xs';
            else if (hasFire) nameClasses = 'text-orange-500 font-black drop-shadow-[0_0_5px_rgba(249,115,22,0.8)] text-xs';
            
            let bubbleClasses = 'text-gray-200';
            if (hasGold) bubbleClasses = 'text-yellow-400 font-bold drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]';
            if (hasBlood) bubbleClasses = 'text-red-500 font-bold drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]';
            if (msg.isLocal) bubbleClasses += ' text-white font-medium';

            return (
              <div key={msg.id} className={`flex items-start gap-2 hover:bg-white/5 p-1.5 rounded transition-colors ${msg.isLocal ? 'bg-white/5' : ''}`}>
                <span className="text-gray-500 text-[10px] w-10 shrink-0 pt-0.5">{msg.timestamp}</span>
                
                <div className="flex items-center gap-1 shrink-0 w-48">
                  {msg.isDictator && <Crown size={12} className="text-yellow-500 drop-shadow-[0_0_5px_yellow]" title="Dictator" />}
                  {hasHolo && (
                    <div className="w-3 h-3 rounded-full bg-[#00f3ff]/30 animate-pulse border border-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.8)] inline-block mr-1"></div>
                  )}
                  <span 
                    className={`${nameClasses} hover:underline cursor-pointer flex items-center gap-1`}
                    onClick={() => !msg.isLocal && onOpenPrivateChat && onOpenPrivateChat(msg.user)}
                  >
                    {msg.user}
                  </span>
                  <span className={`text-[9px] uppercase font-black ${rank.color} bg-black/40 px-1 rounded ml-1`}>{rank.icon}</span>
                </div>
                
                <div className={`text-sm flex-1 break-words ${bubbleClasses}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 border-t border-white/10 flex gap-3 items-center bg-black/80 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={200}
            placeholder={`Transmite un mesaj pe canalul ${channel === 'local' ? 'Național' : 'Global'}...`}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00f3ff]/50 focus:bg-white/10 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all ${
              inputText.trim() 
                ? 'bg-[#00f3ff] text-black hover:bg-white shadow-[0_0_15px_rgba(0,243,255,0.4)]' 
                : 'bg-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            TRIMITE <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
