import { supabase } from '../supabase';

function mapLog(row) {
  return {
    ...row,
    date: row.log_date,
  };
}

export async function getHealthLogById(id) {
  const { data, error } = await supabase.from('health_logs').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapLog(data) : null;
}

export async function listHealthLogsByPatientEmail(patientEmail) {
  const { data, error } = await supabase
    .from('health_logs')
    .select('*')
    .eq('patient_email', patientEmail)
    .order('log_date', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapLog);
}

export async function createHealthLog(payload) {
  const { data, error } = await supabase
    .from('health_logs')
    .insert({
      patient_id: payload.patient_id,
      patient_email: payload.patient_email,
      log_type: payload.log_type,
      title: payload.title,
      description: payload.description,
      log_date: payload.log_date || payload.date,
      severity: payload.severity,
      medicine_name: payload.medicine_name,
      medicine_dose: payload.medicine_dose,
      medicine_taken: payload.medicine_taken,
      doctor_name: payload.doctor_name,
      reminder_time: payload.reminder_time,
      file_url: payload.file_url || '',
      file_type: payload.file_type,
    })
    .select()
    .single();

  if (error) throw error;
  return mapLog(data);
}

export async function updateHealthLog(logId, updates) {
  const { data, error } = await supabase
    .from('health_logs')
    .update(updates)
    .eq('id', logId)
    .select()
    .single();

  if (error) throw error;
  return mapLog(data);
}

export async function deleteHealthLog(logId) {
  const { error } = await supabase.from('health_logs').delete().eq('id', logId);
  if (error) throw error;
}
