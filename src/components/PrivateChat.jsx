import React, { useState, useEffect, useRef } from 'react';
import { Send, X, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

const PrivateChat = ({ chatUser, onClose, userName = 'Eu', positionIndex = 0 }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  
  const channelName = [userName, chatUser].sort().join('_');

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel', `private_${channelName}`)
        .order('created_at', { ascending: true });
        
      if (data) {
        setMessages(data.map(m => ({
          id: m.id,
          user: m.sender_email,
          text: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
          isLocal: m.sender_email === userName
        })));
      }
    };
    
    fetchMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`public:messages:private_${channelName}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `channel=eq.private_${channelName}`
      }, payload => {
        const m = payload.new;
        setMessages(prev => {
          // Check if message already exists (we might have added it optimistically)
          if (prev.find(msg => msg.id === m.id)) return prev;
          
          return [...prev, {
            id: m.id,
            user: m.sender_email,
            text: m.content,
            timestamp: new Date(m.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
            isLocal: m.sender_email === userName
          }];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channelName, userName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const msgText = inputText.trim();
    setInputText('');

    // Optimistic UI update (optional, but good for UX)
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: tempId,
      user: userName,
      text: msgText,
      timestamp: new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
      isLocal: true
    }]);

    await supabase.from('messages').insert([{
      sender_email: userName,
      receiver_email: chatUser,
      channel: `private_${channelName}`,
      content: msgText
    }]);
  };

  // Calculate right offset based on positionIndex so multiple chats can stack horizontally
  const rightOffset = 24 + (positionIndex * 340); // 24px base padding + 340px per chat window

  return (
    <div 
      className="fixed bottom-0 z-[9999] flex flex-col w-80 h-96 glass-panel rounded-t-xl border border-white/20 shadow-[0_-5px_25px_rgba(0,0,0,0.5)] overflow-hidden transition-transform animate-in slide-in-from-bottom-10"
      style={{ right: `${rightOffset}px` }}
    >
      {/* Header */}
      <div className="bg-black/60 p-3 border-b border-white/10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-neonPurple/20 flex items-center justify-center border border-neonPurple">
            <User size={14} className="text-neonPurple" />
          </div>
          <div>
            <h4 className="text-white font-bold text-sm leading-tight">{chatUser}</h4>
            <span className="text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white p-1 bg-white/5 rounded transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-black/40">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-xs mt-4 italic">Începe conversația cu {chatUser}.</div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.isLocal ? 'items-end' : 'items-start'}`}>
            <span className="text-[9px] text-gray-500 mb-0.5">{msg.timestamp}</span>
            <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] break-words ${
              msg.isLocal 
                ? 'bg-neonPurple/20 text-white border border-neonPurple/40 rounded-tr-none' 
                : 'bg-white/10 text-gray-200 border border-white/10 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-2 border-t border-white/10 flex gap-2 items-center bg-black/60 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Scrie un mesaj..."
          className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-neonPurple/50 transition-colors"
        />
        <button
          type="submit"
          className="bg-neonPurple/20 hover:bg-neonPurple/40 text-neonPurple p-1.5 rounded border border-neonPurple/50 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default PrivateChat;
