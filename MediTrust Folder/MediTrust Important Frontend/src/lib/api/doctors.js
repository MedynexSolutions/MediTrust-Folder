import { supabase } from '../supabase';
import backendAPI from './backend.js';

const DEFAULT_SLOTS = [
  '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM',
  '10:00 AM', '10:15 AM', '10:30 AM', '10:45 AM',
  '11:00 AM', '11:15 AM', '11:30 AM', '11:45 AM',
  '02:00 PM', '02:15 PM', '02:30 PM', '02:45 PM',
  '03:00 PM', '03:15 PM', '03:30 PM', '04:00 PM',
];

const SPEC_LABELS = {
  general_physician: 'General Physician',
  cardiologist: 'Cardiologist',
  dermatologist: 'Dermatologist',
  neurologist: 'Neurologist',
  orthopedic: 'Orthopedic',
  pediatrician: 'Pediatrician',
  psychiatrist: 'Psychiatrist',
  gynecologist: 'Gynecologist',
};

export function mapDoctorProfile(row) {
  if (!row) return null;
  const fees = row.consultation_fees || {};
  const slots = Array.isArray(row.available_slots) && row.available_slots.length > 0
    ? row.available_slots
    : DEFAULT_SLOTS;

  return {
    id: row.id,
    name: row.full_name || row.name || 'Doctor',
    specialization: row.specialization || 'general_physician',
    specialization_label: SPEC_LABELS[row.specialization] || row.specialization,
    qualification: row.qualification || '',
    experience_years: row.experience_years || 0,
    hospital_name: row.hospital_name || '',
    hospital_address: row.hospital_address || '',
    city: row.city || '',
    state: row.state || '',
    country: row.country || 'India',
    rating: Number(row.rating) || 4.5,
    is_verified: Boolean(row.is_verified),
    consultation_fees: fees,
    languages: row.languages || ['English'],
    profile_image: row.profile_image || row.profileImage || null,
    slot_duration_minutes: row.slot_duration_minutes || 15,
    max_patients_per_slot: row.max_patients_per_slot || 2,
    walkin_reserve_percent: row.walkin_reserve_percent || 30,
    available_slots: slots,
    license_number: row.license_number || '',
    email: row.email,
    distance: row.city ? 'Nearby' : '',
  };
}

export async function listPublicDoctors() {
  try {
    // Try backend API first
    const data = await backendAPI.getDoctors();
    return (data || []).map(mapDoctorProfile);
  } catch (error) {
    console.warn('Backend API failed, falling back to Supabase:', error);
    // Fallback to Supabase
    const { data, error: supabaseError } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('setup_complete', true)
      .order('full_name');

    if (supabaseError) throw supabaseError;
    return (data || []).map(mapDoctorProfile);
  }
}

export async function getDoctorById(doctorId) {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('*')
    .eq('id', doctorId)
    .maybeSingle();

  if (error) throw error;
  return mapDoctorProfile(data);
}

export async function getDoctorProfileForUser(userId) {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateDoctorProfile(userId, updates) {
  const { data, error } = await supabase
    .from('doctor_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getDoctorDashboardStats(doctorId) {
  const today = new Date().toISOString().split('T')[0];

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('status, appointment_date, fee')
    .eq('doctor_id', doctorId);

  if (error) throw error;

  const list = appointments || [];
  const todayList = list.filter((a) => a.appointment_date === today);

  return {
    todayAppointments: todayList.length,
    completedToday: todayList.filter((a) => a.status === 'completed').length,
    totalPatients: new Set(list.map((a) => a.patient_email)).size,
    totalEarnings: list
      .filter((a) => a.status === 'completed')
      .reduce((sum, a) => sum + Number(a.fee || 0), 0),
  };
}
