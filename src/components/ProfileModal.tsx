import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Mail, Building, GraduationCap, Briefcase, Info, CheckCircle2, LogOut, Laptop } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ConfirmModal from './ConfirmModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [userRole, setUserRole] = useState<string>('pedagog');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (isOpen) {
      const fetchProfile = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
          if (data) {
            setUserRole(data.role);

            // Fetch actual email or set based on role
            let newEmail = user.email || 'otabekyoqubovich@gmail.com';
            if (data.role === 'tasdiqlovchi') newEmail = 'approv@gmail.com';
            if (data.role === 'tahrirlovchi') newEmail = 'editor@gmail.com';

            setEditableData(prev => ({ ...prev, email: newEmail }));
            setLocalEditable(prev => ({ ...prev, email: newEmail }));
          }
        }
        setLoading(false);
      };
      fetchProfile();
    }
  }, [isOpen]);

  // Erkin tahrirlanadigan maydonlar (shaxsiy ma'lumotlar)
  const [editableData, setEditableData] = useState({
    email: 'otabekyoqubovich@gmail.com',
    phone: '+998 90 123 45 67',
    bio: "Ta'lim jarayonlarini raqamlashtirish bo'yicha mutaxassis"
  });

  // Admin tasdiqlashi kerak bo'lgan maydonlar
  const [adminData, setAdminData] = useState({
    fullName: 'Otabek Choriyev',
    position: "Katta o'qituvchi",
    department: "Raqamli ta'lim texnologiyalari kafedrasi",
    academicDegree: 'PhD'
  });

  const [localEditable, setLocalEditable] = useState(editableData);
  const [localAdmin, setLocalAdmin] = useState(adminData);
  const [requestSent, setRequestSent] = useState(false);
  const navigate = useNavigate();

  // Close & reset
  const handleClose = () => {
    setLocalEditable(editableData);
    setLocalAdmin(adminData);
    setRequestSent(false);
    onClose();
  };

  const handleSave = () => {
    const isAdminChanged = Object.keys(adminData).some(
      (key) => adminData[key as keyof typeof adminData] !== localAdmin[key as keyof typeof localAdmin]
    );

    // Save strictly editable data locally
    setEditableData(localEditable);

    if (isAdminChanged) {
      alert("Asosiy ma'lumotlarni o'zgartirish bo'yicha adminga so'rov yuborildi! (Demo)");
      setRequestSent(true);
      // We don't save adminData to simulate pending state
    } else {
      alert("Ma'lumotlar saqlandi!");
      onClose();
    }
  };

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [mockSessions, setMockSessions] = useState([
    {id: 1, name: 'Windows • Chrome', details: "Toshkent, O'zbekiston • 2 soat oldin"}
  ]);
  
  const performLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleLogout = () => {
    setIsConfirmModalOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="profile-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-[70] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" /> Profil ma'lumotlari
              </h2>
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto w-full flex-1">

              {requestSent && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-800">So'rov yuborildi</h3>
                    <p className="text-sm text-amber-700 mt-1">Asosiy ma'lumotlarni o'zgartirish so'rovingiz ko'rib chiqish uchun adminga yuborildi. U tasdiqlangandan so'ng o'zgaradi.</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                
                {/* Asosiy Ma'lumotlar */}
                {userRole === 'pedagog' ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Asosiy ma'lumotlar</h3>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Info className="w-3 h-3" /> Admin ruxsati bilan
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> F.I.Sh
                        </label>
                        <input 
                          type="text" 
                          value={localAdmin.fullName} 
                          onChange={e => setLocalAdmin({...localAdmin, fullName: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" /> Lavozimi
                        </label>
                        <input 
                          type="text" 
                          value={localAdmin.position} 
                          onChange={e => setLocalAdmin({...localAdmin, position: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" /> Kafedrasi
                        </label>
                        <input 
                          type="text" 
                          value={localAdmin.department} 
                          onChange={e => setLocalAdmin({...localAdmin, department: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" /> Ilmiy darajasi
                        </label>
                        <input 
                          type="text" 
                          value={localAdmin.academicDegree} 
                          onChange={e => setLocalAdmin({...localAdmin, academicDegree: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Asosiy ma'lumotlar</h3>
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Erkin tahrirlanadi
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> F.I.Sh
                        </label>
                        <input 
                          type="text" 
                          value={localAdmin.fullName} 
                          onChange={e => setLocalAdmin({...localAdmin, fullName: e.target.value})}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" /> Rol
                        </label>
                        <input 
                          type="text" 
                          value={userRole.charAt(0).toUpperCase() + userRole.slice(1)} 
                          disabled
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-600 cursor-not-allowed outline-none transition-all"
                        />
                      </div>
                      {userRole === 'admin' && (
                        <div className="space-y-1.5 col-span-1 md:col-span-2 mt-2">
                           <div className="p-3 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-lg flex items-center gap-2">
                             <Info className="w-4 h-4" />
                             Sizda tizimni to'liq boshqarish huquqi mavjud.
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Free Editable Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                   <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Shaxsiy & Aloqa ma'lumotlari</h3>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Erkin tahrirlanadi
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> E-pochta
                      </label>
                      <input 
                        type="email" 
                        value={localEditable.email} 
                        onChange={e => setLocalEditable({...localEditable, email: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> Telefon raqami
                      </label>
                      <input 
                        type="text" 
                        value={localEditable.phone} 
                        onChange={e => setLocalEditable({...localEditable, phone: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      Qisqacha ma'lumot (Bio)
                    </label>
                    <textarea 
                      rows={3}
                      value={localEditable.bio} 
                      onChange={e => setLocalEditable({...localEditable, bio: e.target.value})}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all resize-none"
                    />
                  </div>

                </div>

                {/* Devices & Sessions Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                   <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Qurilmalar va Sessiyalar</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-100 rounded-lg mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                          <Laptop className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">Joriy qurilma</div>
                          <div className="text-xs text-gray-500">
                            {(() => {
                              const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
                              const browser = ua.includes('Chrome') ? 'Chrome' : ua.includes('Firefox') ? 'Firefox' : ua.includes('Safari') ? 'Safari' : 'Browser';
                              const os = ua.includes('Windows') ? 'Windows' : ua.includes('Mac') ? 'MacOS' : ua.includes('Linux') ? 'Linux' : 'Qurilma';
                              return `${os} • ${browser}`;
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-indigo-600 px-2 py-1 bg-indigo-100 rounded-md">
                        Faol
                      </div>
                    </div>

                    {mockSessions.map(session => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-red-100 group transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                            <Laptop className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{session.name}</div>
                            <div className="text-xs text-gray-500">
                              {session.details}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setMockSessions(prev => prev.filter(s => s.id !== session.id))}
                          className="px-2 py-1 text-xs font-semibold text-red-600 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded transition-all"
                        >
                          Tugatish
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Boshqa qurilmalardagi sessiyalarni yopish
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await supabase.auth.signOut({ scope: 'others' });
                            alert("Boshqa barcha qurilmalardan chiqildi.");
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Barchasini tugatish
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <button 
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Chiqish
              </button>
              <div className="flex gap-3">
                <button 
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Bekor qilish
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  O'zgarishlarni saqlash
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={performLogout}
        title="Tizimdan chiqish"
        message="Haqiqatan ham tizimdan chiqmoqchimisiz?"
      />
    </>
  );
}
