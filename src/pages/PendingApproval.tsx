import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { Clock, LogOut, ShieldCheck, Mail } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function PendingApproval() {
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const performLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleLogout = () => {
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100 text-center"
      >
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
          So'rovingiz kutilmoqda
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Sizning hisobingiz muvaffaqiyatli yaratildi. Xavfsizlik nuqtai nazaridan, administrator profilingizni tasdiqlashi kerak. 
          Tasdiqlangandan so'ng sizga platformaga to'liq kirish ruxsati beriladi.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-indigo-50 rounded-2xl flex items-start gap-3 text-left">
            <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-indigo-900">Keyingi qadam:</p>
              <p className="text-xs text-indigo-700">Administrator sizning ma'lumotlaringizni tekshiradi va 24 soat ichida faollashtiradi.</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl flex items-start gap-3 text-left">
            <Mail className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Aloqa:</p>
              <p className="text-xs text-emerald-700">Agar shoshilinch bo'lsa, kafedra mudiri yoki tizim administratoriga murojaat qiling.</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-10 flex items-center justify-center gap-2 w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all border border-gray-200"
        >
          <LogOut className="w-5 h-5" />
          Tizimdan chiqish
        </button>
      </motion.div>
      
      <p className="mt-8 text-gray-400 text-sm font-medium">
        © 2026 E-Pedagog Platformasi
      </p>

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
