import { supabase } from '../supabase';

export function mapMedicineForUI(row) {
  const category = (row.category || 'all').replace(/-/g, '_');
  return {
    id: row.id,
    name: row.name,
    category,
    description: row.description || '',
    uses: row.description || '',
    price: Number(row.price),
    rating: 4.5,
    reviewCount: 0,
    stock: row.stock || 'in_stock',
    manufacturer: 'MediTrust',
    tags: row.requires_prescription ? ['Rx Required'] : [],
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
    requiresPrescription: Boolean(row.requires_prescription),
  };
}

/** Detail shape for Verify Medicine page */
export function mapMedicineToVerifyDetail(row) {
  const base = mapMedicineForUI(row);
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 2);
  return {
    ...base,
    genericName: base.name.split(' ')[0],
    brandName: base.name,
    totalReviews: 0,
    uses: base.description || 'See package insert for typical uses.',
    composition: base.description || 'See package insert for full composition.',
    sideEffects: 'Consult your pharmacist or doctor for side effects.',
    safetyWarnings: base.requiresPrescription
      ? 'Prescription required. Follow your doctor\'s advice.'
      : 'Use as directed. Do not exceed recommended dose.',
    dosage: 'Follow label or prescriber instructions.',
    prescriptionRequired: base.requiresPrescription,
    mrpRange: `₹${base.price}`,
    manufacturingDate: row.created_at || new Date().toISOString(),
    expiryDate: expiry.toISOString(),
    batchNumber: `MT-${row.id}`,
    manufacturingExplanation: 'Listed in MediTrust verified medicine catalog.',
    isVerified: true,
  };
}

export async function listMedicines() {
  const { data, error } = await supabase.from('medicines').select('*').order('name');
  if (error) throw error;
  return (data || []).map(mapMedicineForUI);
}

export async function getMedicineById(id) {
  const { data, error } = await supabase.from('medicines').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapMedicineForUI(data) : null;
}

export async function searchMedicines(query) {
  const q = (query || '').trim();
  if (!q) return listMedicines();

  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
    .order('name');

  if (error) throw error;
  return (data || []).map(mapMedicineForUI);
}

export async function searchMedicinesForVerify(query) {
  const q = (query || '').trim();
  if (!q) return [];

  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .or(`name.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
    .order('name')
    .limit(10);

  if (error) throw error;
  return (data || []).map(mapMedicineToVerifyDetail);
}

export async function createMedicine(payload) {
  const { data, error } = await supabase
    .from('medicines')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return mapMedicineForUI(data);
}

export async function updateMedicine(id, updates) {
  const { data, error } = await supabase.from('medicines').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return mapMedicineForUI(data);
}

export async function deleteMedicine(id) {
  const { error } = await supabase.from('medicines').delete().eq('id', id);
  if (error) throw error;
}
