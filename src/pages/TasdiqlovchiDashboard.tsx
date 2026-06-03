import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Users, ChevronRight, User, CheckCircle2, ShieldCheck, Mail, Calendar, LogOut
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import MethodicalWork from './MethodicalWork';
import ScientificWork from './ScientificWork';
import MentorWork from './MentorWork';
import YearlyWork from './YearlyWork';
import ConfirmModal from '../components/ConfirmModal';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  department: string;
  role: string;
  status: string;
  created_at: string;
}

export default function TasdiqlovchiDashboard() {
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [activeView, setActiveView] = useState<'teachers' | 'teacher_details'>('teachers');
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState<Profile | null>(null);
  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeView === 'teachers') {
      fetchTeachers();
    }
  }, [activeView]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'pedagog')
        .order('full_name', { ascending: true });

      if (error) {
        if (error.message.includes('email') || error.message.includes('status')) {
          console.warn("Email or Status column issue in approver fetch, falling back");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('profiles')
            .select('id, full_name, role, created_at')
            .eq('role', 'pedagog')
            .order('full_name', { ascending: true });
          
          if (fallbackError) throw fallbackError;
          setTeachers(fallbackData?.map((p: any) => ({ ...p, status: 'active', email: '' })) || []);
        } else {
          throw error;
        }
      } else {
        setTeachers(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  const performLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleLogout = () => {
    setIsConfirmModalOpen(true);
  };

  const filteredTeachers = teachers.filter(teacher => 
    (teacher.full_name || '').toLowerCase().includes((teacherSearchQuery || '').toLowerCase())
  );

  return (
    <div className="max-w-full mx-auto py-8 px-4 mt-16 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight text-center md:text-left">Tasdiqlovchi paneli</h1>
          <p className="text-gray-500 mt-2 text-lg text-center md:text-left">O'qituvchilarning ishlari va hisobotlari bilan tanishish hamda tasdiqlash.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl self-center md:self-end">
          <button 
            onClick={() => setActiveView('teachers')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeView === 'teachers' || activeView === 'teacher_details'
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" /> O'qituvchilar
          </button>
          
          <div className="h-8 w-px bg-gray-200 mx-2 self-center" />
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> Tizimdan chiqish
          </button>
        </div>
      </div>

      {activeView === 'teachers' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col"
        >
          <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Professor-o'qituvchilar</h2>
              <p className="text-gray-500 mt-1">Tasdiqlash uchun o'qituvchini tanlang</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ism bo'yicha qidirish..."
                value={teacherSearchQuery}
                onChange={e => setTeacherSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm focus:shadow-md bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center text-gray-400">
                <Users className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">O'qituvchilar topilmadi</h3>
                <p>Qidiruv so'rovini o'zgartirib ko'ring yoki baza bo'shligini tekshiring.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-sm">
                    <th className="py-4 px-6 font-semibold w-12">#</th>
                    <th className="py-4 px-6 font-semibold">F.I.SH.</th>
                    <th className="py-4 px-6 font-semibold">Kafedra</th>
                    <th className="py-4 px-6 font-semibold hidden md:table-cell">Ro'yxatdan o'tgan</th>
                    <th className="py-4 px-6 font-semibold text-center w-24">Amal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher, idx) => (
                    <tr 
                      key={teacher.id} 
                      className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedTeacherProfile(teacher);
                        setActiveView('teacher_details');
                      }}
                    >
                      <td className="py-4 px-6 text-gray-500 font-medium">{idx + 1}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-700 font-bold shadow-sm">
                            {(teacher.full_name || 'F').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{teacher.full_name || 'Ismsiz foydalanuvchi'}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {teacher.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                          {teacher.department || 'Biriktirilmagan'}
                        </div>
                      </td>
                      <td className="py-4 px-6 hidden md:table-cell text-gray-500 text-sm">
                        {new Date(teacher.created_at).toLocaleDateString('uz-UZ')}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          className="p-2 bg-white border border-gray-200 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all shadow-sm"
                          title="Hujjatlarni ko'rish"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      ) : activeView === 'teacher_details' && selectedTeacherProfile ? (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="space-y-8"
        >
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveView('teachers')}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {selectedTeacherProfile.full_name}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {selectedTeacherProfile.email}</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> {selectedTeacherProfile.department || 'Kafedra biriktirilmagan'}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Qo'shilgan: {new Date(selectedTeacherProfile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8 space-y-16">
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
               <MethodicalWork adminUserId={selectedTeacherProfile.id} isTasdiqlovchi={true} />
            </div>

            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
               <ScientificWork adminUserId={selectedTeacherProfile.id} isTasdiqlovchi={true} />
            </div>

            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
               <MentorWork adminUserId={selectedTeacherProfile.id} isTasdiqlovchi={true} />
            </div>

            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
               <YearlyWork adminUserId={selectedTeacherProfile.id} isTasdiqlovchi={true} />
            </div>
          </div>
        </motion.div>
      ) : null}

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

