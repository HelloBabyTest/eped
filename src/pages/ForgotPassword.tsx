import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes('rate limit')) {
           throw new Error("Ko'p urinishlar qilindi. Iltimos, birozdan so'ng qayta urinib ko'ring.");
        }
        throw new Error("Xatolik yuz berdi. Email manzilingizni tekshirib qaytadan urinib ko'ring.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Parolni tiklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
               <Mail className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Parolni tiklash
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Ro'yxatdan o'tgan email manzilingizni kiriting va biz sizga parolni tiklash ssilkasini yuboramiz.
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
          {success ? (
            <div className="text-center space-y-6">
              <div className="rounded-xl bg-green-50 dark:bg-green-900/30 p-4 flex items-center justify-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                <p className="text-green-800 dark:text-green-300 font-medium">
                  Parolni tiklash so'rovi yuborildi!
                </p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Iltimos, <strong>{email}</strong> pochtangizni tekshiring va parolingizni yangilash uchun orqali havolaga o'ting. (Spam papkasiga tushgan bo'lishi ham mumkin)
              </p>
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                Kirish sahifasiga qaytish
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleResetPassword}>
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email manzilingiz
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Ssilka yuborish'
                  )}
                </button>
              </div>

              <div className="flex justify-center mt-6">
                <Link to="/login" className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Orqaga, kirish sahifasiga
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
