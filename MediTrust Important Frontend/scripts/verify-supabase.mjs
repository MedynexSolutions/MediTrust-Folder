/**
 * Verifies Supabase connectivity and core tables.
 * Usage: node scripts/verify-supabase.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return {};
  const lines = readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    env[key] = rest.join('=');
  }
  return env;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(url, key);

const tables = [
  'patient_profiles',
  'doctor_profiles',
  'pharmacy_profiles',
  'appointments',
  'prescriptions',
  'medicines',
  'medicine_orders',
  'health_logs',
];

async function verify() {
  console.log('🔍 MediTrust Supabase Verification');
  console.log(`   URL: ${url}`);

  const { error: authError } = await supabase.auth.getSession();
  if (authError) {
    console.error('❌ Auth service error:', authError.message);
    process.exit(1);
  }
  console.log('✅ Auth service reachable');

  for (const table of tables) {
    const { error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`❌ Table "${table}": ${error.message}`);
    } else {
      console.log(`✅ Table "${table}" accessible (${count ?? 0} rows)`);
    }
  }

  const { data: medicines, error: medError } = await supabase
    .from('medicines')
    .select('id, name')
    .limit(3);

  if (!medError && medicines?.length) {
    console.log(`✅ Medicine catalog seeded (${medicines.length} sample: ${medicines.map(m => m.name).join(', ')})`);
  }

  console.log('\n✅ Supabase verification complete');
}

verify().catch((err) => {
  console.error('❌ Verification failed:', err.message);
  process.exit(1);
});
