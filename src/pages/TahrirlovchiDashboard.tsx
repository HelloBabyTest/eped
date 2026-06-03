import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { 
  FileEdit, Search, CheckCircle2, Clock, 
  AlertCircle, Filter, FileText, ChevronRight,
  Pencil, Save, X, Eye, Users, User, LogOut
} from 'lucide-react';

import AcademicWork from './AcademicWork';
import MethodicalWork from './MethodicalWork';
import ScientificWork from './ScientificWork';
import MentorWork from './MentorWork';
import YearlyWork from './YearlyWork';
import Norms from './Norms';
import PersonalNotes from './PersonalNotes';
import ConfirmModal from '../components/ConfirmModal';

type Profile = {
  id: string;
  full_name: string;
  role: string;
  status: 'pending' | 'active' | 'rejected';
};

interface DataCell {
  id: string;
  field: string;
  value: string;
  isEditable: boolean;
}

interface EditTask {
  id: string;
  type: string;
  title: string;
  author: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed';
  cells: DataCell[];
}

const mockTasks: EditTask[] = [
  {
    id: 'TSK-001',
    type: 'Ilmiy maqola',
    title: 'Sun\'iy intellektning ta\'limdagi o\'rni',
    author: 'Azizov Olim',
    date: '2026-05-01',
    status: 'pending',
    cells: [
      { id: 'c1', field: 'Annotatsiya', value: 'Sun\'iy intellekt ta\'lim sohasida inqilobiy o\'zgarishlar qilmoqda...', isEditable: true },
      { id: 'c2', field: 'Kalit so\'zlar', value: 'AI, Ta\'lim, Innovatsiya', isEditable: true },
      { id: 'c3', field: 'Chop etilgan yil', value: '2026', isEditable: false },
      { id: 'c4', field: 'DOI silka', value: 'https://doi.org/10.1234/ai.2026', isEditable: false },
    ]
  },
  {
    id: 'TSK-002',
    type: 'Uslubiy qo\'llanma',
    title: 'Dasturlash asoslari (1-qism)',
    author: 'Rasulov Bobur',
    date: '2026-05-02',
    status: 'in_progress',
    cells: [
      { id: 'c1', field: 'Bo\'limlar soni', value: '12 ta', isEditable: false },
      { id: 'c2', field: 'Asosiy mazmun', value: 'Dasturlash asoslari kursi bo\'yicha birinchi darslik qoralamasi.', isEditable: true },
      { id: 'c3', field: 'Adabiyotlar', value: 'C++, Clean Code, Design Patterns', isEditable: true },
    ]
  }
];

export default function TahrirlovchiDashboard() {
  const [tasks, setTasks] = useState<EditTask[]>(mockTasks);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [activeView, setActiveView] = useState<'tasks' | 'teachers' | 'teacher_details' | 'groups' | 'distribution'>('tasks');
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState<Profile | null>(null);
  const [teacherFilter, setTeacherFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<EditTask | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [editingRights, setEditingRights] = useState<Record<string, boolean>>({});
  
  // Groups Management State
  const [globalGroups, setGlobalGroups] = useState<{id: string, name: string}[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [teacherGroups, setTeacherGroups] = useState<Record<string, string[]>>({}); // teacherId -> groupIds
  
  const navigate = useNavigate();

  useEffect(() => {
    const loadedGroups = localStorage.getItem('global_groups');
    if (loadedGroups) {
      try { setGlobalGroups(JSON.parse(loadedGroups)); } catch (e) {}
    }
  }, []);

  const addGlobalGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup = { id: Date.now().toString(), name: newGroupName.trim() };
    const updated = [...globalGroups, newGroup];
    setGlobalGroups(updated);
    localStorage.setItem('global_groups', JSON.stringify(updated));
    setNewGroupName('');
  };

  const removeGlobalGroup = (id: string) => {
    const updated = globalGroups.filter(g => g.id !== id);
    setGlobalGroups(updated);
    localStorage.setItem('global_groups', JSON.stringify(updated));
  };

  // Load teacher groups when opening profile
  useEffect(() => {
    if (activeView === 'teacher_details' && selectedTeacherProfile) {
      const tgJson = localStorage.getItem('teacher_groups_' + selectedTeacherProfile.id);
      if (tgJson) {
        try {
          const assignedObjs = JSON.parse(tgJson) as {id: string}[];
          setTeacherGroups(prev => ({
            ...prev,
            [selectedTeacherProfile.id]: assignedObjs.map(g => g.id)
          }));
        } catch (e) {}
      } else {
        setTeacherGroups(prev => ({ ...prev, [selectedTeacherProfile.id]: [] }));
      }
    }
  }, [activeView, selectedTeacherProfile]);

  const [teacherSearchQuery, setTeacherSearchQuery] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const toggleTeacherGroup = (teacherId: string, groupId: string) => {
    setTeacherGroups(prev => {
      const current = prev[teacherId] || [];
      const updated = current.includes(groupId) 
        ? current.filter(id => id !== groupId)
        : [...current, groupId];
      
      const newAssignedObjs = globalGroups.filter(g => updated.includes(g.id));
      localStorage.setItem('teacher_groups_' + teacherId, JSON.stringify(newAssignedObjs));
      
      
      return { ...prev, [teacherId]: updated };
    });
  };

  const performLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleLogout = () => {
    setIsConfirmModalOpen(true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.title || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
                         (task.author || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    const matchesTeacher = teacherFilter ? task.author === teacherFilter : true;
    return matchesSearch && matchesTeacher;
  });

  const filteredTeachers = teachers.filter(teacher => 
    (teacher.full_name || '').toLowerCase().includes((teacherSearchQuery || '').toLowerCase())
  );

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
          console.warn("Email or Status column issue in editor fetch, falling back");
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .eq('role', 'pedagog')
            .order('full_name', { ascending: true });
          
          if (fallbackError) throw fallbackError;
          setTeachers(fallbackData?.map((p: any) => ({ ...p, status: 'active' })) || []);
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
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  const startEdit = (task: EditTask) => {
    setSelectedTask(task);
    const initialEditingValues: Record<string, string> = {};
    const initialEditingRights: Record<string, boolean> = {};
    task.cells.forEach(cell => {
      initialEditingValues[cell.id] = cell.value;
      initialEditingRights[cell.id] = cell.isEditable;
    });
    setEditingValues(initialEditingValues);
    setEditingRights(initialEditingRights);
    setEditMode(true);
  };

  const saveEdit = () => {
    if (selectedTask) {
      setTasks(tasks.map(t => 
        t.id === selectedTask.id 
          ? { 
              ...t, 
              cells: t.cells.map(cell => ({
                ...cell,
                value: editingValues[cell.id] !== undefined ? editingValues[cell.id] : cell.value,
                isEditable: editingRights[cell.id] !== undefined ? editingRights[cell.id] : cell.isEditable
              })),
              status: 'completed' 
            } 
          : t
      ));
      setEditMode(false);
      setSelectedTask(null);
    }
  };

  const updateCellValue = (id: string, value: string) => {
    setEditingValues(prev => ({ ...prev, [id]: value }));
  };

  const toggleCellRight = (id: string) => {
    setEditingRights(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-full mx-auto py-8 px-4 mt-16 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight text-center md:text-left">Tahrirlovchi paneli</h1>
          <p className="text-gray-500 mt-2 text-lg text-center md:text-left">Tizimdagi barcha materiallarni yacheykayma-yacheyka tahrirlash.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl self-center md:self-end">
          <button 
            onClick={() => setActiveView('tasks')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeView === 'tasks' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" /> Hujjatlar
          </button>
          <button 
            onClick={() => setActiveView('teachers')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeView === 'teachers' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" /> O'qituvchilar
          </button>
          <button 
            onClick={() => setActiveView('groups')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeView === 'groups' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4" /> Guruhlar
          </button>
          <button 
            onClick={() => setActiveView('distribution')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeView === 'distribution' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" /> Taqsimot (O'quv ishlari)
          </button>
          
          <div className="h-8 w-px bg-gray-200 mx-2 self-center" />
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" /> Chiqish
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center opacity-50"><FileEdit className="w-10 h-10 text-gray-300" /></div>
          <p className="text-gray-500 font-medium text-sm">Jami hujjatlar</p>
          <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.total}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center opacity-50"><AlertCircle className="w-10 h-10 text-rose-300" /></div>
          <p className="text-gray-500 font-medium text-sm">Yangi (Kutilayotgan)</p>
          <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.pending}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center opacity-50"><Clock className="w-10 h-10 text-amber-300" /></div>
          <p className="text-gray-500 font-medium text-sm">Jarayonda</p>
          <h3 className="text-3xl font-black text-gray-900 mt-2">{stats.inProgress}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center"><CheckCircle2 className="w-10 h-10 text-white/20" /></div>
          <p className="text-indigo-100 font-medium text-sm z-10 relative">Tahrirlangan</p>
          <h3 className="text-3xl font-black mt-2 z-10 relative">{stats.completed}</h3>
        </motion.div>
      </div>

      {activeView === 'tasks' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task List */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-1 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[700px]">
            <div className="p-5 border-b border-gray-100 flex flex-col gap-3">
               {teacherFilter && (
                 <div className="flex items-center justify-between bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-700">{teacherFilter}</span>
                    </div>
                    <button 
                      onClick={() => setTeacherFilter(null)}
                      className="p-1 hover:bg-indigo-100 rounded-md text-indigo-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                 </div>
               )}
               <div className="flex gap-2">
                 <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input
                     type="text"
                     placeholder="Id, sarlavha..."
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                   />
                 </div>
                 <button className="p-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 transition-colors">
                   <Filter className="w-4 h-4" />
                 </button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
               {filteredTasks.map(task => (
                 <div 
                   key={task.id} 
                   onClick={() => !editMode && setSelectedTask(task)}
                   className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                     selectedTask?.id === task.id ? 'border-indigo-500 shadow-md bg-indigo-50/30' : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                   }`}
                 >
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold text-gray-400">{task.id}</span>
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                       task.status === 'pending' ? 'bg-rose-100 text-rose-700' :
                       task.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                       'bg-emerald-100 text-emerald-700'
                     }`}>
                       {task.status === 'pending' ? 'Yangi' : task.status === 'in_progress' ? 'Jarayonda' : 'Tugallangan'}
                     </span>
                   </div>
                   <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{task.title}</h4>
                   <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                     <span>{task.author}</span>
                     <span>{task.date}</span>
                   </div>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Edit Workspace */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[500px]">
            {selectedTask ? (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">{selectedTask.type}</span>
                      <span className="text-xs text-gray-500">{selectedTask.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight">{selectedTask.title}</h3>
                  </div>
                  {!editMode ? (
                    <button 
                      onClick={() => startEdit(selectedTask)}
                      className="flex items-center gap-2 bg-white text-indigo-600 border border-indigo-200 px-4 py-2 text-sm font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-sm shrink-0 ml-4"
                    >
                      <Pencil className="w-4 h-4" /> Tahrirlash
                    </button>
                  ) : (
                    <div className="flex gap-2 shrink-0 ml-4">
                      <button 
                        onClick={() => setEditMode(false)}
                        className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 px-3 py-2 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        <X className="w-4 h-4" /> Bekor
                      </button>
                      <button 
                        onClick={saveEdit}
                        className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        <Save className="w-4 h-4" /> Saqlash
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex-1 bg-gray-50/30 overflow-y-auto">
                  <div className="space-y-4">
                    {selectedTask.cells.map(cell => {
                      const isCellEditable = editMode ? editingRights[cell.id] : cell.isEditable;
                      
                      return (
                        <div 
                          key={cell.id} 
                          className={`relative p-5 rounded-2xl border transition-all ${
                            editMode 
                              ? isCellEditable 
                                ? 'bg-white border-indigo-200 ring-2 ring-indigo-50 shadow-sm' 
                                : 'bg-white border-gray-200 shadow-sm opacity-90'
                              : cell.isEditable
                                ? 'bg-white border-indigo-50 shadow-sm'
                                : 'bg-gray-50/50 border-gray-100 opacity-80'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{cell.field}</span>
                            
                            <div className="flex items-center gap-2">
                              {editMode ? (
                                <button
                                  onClick={() => toggleCellRight(cell.id)}
                                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                                    isCellEditable
                                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-100 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {isCellEditable ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3" /> O'qituvchi o'zgartira oladi
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3" /> O'qituvchi o'zgartira olmaydi
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                  cell.isEditable 
                                    ? 'bg-emerald-50 text-emerald-600' 
                                    : 'bg-gray-100 text-gray-400'
                                }`}>
                                  {cell.isEditable ? "Tahrirlash mumkin" : "Faqat o'qish"}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {editMode ? (
                            <textarea
                              value={editingValues[cell.id] || ''}
                              onChange={(e) => updateCellValue(cell.id, e.target.value)}
                              className="w-full bg-transparent text-gray-800 font-medium focus:outline-none resize-none min-h-[60px]"
                              placeholder="Ma'lumot yo'q..."
                            />
                          ) : (
                            <p className={`text-gray-700 font-medium ${!cell.isEditable ? 'italic text-gray-400' : ''}`}>
                              {cell.value}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
                 <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                   <FileEdit className="w-10 h-10 text-gray-300" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">Hujjat tanlanmagan</h3>
                 <p className="text-gray-500 max-w-sm">Tahrirlash uchun chap tomondagi ro'yxatdan hujjat tanlang.</p>
              </div>
            )}
          </motion.div>
        </div>
      ) : activeView === 'teachers' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <h2 className="text-xl font-bold text-gray-900">O'qituvchilar profillari</h2>
             <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                   type="text"
                   placeholder="Ism bo'yicha qidirish..."
                   value={teacherSearchQuery}
                   onChange={e => setTeacherSearchQuery(e.target.value)}
                   className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                />
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Foydalanuvchi</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Lavozimi</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-gray-400">Yuklanmoqda...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                      O'qituvchilar topilmadi
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                            {(teacher.full_name || 'F').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{teacher.full_name || 'Ismsiz foydalanuvchi'}</p>
                            <p className="text-xs text-gray-500">ID: {teacher.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wide">
                          {teacher.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedTeacherProfile(teacher);
                            setActiveView('teacher_details');
                          }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-indigo-100 rounded-xl transition-all"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-center pb-8">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white text-rose-600 border border-rose-200 px-8 py-3 rounded-2xl text-sm font-bold hover:bg-rose-50 transition-all shadow-sm hover:shadow-md hover:border-rose-300"
            >
              <LogOut className="w-4 h-4" /> Tizimdan chiqish
            </button>
          </div>
        </motion.div>
      ) : activeView === 'teacher_details' && selectedTeacherProfile ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-8"
        >
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedTeacherProfile.full_name} faoliyati</h2>
              <p className="text-gray-500 mt-1">ID: {selectedTeacherProfile.id}</p>
            </div>
            <button 
              onClick={() => setActiveView('teachers')}
              className="flex items-center gap-2 bg-gray-50 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Ortga qaytish
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> Guruhlarni biriktirish
            </h3>
            {globalGroups.length === 0 ? (
              <p className="text-gray-500 italic">Avval tizimga guruhlar qo'shing (Guruhlar bo'limidan).</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {globalGroups.map(group => {
                  const isAssigned = teacherGroups[selectedTeacherProfile.id]?.includes(group.id);
                  return (
                    <button
                      key={group.id}
                      onClick={() => toggleTeacherGroup(selectedTeacherProfile.id, group.id)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all border ${
                        isAssigned 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {group.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8 space-y-16">
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
               <AcademicWork adminUserId={selectedTeacherProfile.id} />
            </div>
            
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
               <MethodicalWork adminUserId={selectedTeacherProfile.id} />
            </div>
            
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
               <ScientificWork adminUserId={selectedTeacherProfile.id} />
            </div>
            
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
               <MentorWork adminUserId={selectedTeacherProfile.id} />
            </div>
            
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
               <YearlyWork adminUserId={selectedTeacherProfile.id} />
            </div>
            
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
               <Norms adminUserId={selectedTeacherProfile.id} />
            </div>
            
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
               <PersonalNotes adminUserId={selectedTeacherProfile.id} />
            </div>
          </div>
        </motion.div>
      ) : activeView === 'groups' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Guruhlar ro'yxati</h2>
              <p className="text-gray-500 mt-1">Tizimdagi barcha guruhlarni boshqarish</p>
            </div>
          </div>

          <div className="flex gap-3 mb-8">
            <input 
              type="text" 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Yangi guruh nomi (masalan: 101-guruh)"
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none w-full max-w-sm font-medium"
            />
            <button 
              onClick={addGlobalGroup}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Qo'shish
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6">
            {globalGroups.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Guruhlar mavjud emas.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {globalGroups.map(group => (
                  <div key={group.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                    <span className="font-bold text-gray-900">{group.name}</span>
                    <button 
                      onClick={() => removeGlobalGroup(group.id)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      title="Guruhni o'chirish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ) : activeView === 'distribution' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">O'quv ishlari majmuasi va Taqsimot</h2>
              <p className="text-gray-500 mt-1">Ushbu jadval orqali darslarni ro'yxatdan o'tgan o'qituvchilarga biriktirishingiz mumkin.</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30">
            <AcademicWork isDistributor={true} adminUserId={undefined} />
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
