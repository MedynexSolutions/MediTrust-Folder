import { createPageUrl } from '@/utils';
import { supabase } from './supabase';
import { isProfileSetupComplete } from './profiles';
import backendAPI from './api/backend.js';

export const ROLE_STORAGE_KEY = 'meditrust_role';

export const VALID_ROLES = ['patient', 'doctor', 'pharmacy'];

export const SETUP_PAGES = {
  patient: 'PatientSetup',
  doctor: 'DoctorSetup',
  pharmacy: 'PharmacySetup',
};

export const DASHBOARD_PAGES = {
  patient: 'PatientDashboard',
  doctor: 'DoctorDashboard',
  pharmacy: 'PharmacyDashboard',
};

export const AUTH_ENTRY_PATHS = ['/', '/welcome', '/signin', '/signup'];

const PROTECTED_PATH_SEGMENTS = [
  'patientdashboard',
  'doctordashboard',
  'pharmacydashboard',
  'patientsetup',
  'doctorsetup',
  'pharmacysetup',
];

export function normalizeRole(role) {
  const value = (role || '').toLowerCase();
  return VALID_ROLES.includes(value) ? value : 'patient';
}

export function getRole(user) {
  if (user?.user_metadata?.role) {
    return normalizeRole(user.user_metadata.role);
  }
  return normalizeRole(localStorage.getItem(ROLE_STORAGE_KEY));
}

export function isSetupComplete(profile) {
  return isProfileSetupComplete(profile);
}

export function getPostAuthPath(user, profile) {
  const role = getRole(user);
  const pageName = isSetupComplete(profile)
    ? DASHBOARD_PAGES[role]
    : SETUP_PAGES[role];
  return createPageUrl(pageName);
}

export function isAuthEntryPath(pathname) {
  const normalized = (pathname || '').toLowerCase().replace(/\/$/, '') || '/';
  return AUTH_ENTRY_PATHS.includes(normalized);
}

export function isSetupPath(pathname) {
  const segment = (pathname || '').replace(/^\//, '').toLowerCase();
  return ['patientsetup', 'doctorsetup', 'pharmacysetup'].includes(segment);
}

export function isProtectedPath(pathname) {
  const segment = (pathname || '').replace(/^\//, '').toLowerCase();
  return PROTECTED_PATH_SEGMENTS.includes(segment);
}

export async function syncRoleToUser(user) {
  if (!user) return null;

  const pendingRole = localStorage.getItem(ROLE_STORAGE_KEY);
  const currentRole = user.user_metadata?.role;

  if (pendingRole && !currentRole) {
    const role = normalizeRole(pendingRole);
    const { data, error } = await supabase.auth.updateUser({
      data: { role },
    });
    if (!error && data.user) {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
      return data.user;
    }
  }

  if (currentRole) {
    localStorage.setItem(ROLE_STORAGE_KEY, normalizeRole(currentRole));
  }

  return user;
}

// Backend auth functions
export const registerWithBackend = async (name, email, password, role = 'patient', profileImage = '') => {
  try {
    const data = await backendAPI.register({ name, email, password, role, profileImage });
    return data;
  } catch (error) {
    console.error('Backend registration failed, falling back to Supabase:', error);
    // Fallback to Supabase
    const { data, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role,
          profile_image: profileImage
        }
      }
    });
    if (supabaseError) throw supabaseError;
    return {
      success: true,
      token: data.session?.access_token,
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || name,
        email: data.user.email,
        role: data.user.user_metadata?.role || role,
        profileImage: data.user.user_metadata?.profile_image || profileImage
      }
    };
  }
};

export const loginWithBackend = async (email, password) => {
  try {
    const data = await backendAPI.login(email, password);
    return data;
  } catch (error) {
    console.error('Backend login failed, falling back to Supabase:', error);
    // Fallback to Supabase
    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (supabaseError) throw supabaseError;
    return {
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
        email: data.user.email,
        role: data.user.user_metadata?.role || 'patient',
        profileImage: data.user.user_metadata?.profile_image || ''
      }
    };
  }
};
