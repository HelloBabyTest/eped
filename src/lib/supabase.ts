import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

if (isSupabaseConfigured) {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      localStorage.setItem('current_user_id', session.user.id);
      localStorage.setItem('current_user_email', session.user.email || '');
    } else {
      localStorage.removeItem('current_user_id');
      localStorage.removeItem('current_user_email');
    }
  });
}
