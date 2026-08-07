import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe2, MapPin, ChevronDown, Crown, Hash } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { getRank } from '../utils/ranks';

const mockMessages = [
  'Hai băieți, cumpărați acum că e ieftin!', 'Se pregătește un atac masiv, fiți pe fază.',
  'A mai luat cineva pixeli azi?', 'E momentul să ne extindem granițele!',
  'Nu lăsați garda jos!', 'Am băgat și eu 10 dolari pentru țară 🇷🇴',
  'Cine e pe locul 1 la noi?', 'Suntem atacați în sud, faceți ceva!',
  'Pixel cu pixel facem imperiu!', 'Respect pentru cei care donează!',
  'Vedeți că a scăzut prețul', 'Eu zic să ne aliem cu vecinii.',
  'Unde sunt balenele noastre?', 'Forță maximă azi! 🔥', 'Am impresia că ne vânează cineva...',
  'Mai trebuie vreo 20 de pixeli să trecem nivelul.', 'Să ne organizăm pe Discord băieți!', 'Salutări de la un patriot!',
];

const internationalMessages = [
  'Hello from USA! 🇺🇸', 'Is anyone attacking France?', 'We need backup in Germany!', 'GG everyone.',
  'How do I buy more pixels?', 'This game is crazy! 🔥', 'Looking for alliance.', 'Brazil is taking over 🇧🇷',
  'Can someone explain the mechanics?', "Let's go boys!", 'Peace treaty anyone?', 'I just spent $100 lol',
  'Who wants to team up?', 'Greetings from Japan 🇯🇵',
];

const mockUsernames = ['Patriot_RO', 'DragonSlayer', 'NeonNinja', 'CyberWolf', 'GeneralRo', 'StefanCelMare', 'Ionut_Z', 'Andrei44', 'VladTepes', 'MihaiViteazu'];
const intUsernames = ['JohnDoe', 'Alex_Smith', 'Nakamoto', 'SvenG', 'Pierre', 'Luigi', 'Maria_B', 'CryptoWhale', 'NinjaXX', 'GlobalTrotter'];

const avatarColors = [
  'from-cyan-500 to-blue-600', 'from-purple-500 to-pink-600', 'from-orange-400 to-red-500',
  'from-green-400 to-teal-600', 'from-yellow-400 to-orange-500', 'from-pink-400 to-purple-600',
];

function getAvatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
}

export default function BottomChatBar({
  countryName = 'Lume',
  equippedCosmetics = {},
  activeBoosts = [],
  userName = 'Eu',
  userPixelsCount = 0,
  onOpenPrivateChat,
  purchasedPixels = [],
}) {
  const [channel, setChannel] = useState('global');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  // Compute online counts - simulate per-country based on pixel counts
  const totalOnline = (Math.floor(Date.now() / 100000) % 200) + 120;
  const countryPixelCount = purchasedPixels.filter(p => p.country === countryName).length;
  // National online = proportional to pixels + small random base
  const nationalOnline = Math.max(1, Math.floor((countryPixelCount / Math.max(purchasedPixels.length, 1)) * totalOnline) + Math.floor(Date.now() / 200000) % 8 + 3);

  const channelId = channel === 'local' ? `country_${countryName}` : 'global';

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel', channelId)
        .order('created_at', { ascending: true })
        .limit(60);
      
      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          user: m.sender_email,
          text: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
          isLocal: m.sender_email === userName,
          isDictator: false // simplified for real chat
        })));
      }
    };
    
    fetchMessages();

    const subscription = supabase
      .channel(`public:messages:${channelId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `channel=eq.${channelId}`
      }, payload => {
        const m = payload.new;
        setMessages(prev => {
          if (prev.find(msg => msg.id === m.id)) return prev;
          const newMsgs = [...prev, {
            id: m.id,
            user: m.sender_email,
            text: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
            isLocal: m.sender_email === userName,
            isDictator: false
          }];
          return newMsgs.slice(-60);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channelId, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const msgText = inputText.trim();
    setInputText('');

    const tempId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: tempId,
      user: userName,
      text: msgText,
      timestamp: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
      isLocal: true,
      pixels: userPixelsCount,
      isDictator: activeBoosts.includes('boost_dictator'),
    }].slice(-60));

    await supabase.from('messages').insert([{
      sender_email: userName,
      channel: channelId,
      content: msgText
    }]);
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-t-xl bg-black/90 border-t border-x border-white/10 text-gray-400 hover:text-white text-xs font-bold transition-colors backdrop-blur-md"
        >
          <Hash className="w-3.5 h-3.5 text-neonCyan" />
          Chat Global / Național
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      {/* Chat container - slim premium design */}
      <div
        className="pointer-events-auto mx-auto w-full max-w-2xl flex flex-col"
        style={{
          background: 'rgba(6, 6, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderLeft: '1px solid rgba(255,255,255,0.05)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px 16px 0 0',
          height: 220,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.6), 0 -1px 0 rgba(0,243,255,0.1)',
        }}
      >
        {/* Tab Bar */}
        <div className="flex items-center border-b border-white/[0.06] shrink-0" style={{ height: 38 }}>
          <button
            onClick={() => setChannel('global')}
            className="flex items-center gap-1.5 px-4 h-full text-xs font-bold uppercase tracking-wider transition-all relative"
            style={{ color: channel === 'global' ? '#bc13fe' : '#555' }}
          >
            <Globe2 className="w-3.5 h-3.5" />
            Global
            <span className="ml-1 text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded-full" style={{ color: channel === 'global' ? '#bc13fe' : '#444' }}>
              {totalOnline}
            </span>
            {channel === 'global' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600 to-pink-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setChannel('local')}
            className="flex items-center gap-1.5 px-4 h-full text-xs font-bold uppercase tracking-wider transition-all relative"
            style={{ color: channel === 'local' ? '#00f3ff' : '#555' }}
          >
            <MapPin className="w-3.5 h-3.5" />
            {countryName !== 'Lume' ? countryName : 'Național'}
            <span className="ml-1 text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded-full" style={{ color: channel === 'local' ? '#00f3ff' : '#444' }}>
              {nationalOnline}
            </span>
            {channel === 'local' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
            )}
          </button>

          {/* Live indicator */}
          <div className="ml-auto flex items-center gap-1.5 pr-3">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] text-gray-500 font-mono">LIVE</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="ml-2 text-gray-600 hover:text-gray-400 transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {messages.length === 0 && (
            <div className="text-center text-gray-600 text-xs mt-6 italic">Niciun mesaj încă. Transmite primul!</div>
          )}
          {messages.map((msg) => {
            const pixelCount = msg.isLocal ? (msg.pixels || userPixelsCount) : (msg.mockPixels || 0);
            const rank = getRank(pixelCount);
            const hasCrown = msg.isDictator;
            const isMe = msg.isLocal;
            const avatarGrad = getAvatarColor(msg.user);

            const hasGold = isMe && equippedCosmetics?.chat === 'chat_gold';
            const hasBlood = isMe && equippedCosmetics?.chat === 'chat_blood';
            const hasNeon = isMe && equippedCosmetics?.title === 'title_neon';
            const hasRainbow = isMe && equippedCosmetics?.title === 'title_rainbow';
            const hasFire = isMe && equippedCosmetics?.title === 'title_fire';

            let nameStyle = { color: '#9ca3af' };
            if (hasRainbow) nameStyle = {};
            else if (hasNeon) nameStyle = { color: '#00f3ff', textShadow: '0 0 6px rgba(0,243,255,0.7)' };
            else if (hasFire) nameStyle = { color: '#f97316', textShadow: '0 0 6px rgba(249,115,22,0.7)' };
            else if (isMe) nameStyle = { color: '#e5e7eb' };

            let textStyle = { color: '#9ca3af' };
            if (hasGold) textStyle = { color: '#fbbf24', fontWeight: 600 };
            if (hasBlood) textStyle = { color: '#ef4444', fontWeight: 600 };
            if (isMe) textStyle = { color: '#fff' };

            return (
              <div
                key={msg.id}
                className="flex items-center gap-2 group rounded-lg px-2 py-1 hover:bg-white/[0.03] transition-colors"
              >
                {/* Mini avatar */}
                <div
                  className={`w-5 h-5 rounded-full bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-[8px] font-black text-white shrink-0`}
                >
                  {msg.user[0]?.toUpperCase()}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-gray-600 font-mono shrink-0 hidden sm:inline">{msg.timestamp}</span>

                {/* Name */}
                {hasCrown && <Crown className="w-3 h-3 text-yellow-500 shrink-0" />}
                <button
                  className={`text-xs font-bold shrink-0 hover:underline transition-all ${hasRainbow ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500' : ''}`}
                  style={!hasRainbow ? nameStyle : {}}
                  onClick={() => !isMe && onOpenPrivateChat?.(msg.user)}
                >
                  {msg.user}
                </button>

                {/* Rank badge */}
                <span className={`text-[9px] font-black ${rank.color} shrink-0`}>{rank.icon}</span>

                {/* Separator */}
                <span className="text-gray-700 text-xs shrink-0">›</span>

                {/* Message */}
                <span className="text-xs flex-1 break-words" style={textStyle}>
                  {msg.text}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 px-3 py-2 border-t border-white/[0.06] shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            maxLength={200}
            placeholder={channel === 'local' ? `Mesaj național...` : 'Mesaj global...'}
            className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-neonCyan/40 focus:bg-white/[0.07] transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`p-2 rounded-lg transition-all flex items-center justify-center ${
              inputText.trim()
                ? 'bg-neonCyan/20 border border-neonCyan/50 text-neonCyan hover:bg-neonCyan/30 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                : 'bg-white/5 border border-white/5 text-gray-700 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
