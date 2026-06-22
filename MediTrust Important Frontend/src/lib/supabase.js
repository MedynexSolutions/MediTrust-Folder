import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://kfrpcpppcvkegtbyctss.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcnBjcHBwY3ZrZWd0YnljdHNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMDkzNDksImV4cCI6MjA5NTc4NTM0OX0.x1zrnIRZbDlWdTpBhwbnpy3xAAmCXqa6W1n9SCIw8No';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
