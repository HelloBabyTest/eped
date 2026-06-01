import React, { useState, useEffect, useRef } from 'react';
import { Bell, MessageCircle, CalendarClock, Info, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

type Notification = {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  time: string;
  isRead: boolean;
};

export default function NotificationBell({ role }: { role?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate some contextual notifications based on role
    const defaultNotifs: Notification[] = [];

    // Common notification
    defaultNotifs.push({
      id: 'n1',
      title: 'Tizim yangilanishi',
      desc: 'E-Pedagog tizimimiz yangilandi. Yangi imkoniyatlardan foydalaning.',
      icon: <Info className="w-5 h-5 text-indigo-500" />,
      time: '12 daqiqa oldin',
      isRead: false
    });

    if (role === 'pedagog') {
      defaultNotifs.push({
        id: 'n2',
        title: "Kutilayotgan ishlar",
        desc: "O'quv ishlari hisobotini to'ldirishingiz kutilmoqda.",
        icon: <CalendarClock className="w-5 h-5 text-orange-500" />,
        time: '1 soat oldin',
        isRead: false
      });
      defaultNotifs.push({
        id: 'n3',
        title: "Chatdan xabar",
        desc: "Admin sizga yangi xabar yubordi.",
        icon: <MessageCircle className="w-5 h-5 text-emerald-500" />,
        time: '3 soat oldin',
        isRead: true
      });
    } else if (role === 'tahrirlovchi' || role === 'tasdiqlovchi') {
      defaultNotifs.push({
        id: 'n2',
        title: "Yangi hisobotlar",
        desc: "O'qituvchilar tomonidan tasdiqlash uchun yangi ishlar yuborildi.",
        icon: <CalendarClock className="w-5 h-5 text-purple-500" />,
        time: 'Yaqingina',
        isRead: false
      });
    } else if (role === 'admin') {
      defaultNotifs.push({
        id: 'n2',
        title: "Yangi arizalar",
        desc: "Tizimga kirish uchun yangi foydalanuvchilar arizalari mavjud.",
        icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
        time: '30 daqiqa oldin',
        isRead: false
      });
    }

    setNotifications(defaultNotifs);
  }, [role]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 dark:text-gray-100">Bildirishnomalar</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Barchasini o'qish
              </button>
            )}
          </div>
          
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notif => (
                <div 
                  key={notif.id}
                  className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer border-b border-gray-50 dark:border-gray-800/50 last:border-0 transition-colors flex gap-3 ${!notif.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className="mt-1 flex-shrink-0">
                    {notif.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{notif.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notif.desc}</p>
                    <span className="text-[10px] text-gray-400 font-medium mt-2 block">{notif.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                Yangi bildirishnomalar yo'q.
              </div>
            )}
          </div>
          
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 text-center">
              <button className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                Barchasini ko'rish
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
