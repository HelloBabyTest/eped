import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { BookOpen, Mail, Lock, Loader2, AlertCircle, ShieldCheck, ArrowLeft, KeyRound, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mode, setMode] = useState<'login' | 'forgot' | 'update-password' | 'otp-verify'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      // If we have hash with password recovery or session description, show update-password screen and don't redirect
      const hash = window.location.hash;
      if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
        setMode('update-password');
        return;
      }

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update-password');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
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

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/login',
      });

      if (resetError) throw resetError;

      setSuccessMsg("Parolni tiklash havolasi emailingizga yuborildi! Iltimos, pochtangizni tekshiring.");
    } catch (err: any) {
      setError(err.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: resetEmail,
        options: {
          shouldCreateUser: false
        }
      });

      if (otpError) throw otpError;

      setSuccessMsg("E-pochtangizga bir martalik kirish kodi (OTP) yuborildi. Iltimos, pochtangizni tekshirib, 8 xonali kodni kiriting.");
      setMode('otp-verify');
    } catch (err: any) {
      setError(err.message || "OTP yuborishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: resetEmail,
        token: otpToken.trim(),
        type: 'email'
      });

      if (verifyError) throw verifyError;

      if (data.session && data.user) {
        setSuccessMsg("Tizimga muvaffaqiyatli kirdingiz!");
        
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        let currentProfile = profile;
        if (currentProfile && !currentProfile.status) {
          currentProfile.status = 'active';
        }

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
      } else {
        throw new Error("Sessiya yaratilmadi");
      }
    } catch (err: any) {
      setError(err.message || "OTP kodni tasdiqlashda xatolik yuz berdi. Kod to'g'riligini va muddati o'tmaganligini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setError("Kiritilgan parollar bir-biriga mos kelmadi!");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setSuccessMsg("Parolingiz muvaffaqiyatli yangilandi! Endi yangi parol bilan tizimga kirishingiz mumkin.");
      setTimeout(() => {
        setMode('login');
        setNewPassword('');
        setConfirmPassword('');
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Parolni o'rnatishda xatolik yuz berdi");
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
          {mode === 'login' ? 'Tizimga kirish' : mode === 'forgot' ? 'Parolni tiklash' : mode === 'otp-verify' ? 'Kodni tasdiqlash' : 'Yangi parol o\'rnatish'}
        </h2>
        {mode === 'login' && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Yoki{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              yangi hisob oching
            </Link>
          </p>
        )}
        {mode === 'forgot' && (
          <p className="mt-2 text-center px-4 text-sm text-gray-600">
            Emailingizni kiriting va biz sizga parolni tiklash havolasini yoki bir martalik tizimga kirish kodini yuboramiz.
          </p>
        )}
        {mode === 'otp-verify' && (
          <p className="mt-2 text-center px-4 text-sm text-gray-600">
            Emailingizga yuborilgan 6 yoki 8 xonali bir martalik tasdiqlash kodini kiriting.
          </p>
        )}
        {mode === 'update-password' && (
          <p className="mt-2 text-center px-4 text-sm text-gray-600">
            Iltimos, profilingiz uchun yangi va kuchli parol o'rnating.
          </p>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <p className="text-sm text-emerald-700 font-medium">{successMsg}</p>
            </div>
          )}

          {mode === 'login' && (
            <form className="space-y-6" onSubmit={handleLogin}>
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
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
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
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer focus:outline-none"
                  >
                    Parolni unutdingizmi?
                  </button>
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
          )}

          {mode === 'forgot' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                  Email manzilingiz
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="reset-email"
                    name="reset-email"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={loading || !resetEmail}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" /> Parolni tiklash havolasini yuborish
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={loading || !resetEmail}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" /> Parolsiz kirish (OTP kod orqali)
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-semibold text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Tizimga qaytish
                </button>
              </div>
            </div>
          )}

          {mode === 'otp-verify' && (
            <form className="space-y-6" onSubmit={handleVerifyOTP}>
              <div>
                <label htmlFor="otp-token" className="block text-sm font-medium text-gray-700">
                  Bir martalik tasdiqlash kodi
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp-token"
                    name="otp-token"
                    type="text"
                    required
                    maxLength={12}
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center font-semibold text-lg tracking-widest"
                    placeholder="Bir martalik kod"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !otpToken}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Kodni tasdiqlash'
                  )}
                </button>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setSuccessMsg(null);
                    setOtpToken('');
                  }}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-semibold text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Orqaga qaytish
                </button>
              </div>
            </form>
          )}

          {mode === 'update-password' && (
            <form className="space-y-6" onSubmit={handleUpdatePassword}>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  Yangi parol
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="new-password"
                    name="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Parolni tasdiqlash
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
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
                    'Yangi parolni saqlash'
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