import { supabase } from '../supabase';

function mapOrder(row) {
  return {
    ...row,
    created_date: row.created_at,
    medicines: row.medicines || [],
  };
}

export async function getMedicineOrderById(id) {
  const { data, error } = await supabase.from('medicine_orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data) : null;
}

export async function listMedicineOrders() {
  const { data, error } = await supabase
    .from('medicine_orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapOrder);
}

export async function listMedicineOrdersByPatientEmail(patientEmail) {
  const { data, error } = await supabase
    .from('medicine_orders')
    .select('*')
    .eq('patient_email', patientEmail)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapOrder);
}

export async function createMedicineOrder(payload) {
  const { data, error } = await supabase
    .from('medicine_orders')
    .insert({
      order_number: payload.order_number,
      patient_id: payload.patient_id,
      patient_email: payload.patient_email,
      patient_name: payload.patient_name,
      patient_phone: payload.patient_phone,
      pharmacy_id: payload.pharmacy_id,
      pharmacy_name: payload.pharmacy_name,
      order_type: payload.order_type,
      preferred_date: payload.preferred_date,
      preferred_time_slot: payload.preferred_time_slot,
      medicines: payload.medicines,
      total_amount: payload.total_amount,
      delivery_address: payload.delivery_address,
      status: payload.status || 'pending',
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return mapOrder(data);
}

export async function updateMedicineOrder(orderId, updates) {
  const { data, error } = await supabase
    .from('medicine_orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return mapOrder(data);
}

export async function deleteMedicineOrder(orderId) {
  const { error } = await supabase.from('medicine_orders').delete().eq('id', orderId);
  if (error) throw error;
}

export async function getPharmacyOrderStats() {
  const { data, error } = await supabase
    .from('medicine_orders')
    .select('status, total_amount, created_at');

  if (error) throw error;

  const orders = data || [];
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.created_at?.startsWith(today));

  return {
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    processingOrders: orders.filter((o) => o.status === 'processing').length,
    completedToday: todayOrders.filter((o) => o.status === 'delivered').length,
    totalRevenue: orders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
  };
}
