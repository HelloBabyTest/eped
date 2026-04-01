import { createClient } from '@supabase/supabase-js';

// Fallback values added for temporary Netlify deployment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://plnimexpznpebibfriwz.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsbmltZXhwem5wZWJpYmZyaXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDUzNjksImV4cCI6MjA5MDEyMTM2OX0.Nj4ZKvI295MiNPRtL6Q0HZzViDqRy6RRHQWt72KGV4s";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;
