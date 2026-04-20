import { Link } from 'react-router-dom';
import { BookOpen, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { t } = useLanguage();
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchRole(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    if (data) setRole(data.role);
  };

  const getLogoLink = () => {
    if (session && role === 'pedagog') return '/dashboard/pedagog';
    if (session && role === 'rahbariyat') return '/dashboard/rahbariyat';
    if (session && role === 'admin') return '/dashboard/admin';
    return '/';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={getLogoLink()} className="flex items-center gap-2 group">
            <div className="p-1.5 sm:p-2 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="hidden sm:block text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
              E-Pedagog
            </span>
          </Link>
          
          <div className="flex items-center gap-1 sm:gap-4">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block" />
            {!session ? (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('navLogin')}</span>
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('navRegister')}</span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to={getLogoLink()}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('dashboard')}</span>
                </Link>
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-sm font-medium text-red-600 hover:text-white bg-red-50 hover:bg-red-600 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-600 dark:hover:text-white rounded-lg transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('logout')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
