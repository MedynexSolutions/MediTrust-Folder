import { supabase } from './supabase';
import { normalizeRole } from './auth-routes';

const PROFILE_TABLES = {
  patient: 'patient_profiles',
  doctor: 'doctor_profiles',
  pharmacy: 'pharmacy_profiles',
};

export function getProfileTable(role) {
  return PROFILE_TABLES[normalizeRole(role)];
}

export function isProfileSetupComplete(profile) {
  return profile?.setup_complete === true;
}

export function getDisplayName(user, profile) {
  return (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User'
  );
}

export async function fetchProfile(userId, role) {
  const table = getProfileTable(role);
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function ensureProfile(user, role) {
  const normalizedRole = normalizeRole(role);
  const existing = await fetchProfile(user.id, normalizedRole);
  if (existing) return existing;

  const payload = {
    id: user.id,
    email: user.email ?? null,
    full_name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      null,
    setup_complete: false,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(getProfileTable(normalizedRole))
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return fetchProfile(user.id, normalizedRole);
    }
    throw error;
  }

  return data;
}

export async function completeProfileSetup(userId, role, fields = {}) {
  const normalizedRole = normalizeRole(role);
  const table = getProfileTable(normalizedRole);

  const { data, error } = await supabase
    .from(table)
    .update({
      ...fields,
      setup_complete: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Ensures a row exists in the role's profile table, then saves fields and marks setup complete.
 */
export async function saveProfileAndCompleteSetup(user, role, fields = {}) {
  const normalizedRole = normalizeRole(role);
  await ensureProfile(user, normalizedRole);

  return completeProfileSetup(user.id, normalizedRole, {
    email: user.email ?? null,
    ...fields,
  });
}

export async function updatePatientLocation(userId, { city, state, country }) {
  const { data, error } = await supabase
    .from('patient_profiles')
    .update({
      city: city ?? null,
      state: state ?? null,
      country: country ?? 'India',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
