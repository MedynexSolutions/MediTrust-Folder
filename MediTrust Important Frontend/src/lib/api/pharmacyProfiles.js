import { supabase } from '../supabase';

export function mapPharmacyForUI(row) {
  return {
    id: row.id,
    name: row.pharmacy_name || row.full_name || 'Pharmacy',
    address: row.address || '',
    city: row.city || '',
    state: row.state || '',
    country: row.country || 'India',
    phone: row.phone || '',
    operating_hours: '9:00 AM - 9:00 PM',
    is_verified: true,
    delivery_available: true,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=400&h=200&fit=crop',
  };
}

export async function getPharmacyProfile(userId) {
  const { data, error } = await supabase
    .from('pharmacy_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listPublicPharmacies() {
  const { data, error } = await supabase
    .from('pharmacy_profiles')
    .select('*')
    .eq('setup_complete', true)
    .order('pharmacy_name');

  if (error) throw error;
  return (data || []).map(mapPharmacyForUI);
}

export async function updatePharmacyProfile(userId, updates) {
  const { data, error } = await supabase
    .from('pharmacy_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
