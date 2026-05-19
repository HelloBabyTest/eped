import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ConfigRequired from './components/ConfigRequired';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PendingApproval from './pages/PendingApproval';
import PedagogDashboard from './pages/PedagogDashboard';
import PersonalNotes from './pages/PersonalNotes';
import AcademicWork from './pages/AcademicWork';
import MethodicalWork from './pages/MethodicalWork';
import ScientificWork from './pages/ScientificWork';
import MentorWork from './pages/MentorWork';
import AdminDashboardPage from './pages/AdminDashboard';
import YearlyWork from './pages/YearlyWork';
import Norms from './pages/Norms';
import { isSupabaseConfigured } from './lib/supabase';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

import TahrirlovchiDashboard from './pages/TahrirlovchiDashboard';
import TasdiqlovchiDashboard from './pages/TasdiqlovchiDashboard';

// Placeholder Dashboard Components
const RahbariyatDashboard = () => (
  <div className="min-h-screen pt-20 px-8">
    <h1 className="text-3xl font-bold">Rahbariyat Paneli</h1>
    <p className="mt-4 text-gray-600">Xush kelibsiz! Bu yerda siz professor-o'qituvchilar faoliyatini kuzatishingiz mumkin.</p>
  </div>
);

const PlaceholderView = ({ title }: { title: string }) => (
  <div className="max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
    <div className="mt-12 p-20 border-2 border-gray-100 rounded-3xl text-center bg-white shadow-sm">
      <p className="text-gray-500 text-lg">Ushbu bo'lim tez orada ishga tushiriladi.</p>
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
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public Routes with Navbar */}
            <Route path="/" element={<><Navbar /><LandingPage /><Footer /></>} />
            
            {/* Auth Routes (No Navbar) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pending-approval" element={<PendingApproval />} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard/pedagog" element={<DashboardLayout><PedagogDashboard /></DashboardLayout>} />
            <Route path="/dashboard/pedagog/notes" element={<DashboardLayout><PersonalNotes /></DashboardLayout>} />
            <Route path="/dashboard/pedagog/academic" element={<DashboardLayout><AcademicWork /></DashboardLayout>} />
            <Route path="/dashboard/pedagog/methodical" element={<DashboardLayout><MethodicalWork /></DashboardLayout>} />
            <Route path="/dashboard/pedagog/scientific" element={<DashboardLayout><ScientificWork /></DashboardLayout>} />
            <Route path="/dashboard/pedagog/master-apprentice" element={<DashboardLayout><MentorWork /></DashboardLayout>} />
            <Route path="/dashboard/pedagog/annual" element={<DashboardLayout><YearlyWork /></DashboardLayout>} />
            <Route path="/dashboard/pedagog/norms" element={<DashboardLayout><Norms /></DashboardLayout>} />
            
            <Route path="/dashboard/rahbariyat" element={<><Navbar /><RahbariyatDashboard /></>} />
            <Route path="/dashboard/tahrirlovchi" element={<><Navbar /><TahrirlovchiDashboard /></>} />
            <Route path="/dashboard/tasdiqlovchi" element={<><Navbar /><TasdiqlovchiDashboard /></>} />
            <Route path="/dashboard/admin" element={<><Navbar /><AdminDashboardPage /></>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}
