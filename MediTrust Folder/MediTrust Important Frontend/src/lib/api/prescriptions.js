import { supabase } from '../supabase';

function mapPrescription(row) {
  return {
    ...row,
    created_date: row.created_at,
    medicines: row.medicines || [],
  };
}

export async function getPrescriptionById(id) {
  const { data, error } = await supabase.from('prescriptions').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapPrescription(data) : null;
}

export async function listPrescriptionsByPatientEmail(patientEmail) {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('patient_email', patientEmail)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapPrescription);
}

export async function listPrescriptionsForPharmacy() {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapPrescription);
}

export async function listPrescriptionsByDoctorId(doctorId) {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapPrescription);
}

export async function createPrescription(payload) {
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      patient_id: payload.patient_id,
      patient_email: payload.patient_email,
      patient_name: payload.patient_name,
      patient_phone: payload.patient_phone,
      doctor_id: payload.doctor_id,
      doctor_email: payload.doctor_email,
      doctor_name: payload.doctor_name,
      doctor_specialization: payload.doctor_specialization,
      doctor_license: payload.doctor_license,
      diagnosis: payload.diagnosis,
      medicines: payload.medicines,
      additional_notes: payload.additional_notes,
      pharmacy_status: payload.pharmacy_status || 'pending',
      delivery_address: payload.delivery_address,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return mapPrescription(data);
}

export async function updatePrescription(prescriptionId, updates) {
  const { data, error } = await supabase
    .from('prescriptions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', prescriptionId)
    .select()
    .single();

  if (error) throw error;
  return mapPrescription(data);
}

export async function updatePrescriptionStatus(prescriptionId, pharmacyStatus, extra = {}) {
  return updatePrescription(prescriptionId, { pharmacy_status: pharmacyStatus, ...extra });
}

export async function deletePrescription(prescriptionId) {
  const { error } = await supabase.from('prescriptions').delete().eq('id', prescriptionId);
  if (error) throw error;
}
