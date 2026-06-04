import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Search, User, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

type Profile = {
  id: string;
  full_name: string;
  role: string;
};

type Message = {
  id: string;
  text: string;
  sender: string;
  time: string;
  status: 'sent' | 'read';
};

export default function AdminChatInterface() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from('profiles').select('id, full_name, role').neq('role', 'admin').order('full_name');
      if (data) setUsers(data);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages/${selectedUserId}`);
        if (res.ok) {
          const data = await res.json();
          if (JSON.stringify(data) !== JSON.stringify(messages)) {
            setMessages(data);
          }
        }

        // Mark as read
        await fetch(`/api/chat/messages/${selectedUserId}/read`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ readerRole: 'admin' })
        });
      } catch (e) {}
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1500);

    return () => clearInterval(interval);
  }, [selectedUserId, messages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUserId) return;
    
    const msg = {
       id: Math.random().toString(),
       text: newMessage.trim(),
       sender: 'admin',
       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
       status: 'sent'
    };
    
    setMessages(prev => [...prev, msg as any]);
    setNewMessage('');

    try {
      await fetch(`/api/chat/messages/${selectedUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
    } catch(e) {
      console.error(e);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex h-[700px] max-h-[80vh]">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Chatlar</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredUsers.map(user => {
            const isSelected = selectedUserId === user.id;
            let msgCount = 0;
            // Removed localStorage check, you would need to poll or fetch per-user, 
            // but for simplicity we keep it without lastMsg or fetch via API if needed.
            let lastMsg = '';

            return (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-colors text-left ${isSelected ? 'bg-indigo-50 border-transparent shadow-sm ring-1 ring-indigo-100' : 'hover:bg-white border border-transparent hover:border-gray-100'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-900 truncate">{user.full_name || 'Ismsiz'}</h4>
                  </div>
                  <div className="text-xs text-indigo-600 font-medium capitalize mt-0.5">{user.role}</div>
                  {lastMsg ? (
                    <p className="text-xs text-gray-500 truncate mt-1">{lastMsg}</p>
                  ) : (
                    <p className="text-xs text-gray-400 italic mt-1">Xabar yo'q</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedUserId ? (
          <>
            {/* Chat header */}
            <div className="h-16 border-b border-gray-100 px-6 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{users.find(u => u.id === selectedUserId)?.full_name || 'Ismsiz'}</h3>
                  <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> Oflayn
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
                  <p>Hali hech qanday xabar yo'q</p>
                  <p className="text-sm">Birinchi bo'lib yozing</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id} 
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isAdmin ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-900 rounded-tl-sm'}`}>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 ${isAdmin ? 'text-indigo-200' : 'text-gray-400'}`}>
                          {msg.time}
                          {isAdmin && (
                            <span className="flex items-center">
                               <CheckCircle2 className={`w-3 h-3 ${msg.status === 'read' ? 'text-sky-300' : 'text-indigo-200'}`} />
                               {msg.status === 'read' && <CheckCircle2 className="w-3 h-3 -ml-2 text-sky-300" />}
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

            {/* Input area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
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
                  className="flex-1 max-h-32 min-h-[52px] bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent text-sm resize-none"
                  rows={1}
                />
                <button 
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="w-14 h-[52px] shrink-0 bg-indigo-600 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-sm active:scale-95"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
               <MessageCircle className="w-10 h-10 text-indigo-200" />
            </div>
            <p className="text-lg font-medium text-gray-600 mb-1">Chatni tanlang</p>
            <p className="text-sm">Yozishni boshlash uchun chap tomondan foydalanuvchini tanlang</p>
          </div>
        )}
      </div>
    </div>
  );
}
