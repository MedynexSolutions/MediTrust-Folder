import { supabase } from '../supabase';
import backendAPI from './backend.js';

function mapAppointment(row) {
  return {
    ...row,
    date: row.appointment_date || row.date,
    created_date: row.created_at || row.created_date,
  };
}

export async function getAppointmentById(id) {
  const { data, error } = await supabase.from('appointments').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapAppointment(data) : null;
}

export async function listAppointmentsByPatientEmail(patientEmail) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_email', patientEmail)
    .order('appointment_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapAppointment);
}

export async function listAppointmentsByDoctorId(doctorId) {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('appointment_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapAppointment);
}

export async function listAppointmentsByDoctorAndDate(doctorId, appointmentDate) {
  const { data, error } = await supabase
    .from('appointments')
    .select('time_slot, status')
    .eq('doctor_id', doctorId)
    .eq('appointment_date', appointmentDate);

  if (error) throw error;
  return data || [];
}

export async function createAppointment(payload) {
  try {
    // Try backend API first
    const data = await backendAPI.bookAppointment(payload);
    return mapAppointment(data);
  } catch (error) {
    console.warn('Backend API failed, falling back to Supabase:', error);
    // Fallback to Supabase
    const { data, error: supabaseError } = await supabase
      .from('appointments')
      .insert({
        patient_id: payload.patient_id,
        patient_email: payload.patient_email,
        patient_name: payload.patient_name,
        doctor_id: payload.doctor_id,
        doctor_email: payload.doctor_email,
        doctor_name: payload.doctor_name,
        specialization: payload.specialization,
        appointment_type: payload.appointment_type,
        appointment_date: payload.appointment_date,
        time_slot: payload.time_slot,
        status: payload.status || 'pending',
        fee: payload.fee,
        notes: payload.notes,
        hospital_name: payload.hospital_name,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (supabaseError) throw supabaseError;
    return mapAppointment(data);
  }
}

export async function updateAppointment(appointmentId, updates) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) throw error;
  return mapAppointment(data);
}

export async function updateAppointmentStatus(appointmentId, status) {
  return updateAppointment(appointmentId, { status });
}

export async function cancelAppointment(appointmentId) {
  return updateAppointmentStatus(appointmentId, 'cancelled');
}

export async function deleteAppointment(appointmentId) {
  const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
  if (error) throw error;
}

export function buildSlotOccupancy(appointments, slots) {
  const result = {};
  slots.forEach((slot) => {
    result[slot] = 0;
  });
  appointments.forEach((apt) => {
    if (apt.time_slot && result[apt.time_slot] !== undefined && apt.status !== 'cancelled') {
      result[apt.time_slot] += 1;
    }
  });
  return result;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export async function getDoctorAnalytics(doctorId) {
  const appointments = await listAppointmentsByDoctorId(doctorId);
  const completed = appointments.filter((a) => a.status === 'completed');
  const patients = new Set(appointments.map((a) => a.patient_email).filter(Boolean));

  const monthlyMap = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    monthlyMap[key] = { month: MONTH_LABELS[d.getMonth()], patients: 0, earnings: 0 };
  }

  appointments.forEach((apt) => {
    const d = new Date(apt.appointment_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (monthlyMap[key]) {
      monthlyMap[key].patients += 1;
      if (apt.status === 'completed') {
        monthlyMap[key].earnings += Number(apt.fee || 0);
      }
    }
  });

  const typeCounts = { video: 0, audio: 0, chat: 0, offline: 0 };
  appointments.forEach((apt) => {
    if (typeCounts[apt.appointment_type] !== undefined) {
      typeCounts[apt.appointment_type] += 1;
    }
  });
  const totalTypes = Object.values(typeCounts).reduce((s, n) => s + n, 0) || 1;
  const consultationTypes = [
    { name: 'Video', value: Math.round((typeCounts.video / totalTypes) * 100), color: '#8B5CF6' },
    { name: 'Audio', value: Math.round((typeCounts.audio / totalTypes) * 100), color: '#10B981' },
    { name: 'Chat', value: Math.round((typeCounts.chat / totalTypes) * 100), color: '#3B82F6' },
    { name: 'Offline', value: Math.round((typeCounts.offline / totalTypes) * 100), color: '#6B7280' },
  ];

  const totalEarnings = completed.reduce((sum, a) => sum + Number(a.fee || 0), 0);

  return {
    monthlyData: Object.values(monthlyMap),
    consultationTypes,
    stats: {
      totalPatients: patients.size,
      totalAppointments: appointments.length,
      totalEarnings,
      completedCount: completed.length,
    },
  };
}
