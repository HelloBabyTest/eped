import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trash2, Download, Eye, FileText, User, Shield, Search, Printer, MenuSquare } from 'lucide-react';
import AcademicWork from './AcademicWork';
import MethodicalWork from './MethodicalWork';
import ScientificWork from './ScientificWork';
import MentorWork from './MentorWork';

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  email: string;
  created_at: string;
  is_approved?: boolean;
}

interface UserFile {
  id: string;
  user_id: string;
  title: string;
  file_name: string;
  file_url: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userFiles, setUserFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'files'|'academic'|'methodical'|'scientific'|'mentor'>('files');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // We use the RPC function created in the SQL setup
      const { data, error } = await supabase.rpc('get_all_users_for_admin');
      
      if (error) {
        // Fallback if RPC is not available (e.g., SQL not run yet)
        console.error('RPC error, falling back to profiles table:', error);
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) throw profilesError;
        setUsers(profilesData as any || []);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Foydalanuvchilarni yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserFiles = async (userId: string) => {
    try {
      setFilesLoading(true);
      const { data, error } = await supabase
        .from('personal_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserFiles(data || []);
    } catch (error) {
      console.error('Error fetching user files:', error);
      alert('Foydalanuvchi fayllarini yuklashda xatolik yuz berdi.');
    } finally {
      setFilesLoading(false);
    }
  };

  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    fetchUserFiles(user.id);
  };

  const handleDeleteFile = async (fileId: string, fileName: string, userId: string) => {
    if (!window.confirm('Rostdan ham bu faylni o\'chirmoqchimisiz?')) return;

    try {
      // Delete from storage
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from('teacher_files')
          .remove([`${userId}/${fileName}`]);
        
        if (storageError) {
          console.error('Storage delete error:', storageError);
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('personal_notes')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      // Refresh files list
      setUserFiles(userFiles.filter(f => f.id !== fileId));
      alert('Fayl muvaffaqiyatli o\'chirildi.');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Faylni o\'chirishda xatolik yuz berdi.');
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: true })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, is_approved: true } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, is_approved: true });
      }
      alert('Foydalanuvchi muvaffaqiyatli tasdiqlandi.');
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Foydalanuvchini tasdiqlashda xatolik yuz berdi.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Rostdan ham bu foydalanuvchini va uning barcha ma\'lumotlarini o\'chirmoqchimisiz? Bu amalni ortga qaytarib bo\'lmaydi!')) return;

    try {
      // In Supabase, deleting a user from auth.users requires service_role key or an edge function.
      // Since we are using the client key, we can only delete their profile if RLS allows, 
      // but deleting from auth.users is restricted.
      // We will try to delete their profile, which might cascade if set up, or we just alert the admin.
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(u => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setUserFiles([]);
      }
      alert('Foydalanuvchi profili o\'chirildi. (Eslatma: To\'liq o\'chirish uchun Supabase Dashboard dan foydalaning)');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Foydalanuvchini o\'chirishda xatolik yuz berdi. Ehtimol, sizda yetarli huquq yo\'q.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Paneli</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Foydalanuvchilar va ularning fayllarini boshqarish</p>
        </div>
        <div className="print-hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Chop qilish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Users List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[800px]">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Foydalanuvchilar ({filteredUsers.length})
            </h2>
            <div className="mt-4 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Foydalanuvchilar topilmadi
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors border ${
                      selectedUser?.id === user.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                        : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{user.full_name || 'Ismi kiritilmagan'}</h3>
                        <p className="text-sm text-gray-500">{user.email || 'Email mavjud emas'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'rahbariyat' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                        {user.role !== 'admin' && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${user.is_approved ? 'text-green-500' : 'text-orange-500'}`}>
                            {user.is_approved ? 'Tasdiqlangan' : 'Kutilmoqda'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Details & Files */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-[800px]">
          {selectedUser ? (
            <>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.full_name}</h2>
                  <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p><span className="font-medium text-gray-900 dark:text-gray-300">Email:</span> {selectedUser.email}</p>
                    <p><span className="font-medium text-gray-900 dark:text-gray-300">ID:</span> {selectedUser.id}</p>
                    <p><span className="font-medium text-gray-900 dark:text-gray-300">Rol:</span> {selectedUser.role}</p>
                    {selectedUser.created_at && (
                      <p><span className="font-medium text-gray-900 dark:text-gray-300">Ro'yxatdan o'tgan sana:</span> {new Date(selectedUser.created_at).toLocaleDateString('uz-UZ')}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {!selectedUser.is_approved && selectedUser.role !== 'admin' && (
                    <button
                      onClick={() => handleApproveUser(selectedUser.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Tasdiqlash
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Profilni o'chirish
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <nav className="flex overflow-x-auto space-x-4 px-6 hide-scrollbar">
                  {[
                    { id: 'files', label: "Fayllar" },
                    { id: 'academic', label: "O'quv ishlari" },
                    { id: 'methodical', label: "Uslubiy ishlar" },
                    { id: 'scientific', label: "Ilmiy ishlari" },
                    { id: 'mentor', label: "Ustoz-shogird" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                {activeTab === 'files' && (
                  <>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Foydalanuvchi fayllari va eslatmalari
                    </h3>

                    {filesLoading ? (
                      <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : userFiles.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Bu foydalanuvchida hozircha fayllar yo'q.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userFiles.map((file) => (
                          <div key={file.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2" title={file.title}>
                                {file.title}
                              </h4>
                              <button
                                onClick={() => handleDeleteFile(file.id, file.file_name, file.user_id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="O'chirish"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            {file.file_name && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                <FileText className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate" title={file.file_name}>{file.file_name}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(file.created_at).toLocaleDateString('uz-UZ')}
                              </span>
                              {file.file_url && (
                                <div className="flex gap-2">
                                  <a
                                    href={file.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Ko'rish
                                  </a>
                                  <a
                                    href={`${file.file_url}?download=`}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                                  >
                                    <Download className="w-4 h-4" />
                                    Yuklash
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
                {activeTab === 'academic' && <AcademicWork targetUserId={selectedUser.id} />}
                {activeTab === 'methodical' && <MethodicalWork targetUserId={selectedUser.id} />}
                {activeTab === 'scientific' && <ScientificWork targetUserId={selectedUser.id} />}
                {activeTab === 'mentor' && <MentorWork targetUserId={selectedUser.id} />}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <Shield className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-lg">Foydalanuvchi ma'lumotlarini ko'rish uchun</p>
              <p>ro'yxatdan birortasini tanlang</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
