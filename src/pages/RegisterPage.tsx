import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { BookOpen, Mail, Lock, User, Shield, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('pedagog');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        console.log("Auth user created:", data.user.id);
        
        // Small delay to allow trigger to create the profile
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Check if profile was already created by trigger
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching profile after signup (maybe expected if RLS applies):", fetchError);
        }

        if (!existingProfile) {
          console.log("Profile not found after signup, attempting manual creation...");
          // Explicitly create the profile record if trigger didn't
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                full_name: fullName,
                email: email,
                role: role,
                status: 'pending'
              }
            ]);

          if (profileError && profileError.code !== '23505') {
            console.error('Manual profile creation failed:', profileError);
            if (profileError.code === '42501') {
              // RLS error is non-critical if the trigger was supposed to do it
              console.warn("RLS prevented manual profile creation. This is fine if trigger works.");
            } else {
              console.warn("Profile creation failed but user is registered:", profileError.message);
            }
          } else {
            console.log("Manual profile creation successful or already existed");
          }
        } else {
          console.log("Profile confirmed to exist (created by trigger)");
        }

        alert("Ro'yxatdan o'tish muvaffaqiyatli! Endi tizimga kirishingiz mumkin.");
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMessage = err.message || "Ro'yxatdan o'tishda xatolik yuz berdi";
      
      if (errorMessage.includes("User already registered")) {
        errorMessage = "Ushbu email manzili bilan allaqachon ro'yxatdan o'tilgan. Iltimos login sahifasiga o'ting.";
      } else if (errorMessage.includes("email rate limit exceeded")) {
        errorMessage = "Siz juda ko'p marta urinib ko'rdingiz. Iltimos biroz kuting.";
      }
      
      setError(errorMessage);
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
          Yangi hisob ochish
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Yoki{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            tizimga kiring
          </Link>
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                To'liq ismingiz
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Ism Familiya"
                />
              </div>
            </div>

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
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Lavozimingiz
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="pedagog">Professor-o'qituvchi (Pedagog)</option>
                  <option value="rahbariyat">Rahbariyat</option>
                  <option value="tahrirlovchi">Tahrirlovchi</option>
                  <option value="tasdiqlovchi">Tasdiqlovchi</option>
                  <option value="admin">Administrator (Test uchun)</option>
                </select>
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  "Ro'yxatdan o'tish"
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
                    onClick={() => alert("ERI orqali ro'yxatdan o'tish (Demo)")}
                    className="w-full inline-flex justify-center flex-col items-center py-2 px-2 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-colors h-[60px]"
                  >
                    <span className="sr-only">ERI bilan ro'yxatdan o'tish</span>
                    <img src="https://e-imzo.soliq.uz/img/logo.png" alt="ERI" className="h-6 object-contain mb-1" />
                    <span className="text-[10px] font-medium text-gray-600">ERI</span>
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => alert("Mobile-ID orqali ro'yxatdan o'tish (Demo)")}
                    className="w-full inline-flex justify-center flex-col items-center py-2 px-2 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-colors h-[60px]"
                  >
                    <span className="sr-only">Mobile-ID bilan ro'yxatdan o'tish</span>
                    <svg className="w-6 h-6 text-blue-600 mb-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                    </svg>
                    <span className="text-[10px] font-medium text-gray-600">Mobile-ID</span>
                  </button>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => alert("MyID orqali ro'yxatdan o'tish (Demo)")}
                    className="w-full inline-flex justify-center flex-col items-center py-2 px-2 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-colors h-[60px]"
                  >
                    <span className="sr-only">MyID bilan ro'yxatdan o'tish</span>
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
