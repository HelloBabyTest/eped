import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, User as UserIcon, CheckCircle2, MessageCircle, X } from 'lucide-react';
import { motion } from 'motion/react';

type Message = {
  id: string;
  text: string;
  sender: string;
  time: string;
};

export default function UserChat({ isPopup = false, onClose }: { isPopup?: boolean; onClose?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const key = 'admin_chat_' + userId;
    
    // Initial load
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch(e) {}
    }

    // Polling for new messages
    const interval = setInterval(() => {
      const current = localStorage.getItem(key);
      if (current) {
        try {
          const parsed = JSON.parse(current);
          if (parsed.length !== messages.length) {
            setMessages(parsed);
          }
        } catch(e) {}
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userId, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !userId) return;
    
    const key = 'admin_chat_' + userId;
    const msg = {
       id: Math.random().toString(),
       text: newMessage.trim(),
       sender: 'user', // non-admin sender
       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updated = [...messages, msg];
    setMessages(updated);
    localStorage.setItem(key, JSON.stringify(updated));
    setNewMessage('');
    
    setTimeout(() => {
        // Mock reply if no admin opens and replies (just for demo behavior if it existed, but here we don't mock? Actually we had mock in ChatWithAdmin!)
        const currentMsgs = JSON.parse(localStorage.getItem(key) || '[]');
        if (currentMsgs.length === updated.length) {
            const reply = {
              id: Math.random().toString(),
              text: "Assalomu alaykum! Murojaatingiz qabul qilindi. Tez orada javob beramiz.",
              sender: 'admin',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
           };
           const updatedWithReply = [...currentMsgs, reply];
           setMessages(updatedWithReply);
           localStorage.setItem(key, JSON.stringify(updatedWithReply));
        }
    }, 1500);
  };

  if (!userId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 mt-16">
        <p className="text-gray-500">Yuklanmoqda...</p>
      </div>
    );
  }

  const isPedagog = window.location.pathname.includes('/pedagog');

  const containerClasses = isPopup 
    ? "fixed bottom-4 right-4 w-96 h-[500px] z-50 flex flex-col shadow-2xl rounded-3xl"
    : `max-w-4xl mx-auto w-full ${isPedagog ? 'h-[calc(100vh-120px)]' : 'py-8 px-4 mt-16 pb-24 h-[calc(100vh-64px)]'}`;

  return (
    <div className={containerClasses}>
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-hidden">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-100 dark:border-gray-800 px-6 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Admin</h3>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> Oflayn
              </div>
            </div>
          </div>
          {isPopup && onClose && (
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#eef1f5] dark:bg-gray-950">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
              <p>Hali hech qanday xabar yo'q</p>
              <p className="text-sm">Xabar yuborish orqali chatni boshlang</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender !== 'admin';
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                >
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'}`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {msg.time}
                      {isMe && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex gap-3 max-w-4xl mx-auto items-end">
            <textarea 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Xabar yozing..."
              className="flex-1 max-h-32 min-h-[52px] bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 focus:border-transparent text-sm resize-none dark:text-white"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="w-14 h-[52px] shrink-0 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm active:scale-95"
            >
              <Send className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
