import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { User, Mail, Shield, Save, Loader2, AlertCircle, CheckCircle, Printer, Laptop, Smartphone, Globe, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Profile() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    setSessionError(null);
    try {
      // We use our custom RPC function explicitly created for sessions
      const { data, error } = await supabase.rpc('get_my_sessions');
      if (error) {
        console.error("Sessiyalarni yuklashda xatolik:", error.message);
        setSessionError(`Sessiyalar yuklanmadi. Iltimos SQL Editor'da 'get_my_sessions' funksiyasini yozing. Xatolik: ${error.message}`);
      } else if (data) {
        setSessions(data);
      }
    } catch (err: any) {
      console.error(err);
      setSessionError(`Tizim xatosi: ${err.message}`);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.rpc('revoke_my_session', { session_id: sessionId });
      if (error) throw error;
      setSessions(sessions.filter(s => s.id !== sessionId));
    } catch (err: any) {
      alert("Sessiyani o'chirishda xatolik yuz berdi.");
    }
  };

  const parseUserAgent = (ua: string) => {
    if (!ua) return { device: 'Noma\'lum qurilma', browser: '', icon: Globe };
    let device = 'Kompyuter';
    let icon = Laptop;
    
    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
      device = 'Mobil qurilma';
      icon = Smartphone;
    }
    
    let browser = 'Noma\'lum brauzer';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';

    return { device, browser, icon };
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      // Fallback to auth email if profile email is missing
      setProfile({
        ...data,
        email: data.email || user.email
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil sozlamalari</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Shaxsiy ma'lumotlaringizni boshqaring</p>
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
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
            <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{profile?.full_name || 'Foydalanuvchi'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">{profile?.role}</p>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8"
          >
            <form onSubmit={handleSave} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 p-4 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-green-700 dark:text-green-300">Ma'lumotlar muvaffaqiyatli saqlandi!</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      To'liq ism-sharifingiz
                    </label>
                    {profile?.role !== 'admin' && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500">O'zgartirish uchun administratorga murojaat qiling</span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={profile?.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      disabled={profile?.role !== 'admin'}
                      className={`block w-full pl-10 px-3 py-3 border rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white ${
                        profile?.role !== 'admin' 
                          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Ismingizni kiriting"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email manzili
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="block w-full pl-10 px-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Roli
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={profile?.role || ''}
                      disabled
                      className="block w-full pl-10 px-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-500 cursor-not-allowed uppercase"
                    />
                  </div>
                </div>
              </div>

              {profile?.role === 'admin' && (
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Saqlash
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </div>

      {/* Active Sessions UI */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Aktiv sessiyalar va qurilmalar</h3>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loadingSessions ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : sessionError ? (
            <div className="p-8 text-center text-red-500 dark:text-red-400">
              <AlertCircle className="w-12 h-12 text-red-300 dark:text-red-600 mx-auto mb-3" />
              {sessionError}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Globe className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              Sessiyalar topilmadi.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {sessions.map((session, idx) => {
                const { device, browser, icon: DeviceIcon } = parseUserAgent(session.user_agent);
                const isCurrent = session.is_current;
                
                return (
                  <div key={session.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${isCurrent ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                        <DeviceIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900 dark:text-white text-base">
                            {device} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({browser})</span>
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">
                              Joriy
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          IP: {session.ip || 'Noma\'lum'} • {new Date(session.created_at).toLocaleString('uz-UZ')}
                        </p>
                      </div>
                    </div>
                    
                    {!isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(session.id)}
                        className="self-start sm:self-center flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                      >
                        <LogOut className="w-4 h-4" />
                        Chiqarish
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
