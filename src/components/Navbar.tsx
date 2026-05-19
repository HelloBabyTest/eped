import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus, LogOut, User, Sun, Moon } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import ProfileModal from './ProfileModal';

import ConfirmModal from './ConfirmModal';

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const isDashboard = location.pathname.includes('/dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.id) fetchProfile(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const performLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleLogout = () => {
    setIsConfirmModalOpen(true);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (session && profile) {
      e.preventDefault();
      switch (profile.role) {
        case 'admin':
          navigate('/dashboard/admin');
          break;
        case 'rahbariyat':
          navigate('/dashboard/rahbariyat');
          break;
        case 'tahrirlovchi':
          navigate('/dashboard/tahrirlovchi');
          break;
        case 'tasdiqlovchi':
          navigate('/dashboard/tasdiqlovchi');
          break;
        default:
          navigate('/dashboard/pedagog');
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-2 group">
            <div className="p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              E-Pedagog
            </span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <LanguageSwitcher />
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />
            
            {isDashboard ? (
              <>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xs:inline">{t('logout')}</span>
                </button>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('profile')}</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden xs:inline">{t('login')}</span>
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('register')}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={performLogout}
        title={t('confirmLogoutTitle')}
        message={t('confirmLogoutMsg')}
      />
    </nav>
  );
}
