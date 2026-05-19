import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { BookOpen, Mail, Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setLoading(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        switch (profile?.role) {
          case 'admin':
            navigate('/dashboard/admin');
            break;
          case 'rahbariyat':
            navigate('/dashboard/rahbariyat');
            break;
          case 'tahrirlovchi':
            navigate('/dashboard/tahrirlovchi');
            break;
          case 'tasdiqlovchi':
            navigate('/dashboard/tasdiqlovchi');
            break;
          default:
            navigate('/dashboard/pedagog');
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Fetch user profile to get role and status
        let profileData: any = null;
        let profileError: any = null;

        // Birinchi navbatda hamma ustunlarni olishga harakat qilamiz
        const { data: profile, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        
        profileData = profile;
        profileError = err;

        // Agar email yoki status ustuni tufayli xatolik bo'lsa, fallback
        if (profileError && (profileError.message.includes('email') || profileError.message.includes('status'))) {
          console.warn("Email or Status column issue, falling back to role only");
          const { data: fallbackProfile, error: fallbackError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();
          
          if (!fallbackError) {
            profileData = { ...fallbackProfile, status: 'active', email: data.user.email };
            profileError = null;
          }
        }

        if (profileError) throw profileError;

        let currentProfile = profileData;
        
        // Handle legacy users without status
        if (currentProfile && !currentProfile.status) {
          currentProfile.status = 'active';
        }

        // NEW: Check if profile doesn't exist and try to create it
        if (!currentProfile) {
          console.log("Profile not found, creating one from metadata...");
          
          // Small delay to allow trigger to catch up
          await new Promise(resolve => setTimeout(resolve, 800));
          
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
          
          if (retryProfile) {
            currentProfile = retryProfile;
          } else {
            // Sanitize role to ensure it matches check constraint
            let metaRole = data.user.user_metadata?.role || 'pedagog';
            const allowedRoles = ['pedagog', 'rahbariyat', 'admin', 'tahrirlovchi', 'tasdiqlovchi'];
            if (!allowedRoles.includes(metaRole)) {
              metaRole = 'pedagog';
            }

            const profilePayload: any = { 
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || 'Foydalanuvchi',
              role: metaRole
            };

            // Only add email if we think the column exists
            if (data.user.email) {
              profilePayload.email = data.user.email;
            }

            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(profilePayload)
              .select('id, full_name, role, status')
              .single();

            if (insertError) {
               console.error("Profile creation error at login:", insertError);
               
               // If email column is missing or causing error, try without it
               if (insertError.message.includes('role_check')) {
                 setError("Bazadagi rollar ro'yxati eskirtgan. Iltimos, Supabase SQL Editor'da 'supabase_setup.sql' faylidagi barcha kodlarni qaytadan ishga tushiring.");
                 setLoading(false);
                 return;
               } else if (insertError.message.includes('email')) {
                 const { data: retryNew, error: retryErr } = await supabase
                   .from('profiles')
                   .insert({
                     id: data.user.id,
                     full_name: data.user.user_metadata?.full_name || 'Foydalanuvchi',
                     role: metaRole
                   })
                   .select('id, full_name, role, status')
                   .single();
                 
                 if (!retryErr) {
                   currentProfile = retryNew;
                 } else {
                   if (retryErr.message.includes('role_check')) {
                     setError("Bazadagi rollar ro'yxati eskirtgan. Iltimos, Supabase SQL Editor'da 'supabase_setup.sql' faylidagi barcha kodlarni qaytadan ishga tushiring.");
                   } else {
                     setError("Profilingizni tiklashda xatolik yuz berdi: " + retryErr.message);
                   }
                   setLoading(false);
                   return;
                 }
               } else if (insertError.code === '23505') {
                 const { data: finalProfile } = await supabase
                   .from('profiles')
                   .select('*')
                   .eq('id', data.user.id)
                   .single();
                 currentProfile = finalProfile;
               } else if (insertError.code === '42501') {
                 setError("Profil yaratish uchun bazada ruxsat yo'q (RLS error). Iltimos, Supabase'da 'profiles' jadvali ruxsatlarini tekshiring.");
                 setLoading(false);
                 return;
               } else {
                 setError("Profilingizni tiklashda xatolik yuz berdi: " + insertError.message);
                 setLoading(false);
                 return;
               }
            } else {
              currentProfile = newProfile;
            }
          }
        }

        // Check for pending status
        if (currentProfile?.status === 'pending' && currentProfile?.role !== 'admin' && currentProfile?.role !== 'rahbariyat') {
          navigate('/pending-approval');
          return;
        }

        if (currentProfile?.status === 'rejected') {
          setError("Sizning ro'yxatdan o'tish so'rovingiz rad etilgan. Batafsil ma'lumot uchun admin bilan bog'laning.");
          setLoading(false);
          await supabase.auth.signOut();
          return;
        }

        // Redirect based on role
        switch (currentProfile?.role) {
          case 'pedagog':
            navigate('/dashboard/pedagog');
            break;
          case 'rahbariyat':
            navigate('/dashboard/rahbariyat');
            break;
          case 'tahrirlovchi':
            navigate('/dashboard/tahrirlovchi');
            break;
          case 'tasdiqlovchi':
            navigate('/dashboard/tasdiqlovchi');
            break;
          case 'admin':
            navigate('/dashboard/admin');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.message || "Kirishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 mb-6">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-bold text-gray-900">E-Pedagog</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Tizimga kirish
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Yoki{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            yangi hisob oching
          </Link>
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Parol
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Eslab qolish
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Parolni unutdingizmi?
                </a>
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
                  'Kirish'
                )}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">quyidagi tizimlar orqali kirish</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div>
                  <button
                    type="button"
                    onClick={() => alert("ERI orqali kirish (Demo)")}
                    className="w-full inline-flex justify-center flex-col items-center py-2 px-2 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-colors h-[60px]"
                  >
                    <span className="sr-only">ERI bilan kirish</span>
                    <img src="https://e-imzo.soliq.uz/img/logo.png" alt="ERI" className="h-6 object-contain mb-1" />
                    <span className="text-[10px] font-medium text-gray-600">ERI</span>
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => alert("Mobile-ID orqali kirish (Demo)")}
                    className="w-full inline-flex justify-center flex-col items-center py-2 px-2 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-colors h-[60px]"
                  >
                    <span className="sr-only">Mobile-ID bilan kirish</span>
                    <svg className="w-6 h-6 text-blue-600 mb-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                    </svg>
                    <span className="text-[10px] font-medium text-gray-600">Mobile-ID</span>
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => alert("MyID orqali kirish (Demo)")}
                    className="w-full inline-flex justify-center flex-col items-center py-2 px-2 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-colors h-[60px]"
                  >
                    <span className="sr-only">MyID bilan kirish</span>
                    <img src="https://assets.my.gov.uz/assets/mygov/_app/ac160c1d/myIDLogo.BuTvQ_Vz.svg" alt="MyID" className="h-6 object-contain mb-1" />
                    <span className="text-[10px] font-medium text-gray-600">MyID</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}