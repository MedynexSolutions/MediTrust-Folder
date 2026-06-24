import { supabase } from "../config/supabase.js";

export const getDoctors = async (req, res) => {
  try {
    // Query doctor_profiles table (frontend schema)
    const { data, error } = await supabase
      .from('doctor_profiles')
      .select('*')
      .eq('setup_complete', true);

    if (error) {
      console.error('Error fetching doctors:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    // Transform data to match expected format
    const doctors = (data || []).map(doc => ({
      id: doc.id,
      name: doc.full_name || 'Doctor',
      email: doc.email,
      role: 'doctor',
      specialization: doc.specialization || 'general_physician',
      qualification: doc.qualification || '',
      experience_years: doc.experience_years || 0,
      hospital_name: doc.hospital_name || '',
      hospital_address: doc.hospital_address || '',
      city: doc.city || '',
      state: doc.state || '',
      rating: Number(doc.rating) || 4.5,
      is_verified: Boolean(doc.is_verified),
      profile_image: doc.profile_image || null,
      consultation_fees: doc.consultation_fees || {},
      languages: doc.languages || ['English'],
      available_slots: doc.available_slots || [],
    }));

    res.json(doctors);
  } catch (error) {
    console.error('Server error in getDoctors:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};