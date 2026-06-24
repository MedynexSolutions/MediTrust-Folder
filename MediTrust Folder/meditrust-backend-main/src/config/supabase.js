import './env.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY?.trim();

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL missing in .env');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_KEY missing in .env');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('Supabase connected');

export default supabase;