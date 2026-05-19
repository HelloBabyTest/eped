import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { createClient } from '@supabase/supabase-js';
import { 
  Loader2, Users, FileText, ClipboardList, BookOpen, 
  GraduationCap, ChevronLeft, Search, UserCheck, Shield,
  Award, TrendingUp, Calendar, AlertCircle, Trash2, Plus, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie
} from 'recharts';

import AcademicWork from './AcademicWork';
import ScientificWork from './ScientificWork';
import MethodicalWork from './MethodicalWork';
import MentorWork from './MentorWork';
import PersonalNotes from './PersonalNotes';

type Profile = {
  id: string;
  full_name: string;
  email?: string;
  role: string;
  status: 'pending' | 'active' | 'rejected';
  created_at?: string;
  last_sign_in_at?: string;
};

const COLORS = ['#4f46e5', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'academic' | 'scientific' | 'methodical' | 'mentor' | 'notes'>('academic');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<{id: string, name: string} | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  
  const [newUser, setNewUser] = useState({ full_name: '', email: '', password: '', role: 'pedagog' });
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSeedDefaults = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/setup-defaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Server xatoligi');

      alert(`Standart akkauntlar muvaffaqiyatli yaratildi (yoki allaqachon mavjud)!`);
      fetchUsers();
      setShowSetupModal(false);
    } catch (err: any) {
      console.error("Setup defaults error:", err);
      alert(err.message === 'Failed to fetch' 
        ? "Server bilan bog'lanib bo'lmadi. Iltimos biroz kuting va qayta urunib ko'ring." 
        : `Xatolik: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Foydalanuvchi yaratishda xatolik');
      
      alert(`Foydalanuvchi muvaffaqiyatli yaratildi! Email: ${newUser.email}`);
      setShowCreateModal(false);
      fetchUsers();
      setNewUser({ full_name: '', email: '', password: '', role: 'pedagog' });
    } catch (err: any) {
      console.error("Create user error:", err);
      alert(err.message === 'Failed to fetch' 
        ? "Server bilan bog'lanib bo'lmadi. Iltimos biroz kuting." 
        : `Xatolik: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: showPasswordModal.id, password: newPassword })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Parolni o\'zgartirishda xatolik');

      alert(`Parol muvaffaqiyatli o'zgartirildi!`);
      setShowPasswordModal(null);
      setNewPassword('');
    } catch (err: any) {
      console.error("Change password error:", err);
      alert(err.message === 'Failed to fetch' 
        ? "Server bilan bog'lanib bo'lmadi." 
        : `Xatolik: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Haqiqatan ham ushbu profilni o'chirmoqchimisiz? Ushbu profil bazadan butunlay o'chiriladi.")) return;
    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id })
      });

      const result = await response.json();
      if (!response.ok) {
        // Agar serverda xatolik bo'lsa (masalan key yo'q), profildan o'chirishga harakat qilamiz
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }

      setProfiles(profiles.filter(p => p.id !== id));
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveUser = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', id);
      if (error) throw error;
      setProfiles(profiles.map(p => p.id === id ? { ...p, status: 'active' } : p));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectUser = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Haqiqatan ham ushbu foydalanuvchini rad etmoqchimisiz?")) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (error) throw error;
      setProfiles(profiles.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        if (error.message.includes('status') || error.message.includes('email')) {
          console.warn("Status or Email column issue in admin fetch, falling back");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .order('full_name', { ascending: true });
          
          if (fallbackError) throw fallbackError;
          setProfiles(fallbackData?.map((p: any) => ({ ...p, status: 'active', email: '' })) || []);
        } else {
          throw error;
        }
      } else {
        // Map null/empty statuses to 'active' for existing users
        const sanitizedData = (data || []).map((p: any) => ({
          ...p,
          status: p.status || 'active'
        }));
        setProfiles(sanitizedData);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = 
      (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.role || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  // Statistics calculations
  const stats = useMemo(() => {
    const totalUsers = profiles.length;
    const pedagogCount = profiles.filter(p => p.role === 'pedagog').length;
    const adminCount = profiles.filter(p => p.role === 'admin' || p.role === 'rahbariyat').length;
    const pendingRequests = profiles.filter(p => p.status === 'pending').length;
    
    // Role distribution for PieChart
    const roleMap = new Map();
    profiles.forEach(p => {
      const role = p.role || 'noma\'lum';
      roleMap.set(role, (roleMap.get(role) || 0) + 1);
    });
    
    const roleDistribution = Array.from(roleMap.entries()).map(([name, value]) => ({ name, value }));

    return { totalUsers, pedagogCount, adminCount, pendingRequests, roleDistribution };
  }, [profiles]);

  if (loading && profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl bg-indigo-500/30 animate-pulse"></div>
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin relative z-10" />
        </div>
        <p className="text-gray-500 font-medium">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  if (selectedUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="max-w-7xl mx-auto py-8 px-4 mt-16 pb-24"
      >
        <button
          onClick={() => setSelectedUser(null)}
          className="group flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors mb-6 font-medium bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Ortga qaytish
        </button>

        <div className="relative bg-gradient-to-br from-indigo-900 to-indigo-700 rounded-3xl shadow-xl border border-indigo-600 p-8 mb-8 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 rounded-full blur transition-all group-hover:bg-white/30"></div>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center relative shadow-inner ring-4 ring-indigo-400/30">
                <Users className="w-10 h-10 text-indigo-600" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-white mb-2">{selectedUser.full_name || 'Ism kiritilmagan'}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/10 capitalize shadow-sm">
                  <Shield className="w-3.5 h-3.5 mr-1.5 opacity-80" />
                  {selectedUser.role}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-800/50 text-indigo-100 border border-indigo-600/50">
                  ID: {selectedUser.id.substring(0, 8)}...
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {[
            { id: 'academic', label: t('academicWork') || 'O\'quv ishlari', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
            { id: 'scientific', label: t('scientificWork') || 'Ilmiy ishlari', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
            { id: 'methodical', label: t('methodicalWork') || 'Usulubiy ishlari', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-100' },
            { id: 'mentor', label: t('masterApprentice') || 'Ustoz-shogird', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { id: 'notes', label: t('personalNotes') || 'Qaydnomalar', icon: FileText, color: 'text-rose-600', bg: 'bg-rose-100' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center whitespace-nowrap gap-2.5 px-6 py-3.5 rounded-2xl font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-md border-2 border-indigo-500 scale-[1.02]'
                  : 'bg-white/60 text-gray-500 hover:bg-white hover:text-gray-900 border-2 border-transparent hover:border-gray-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeTab === tab.id ? tab.bg : 'bg-gray-100'} transition-colors`}>
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? tab.color : 'text-gray-500'}`} />
              </div>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 min-h-[500px]"
          >
            {activeTab === 'academic' && <AcademicWork adminUserId={selectedUser.id} />}
            {activeTab === 'scientific' && <ScientificWork adminUserId={selectedUser.id} />}
            {activeTab === 'methodical' && <MethodicalWork adminUserId={selectedUser.id} />}
            {activeTab === 'mentor' && <MentorWork adminUserId={selectedUser.id} />}
            {activeTab === 'notes' && <PersonalNotes adminUserId={selectedUser.id} />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 mt-16 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Umumiy tizim nazorati</h1>
          <p className="text-gray-500 mt-2 text-lg">Platformadagi barcha foydalanuvchilar va ma'lumotlar tahlili.</p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-5 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-3">
          <Shield className="w-6 h-6 text-red-500" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 text-white/10">
            <Users className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full min-h-[140px]">
            <div>
              <p className="text-indigo-100 font-medium tracking-wide uppercase text-sm">Jami foydalanuvchilar</p>
              <h3 className="text-5xl font-black mt-2">{stats.totalUsers}</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-indigo-100 bg-indigo-800/30 w-fit px-3 py-1 rounded-full mt-4">
              <TrendingUp className="w-4 h-4" /> Tizimdagi ro'yxatdan o'tganlar
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 font-medium tracking-wide uppercase text-sm">O'qituvchilar</p>
              <h3 className="text-4xl font-black text-gray-900 mt-2">{stats.pedagogCount}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-8">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full" 
                style={{ width: `${(stats.pedagogCount / (stats.totalUsers || 1)) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-3 font-medium">Jami foydalanuvchilarning {Math.round((stats.pedagogCount / (stats.totalUsers || 1)) * 100)}% i</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`bg-white rounded-3xl p-6 border shadow-sm relative overflow-hidden transition-all ${stats.pendingRequests > 0 ? 'border-amber-200 ring-2 ring-amber-50' : 'border-gray-100'}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 font-medium tracking-wide uppercase text-sm">Kutilayotgan so'rovlar</p>
              <h3 className={`text-4xl font-black mt-2 ${stats.pendingRequests > 0 ? 'text-amber-600' : 'text-gray-900'}`}>{stats.pendingRequests}</h3>
            </div>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stats.pendingRequests > 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-50 text-gray-400'}`}>
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            {stats.pendingRequests > 0 ? (
              <span className="text-sm font-bold text-amber-600 flex items-center gap-1.5 animate-pulse">
                <AlertCircle className="w-4 h-4" /> Yangi foydalanuvchilarni tasdiqlash kerak
              </span>
            ) : (
              <span className="text-sm font-medium text-gray-400">Barcha so'rovlar ko'rib chiqilgan</span>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Charts */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center"
        >
          <h3 className="text-lg font-bold text-gray-900 w-full mb-4">Rollarning taqsimlanishi</h3>
          <div className="h-64 w-full min-w-[1px] min-h-[1px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <PieChart>
                <Pie
                  data={stats.roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 w-full mt-4">
            {stats.roleDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-sm font-medium text-gray-600 capitalize">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* User List Data Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Foydalanuvchilar reyestri
            </h3>
            
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'pending', label: 'So\'rovlar', count: stats.pendingRequests },
                { id: 'active', label: 'Faol' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    statusFilter === filter.id 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {filter.label}
                  {filter.count !== undefined && filter.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${statusFilter === filter.id ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowSetupModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 font-bold rounded-xl hover:bg-amber-100 transition"
                title="Sursuniy intellekt tomonidan so'ralgan akkauntlarni yaratish"
              >
                <AlertCircle className="w-4 h-4" />
                Tizim sozlamalari
              </button>
              <div className="relative flex-1 sm:flex-none sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ism yoki rol bo'yicha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all"
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4" />
                Qo'shish
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Foydalanuvchi</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Holati</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProfiles.map((profile, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * Math.min(i, 10) }}
                    key={profile.id} 
                    className="hover:bg-indigo-50/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedUser(profile)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100">
                          <span className="text-indigo-600 font-bold text-sm">
                            {(profile.full_name || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {profile.full_name || 'Ism kiritilmagan'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{profile.email || <span className="text-gray-400 italic">Login (email) yo'q</span>}</p>
                          <p className="text-xs text-gray-300 font-mono mt-0.5">{profile.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${
                        profile.role === 'pedagog' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200/60' 
                          : profile.role === 'admin' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200/60'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                      }`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                        profile.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                          : profile.status === 'pending' 
                            ? 'bg-amber-50 text-amber-700 border-amber-200/60 animate-pulse'
                            : 'bg-rose-50 text-rose-700 border-rose-200/60'
                      }`}>
                        {profile.status === 'pending' ? 'Kutilmoqda' : profile.status === 'active' ? 'Faol' : 'Rad etilgan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {profile.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => handleRejectUser(profile.id, e)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                            >
                              Rad etish
                            </button>
                            <button
                              onClick={(e) => handleApproveUser(profile.id, e)}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                            >
                              Tasdiqlash
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedUser(profile); }}
                          className={`${profile.status === 'pending' ? 'hidden sm:flex' : 'flex'} px-4 py-2 bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-600 hover:text-white rounded-lg text-sm font-semibold transition-all shadow-sm`}
                        >
                          Boshqarish
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setShowPasswordModal({ id: profile.id, name: profile.full_name }); }}
                          className="p-2 bg-white text-amber-500 border border-amber-200 hover:bg-amber-500 hover:text-white rounded-lg transition-all shadow-sm"
                          title="Parolni o'zgartirish"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteUser(profile.id, e)}
                          className="p-2 bg-white text-rose-500 border border-rose-200 hover:bg-rose-500 hover:text-white rounded-lg transition-all shadow-sm"
                          title="Foydalanuvchini o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredProfiles.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center opacity-50">
                        <Search className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-500 font-medium">Foydalanuvchilar topilmadi</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Moda for Create User */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
               <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <UserCheck className="w-5 h-5 text-indigo-600" /> Yangi foydalanuvchi qos'hish
               </h3>
               <form onSubmit={handleCreateUser} className="space-y-4">
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">F.I.SH</label>
                   <input required value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Masalan: To'rayev Alisher" />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Login (Email)</label>
                   <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="email@tatu.uz" />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Parol</label>
                   <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Kamida 6ta belgi" minLength={6} />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
                   <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                     <option value="pedagog">Pedagog</option>
                     <option value="tahrirlovchi">Tahrirlovchi (Kafedra mudiri)</option>
                     <option value="tasdiqlovchi">Tasdiqlovchi</option>
                     <option value="rahbariyat">Rahbariyat</option>
                     <option value="admin">Administrator</option>
                   </select>
                 </div>
                 <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">Bekor qilish</button>
                   <button disabled={isSubmitting} type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
                     {isSubmitting ? 'Yaratilmoqda...' : 'Yaratish'}
                   </button>
                 </div>
               </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moda for Change Password */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border border-gray-100">
               <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                 <Key className="w-5 h-5 text-amber-500" /> Parolni o'zgartirish
               </h3>
               <p className="text-sm text-gray-500 mb-4">
                 <strong>{showPasswordModal.name}</strong> uchun yangi parol kiriting:
               </p>
               <form onSubmit={handleChangePassword} className="space-y-4">
                 <div>
                   <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" placeholder="Yangi parol (kamida 6 belgi)" minLength={6} />
                 </div>
                 <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => { setShowPasswordModal(null); setNewPassword(''); }} className="flex-1 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">Bekor qilish</button>
                   <button disabled={isSubmitting} type="submit" className="flex-1 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition disabled:opacity-50 shadow-sm shadow-amber-200">
                     {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
                   </button>
                 </div>
               </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSetupModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
               <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertCircle className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Tizimni sozlash</h3>
               <p className="text-gray-500 text-center mb-6 text-sm">
                 Quyidagi standart akkauntlar yaratiladi:<br/>
                 1. <strong>editor@gmail.com</strong> (Tahrirlovchi)<br/>
                 2. <strong>approv@gmail.com</strong> (Tasdiqlovchi)
               </p>
               <div className="flex flex-col gap-3">
                 <button 
                   disabled={isSubmitting} 
                   onClick={handleSeedDefaults} 
                   className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
                 >
                   {isSubmitting ? 'Yaratilmoqda...' : 'Akkauntlarni yaratish'}
                 </button>
                 <button 
                   onClick={() => setShowSetupModal(false)} 
                   className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition"
                 >
                   Bekor qilish
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
