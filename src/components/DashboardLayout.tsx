import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, BookOpen, LogOut, 
  LayoutDashboard, StickyNote, User, 
  GraduationCap, Library, FlaskConical, 
  Users, Award, Scale, Sun, Moon, Loader2,
  AlertCircle, MessageCircle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileModal from './ProfileModal';
import ConfirmModal from './ConfirmModal';
import NotificationBell from './NotificationBell';

interface SidebarItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span className="font-medium text-sm truncate">{label}</span>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('status, role')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setUserRole(profile.role);
      }
      
      if (profile?.status === 'pending' && profile.role !== 'admin' && profile.role !== 'rahbariyat') {
        navigate('/pending-approval');
      } else if (profile?.status === 'rejected') {
        await supabase.auth.signOut();
        navigate('/login');
      }
      setLoading(false);
    };

    checkStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  const performLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleLogout = () => {
    setIsConfirmModalOpen(true);
  };

  const menuItems = [
    { to: '/dashboard/pedagog', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/dashboard/pedagog/notes', icon: StickyNote, label: t('personalNotes') },
    { to: '/dashboard/pedagog/academic', icon: GraduationCap, label: t('academicWork') },
    { to: '/dashboard/pedagog/methodical', icon: Library, label: t('methodicalWork') },
    { to: '/dashboard/pedagog/scientific', icon: FlaskConical, label: t('scientificWork') },
    { to: '/dashboard/pedagog/master-apprentice', icon: Users, label: t('masterApprentice') },
    { to: '/dashboard/pedagog/annual', icon: Award, label: t('annualWork') },
    { to: '/dashboard/pedagog/norms', icon: Scale, label: t('norms') },
    { to: '/dashboard/pedagog/chat', icon: MessageCircle, label: 'Chat' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 p-6 fixed h-full overflow-y-auto z-50 transition-colors duration-200">
        <Link to="/dashboard/pedagog" className="flex items-center gap-2 mb-10 px-2">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">E-Pedagog</span>
        </Link>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.to}
            />
          ))}
        </nav>

        <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-800 z-50 p-6 shadow-2xl lg:hidden overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">E-Pedagog</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <SidebarItem 
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={location.pathname === item.to}
                  onClick={() => setIsSidebarOpen(false)}
                />
              ))}
            </nav>

            <div className="pt-6 mt-6 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t('logout')}</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 relative">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <LanguageSwitcher />

            <div className="h-8 w-px bg-gray-100 dark:bg-gray-800" />
            
            <NotificationBell role={userRole} />

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full flex items-center justify-center transition-colors shadow-sm"
              >
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8 flex-1 overflow-x-hidden outline-none">
          {children}
        </main>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={performLogout}
        title="Tizimdan chiqish"
        message="Haqiqatan ham tizimdan chiqmoqchimisiz?"
      />
    </div>
  );
}
