import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Read environment variables or default to placeholder
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://schrodinger-ai.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjaHJvZGluZ2VyLWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczOTI2MDAsImV4cCI6MjA1Mjk2ODYwMH0.placeholder";

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
