import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ConfigRequired from './components/ConfigRequired';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PersonalNotes from './pages/PersonalNotes';
import AcademicWork from './pages/AcademicWork';
import MethodicalWork from './pages/MethodicalWork';
import ScientificWork from './pages/ScientificWork';
import MentorWork from './pages/MentorWork';
import Profile from './pages/Profile';
import AnnualReport from './pages/AnnualReport';
import Norms from './pages/Norms';
import AdminDashboard from './pages/AdminDashboard';
import { isSupabaseConfigured } from './lib/supabase';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Placeholder Dashboard Components
const PedagogDashboard = () => {
  const { t } = useLanguage();
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('pedagogDashboardTitle')}</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
        {t('pedagogDashboardDesc')}
      </p>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { title: t('scheduleTitle'), desc: t('scheduleDesc'), icon: '📅' },
          { title: t('studentsTitle'), desc: t('studentsDesc'), icon: '🎓' },
          { title: t('reportsTitle'), desc: t('reportsDesc'), icon: '📊' },
        ].map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all">
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RahbariyatDashboard = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen pt-20 px-8">
      <h1 className="text-3xl font-bold dark:text-white">{t('rahbariyatDashboardTitle')}</h1>
      <p className="mt-4 text-gray-600 dark:text-gray-300">{t('rahbariyatDashboardDesc')}</p>
    </div>
  );
};

const PlaceholderView = ({ title }: { title: string }) => {
  const { t } = useLanguage();
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      <div className="mt-12 p-20 border-2 border-gray-100 dark:border-gray-700 rounded-3xl text-center bg-white dark:bg-gray-800 shadow-sm">
        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('placeholderViewDesc')}</p>
      </div>
    </div>
  );
};

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigRequired />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Routes>
              {/* Public Routes with Navbar */}
              <Route path="/" element={<><Navbar /><LandingPage /><Footer /></>} />
              
              {/* Auth Routes (No Navbar) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard/pedagog" element={<DashboardLayout><PedagogDashboard /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/profile" element={<DashboardLayout><Profile /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/notes" element={<DashboardLayout><PersonalNotes /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/academic" element={<DashboardLayout><AcademicWork /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/methodical" element={<DashboardLayout><MethodicalWork /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/scientific" element={<DashboardLayout><ScientificWork /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/master-apprentice" element={<DashboardLayout><MentorWork /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/annual" element={<DashboardLayout><AnnualReport /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/norms" element={<DashboardLayout><Norms /></DashboardLayout>} />
              
              <Route path="/dashboard/rahbariyat" element={<><Navbar /><RahbariyatDashboard /></>} />
              <Route path="/dashboard/admin" element={<><Navbar /><AdminDashboard /></>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}
