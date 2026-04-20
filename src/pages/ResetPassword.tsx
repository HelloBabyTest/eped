import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Parolni yangilash sahifasiga kirilganda auth sessiyasi bor-yo'qligini tekshirish
    supabase.auth.getSession().then(({ data: { session } }) => {
      // hash access_token orqali refresh bo'lishini kutamiz (agar u email ssilka eksa)
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validatsiya
    if (password.length < 6) {
      setError("Parol kamida 6 belgidan iborat bo'lishi kerak.");
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Parollar bir-biriga mos kelmayapti.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw new Error("Parolni saqlashda xatolik yuz berdi. Balki ssilka eskirgandir.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Yangi parol o'rnatish
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Hisobingiz uchun yangi va mustahkam parol yarating.
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
          {success ? (
            <div className="text-center space-y-6">
              <div className="rounded-xl bg-green-50 dark:bg-green-900/30 p-4 flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mb-2">
                  <Lock className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <h3 className="text-lg font-medium text-green-900 dark:text-green-300">
                  Parolingiz muvaffaqiyatli saqlandi!
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Endi yangi parolingiz bilan tizimga kirishingiz mumkin.
              </p>
              <Link
                to="/login"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
              >
                Kirish sahifasiga o'tish <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleUpdatePassword}>
              {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/30 p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Yangi parol
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Parolni takrorlang
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                    placeholder="••••••••"
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
                    'Parolni saqlash'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
