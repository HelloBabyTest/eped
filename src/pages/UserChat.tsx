import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, User as UserIcon, CheckCircle2, MessageCircle, X } from 'lucide-react';
import { motion } from 'motion/react';

type Message = {
  id: string;
  text: string;
  sender: string;
  time: string;
  status: 'sent' | 'read';
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

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages/${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (JSON.stringify(data) !== JSON.stringify(messages)) {
            setMessages(data);
          }
        }
        
        // Mark as read
        await fetch(`/api/chat/messages/${userId}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readerRole: 'user' })
        });
      } catch (e) {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1500);

    return () => clearInterval(interval);
  }, [userId, messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !userId) return;
    
    const msg = {
       id: Math.random().toString(),
       text: newMessage.trim(),
       sender: 'user', // non-admin sender
       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
       status: 'sent'
    };
    
    setMessages(prev => [...prev, msg as any]); // Optimistic update
    setNewMessage('');
    
    try {
      await fetch(`/api/chat/messages/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
    } catch (e) {
      console.error(e);
    }
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
    ? "fixed bottom-5 right-5 w-[min(380px,calc(100vw-32px))] h-[min(560px,80vh)] z-[100] flex flex-col shadow-2xl rounded-3xl"
    : `max-w-4xl mx-auto w-full flex-1 flex flex-col ${isPedagog ? 'h-[calc(100vh-140px)]' : 'py-8 px-4 mt-16 pb-24 h-[calc(100vh-64px)]'}`;

  return (
    <motion.div 
      initial={isPopup ? { opacity: 0, scale: 0.9, y: 30 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 30 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={containerClasses}
    >
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200/80 dark:border-gray-800/80 flex flex-col h-full overflow-hidden">
        
        {/* Chat Header */}
        <div className="h-16 border-b border-gray-100 dark:border-gray-800/80 px-5 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-sm tracking-wider shadow-sm shrink-0">
              AD
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white leading-tight">Admin Asistent</h3>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-500 dark:text-emerald-400 font-semibold mt-0.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Onlayn
              </div>
            </div>
          </div>
          {isPopup && onClose && (
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#e5ecef]/90 dark:bg-[#0e1621] custom-scrollbar">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 px-4">
              <MessageCircle className="w-12 h-12 mb-3 opacity-30 text-indigo-600 dark:text-indigo-400 animate-bounce" />
              <p className="font-semibold text-gray-600 dark:text-gray-400 text-sm">Hali hech qanday xabar yo'q</p>
              <p className="text-xs text-gray-450 dark:text-gray-500 mt-1 max-w-[200px]">Xabar yuborish orqali admin bilan aloqani boshlang</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender !== 'admin';
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id} 
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] relative ${
                    isMe 
                      ? 'bg-[#effdde] dark:bg-[#2b5278] text-gray-900 dark:text-white rounded-tr-none' 
                      : 'bg-white dark:bg-[#17212b] border border-transparent dark:border-gray-800/40 text-gray-900 dark:text-gray-100 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words pr-2">{msg.text}</p>
                    <div className="flex justify-end items-center gap-1 mt-1 shrink-0">
                      <span className={`text-[9px] font-medium tracking-wide ${isMe ? 'text-green-600/80 dark:text-sky-200/70' : 'text-gray-400'}`}>
                        {msg.time}
                      </span>
                      {isMe && (
                        <span className="text-green-600 dark:text-sky-300 flex items-center">
                          <CheckCircle2 className={`w-3 h-3 fill-current ${msg.status === 'read' ? 'stroke-sky-400 dark:stroke-sky-300' : 'stroke-white dark:stroke-indigo-900'}`} />
                          {msg.status === 'read' && <CheckCircle2 className="w-3 h-3 -ml-2 fill-current stroke-sky-400 dark:stroke-sky-300" />}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800/80 shrink-0">
          <div className="flex gap-2 max-w-4xl mx-auto items-end">
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
              className="flex-1 max-h-24 min-h-[46px] bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-900 text-sm resize-none dark:text-white transition-all overflow-y-auto"
              rows={1}
            />
            <button 
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="w-11 h-11 shrink-0 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-2xl flex items-center justify-center disabled:opacity-40 transition-all shadow-sm active:scale-95"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
        
      </div>
    </motion.div>
  );
}
