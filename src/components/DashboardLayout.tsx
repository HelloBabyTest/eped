import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, BookOpen, LogOut, 
  LayoutDashboard, StickyNote, User, 
  GraduationCap, Library, FlaskConical, 
  Users, Award, Scale
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

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
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
    }`}
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    <span className="font-medium text-sm truncate">{label}</span>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState<string | null>(null);

  React.useEffect(() => {
    fetchRole();
  }, []);

  const fetchRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (data) setRole(data.role);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (role === 'pedagog') return '/dashboard/pedagog';
    if (role === 'rahbariyat') return '/dashboard/rahbariyat';
    if (role === 'admin') return '/dashboard/admin';
    return '/';
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
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Sidebar - Desktop */}
      <aside className="print-hidden hidden lg:flex flex-col w-72 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 p-6 fixed h-full overflow-y-auto z-50 transition-colors duration-200">
        <Link to={getDashboardLink()} className="flex items-center gap-2 mb-10 px-2">
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
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-800 z-50 p-6 shadow-2xl lg:hidden overflow-y-auto transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-10">
                <Link to={getDashboardLink()} onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">E-Pedagog</span>
                </Link>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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

              <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">{t('logout')}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 relative print-content">
        {/* Header */}
        <header className="print-hidden h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeSwitcher />
            <LanguageSwitcher />

            <div className="h-8 w-px bg-gray-100 dark:bg-gray-700" />

            <Link 
              to="/dashboard/pedagog/profile"
              className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8 flex-1 overflow-x-hidden outline-none print-content">
          {children}
        </main>
      </div>
    </div>
  );
}
