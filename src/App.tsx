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
import AdminDashboard from './pages/AdminDashboard';
import { isSupabaseConfigured } from './lib/supabase';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Placeholder Dashboard Components
const PedagogDashboard = () => (
  <div className="max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">O'qituvchi Boshqaruv Paneli</h1>
    <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed">
      Xush kelibsiz! Bu yerda siz o'z ish rejalaringizni boshqarishingiz, hisobotlarni topshirishingiz va ta'lim sifatini kuzatishingiz mumkin.
    </p>
    
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        { title: 'Dars jadvali', desc: 'Haftalik dars jadvalingizni ko\'rish va tahrirlash.', icon: '📅' },
        { title: 'O\'quvchilar', desc: 'Sinfingizdagi o\'quvchilar ro\'yxati va baholari.', icon: '🎓' },
        { title: 'Hisobotlar', desc: 'Oylik va choraklik hisobotlarni tayyorlash.', icon: '📊' },
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

const RahbariyatDashboard = () => (
  <div className="min-h-screen pt-20 px-8">
    <h1 className="text-3xl font-bold dark:text-white">Rahbariyat Paneli</h1>
    <p className="mt-4 text-gray-600 dark:text-gray-300">Xush kelibsiz! Bu yerda siz o'qituvchilar faoliyatini kuzatishingiz mumkin.</p>
  </div>
);

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
    <div className="mt-12 p-20 border-2 border-gray-100 dark:border-gray-700 rounded-3xl text-center bg-white dark:bg-gray-800 shadow-sm">
      <p className="text-gray-500 dark:text-gray-400 text-lg">Ushbu bo'lim tez orada ishga tushiriladi.</p>
    </div>
  </div>
);

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
              <Route path="/dashboard/pedagog/notes" element={<DashboardLayout><PersonalNotes /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/academic" element={<DashboardLayout><AcademicWork /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/methodical" element={<DashboardLayout><MethodicalWork /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/scientific" element={<DashboardLayout><ScientificWork /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/master-apprentice" element={<DashboardLayout><MentorWork /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/annual" element={<DashboardLayout><PlaceholderView title="YILLIK BAJARILGAN ISHLAR" /></DashboardLayout>} />
              <Route path="/dashboard/pedagog/norms" element={<DashboardLayout><PlaceholderView title="ME’YORLAR" /></DashboardLayout>} />
              
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
