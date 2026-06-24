import { supabase } from "../config/supabase.js";

export const createPrescription = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: req.body.patient_id,
        patient_email: req.body.patient_email,
        patient_name: req.body.patient_name,
        patient_phone: req.body.patient_phone,
        doctor_id: req.body.doctor_id,
        doctor_email: req.body.doctor_email,
        doctor_name: req.body.doctor_name,
        doctor_specialization: req.body.doctor_specialization,
        doctor_license: req.body.doctor_license,
        diagnosis: req.body.diagnosis,
        medicines: req.body.medicines,
        additional_notes: req.body.additional_notes,
        pharmacy_status: req.body.pharmacy_status || 'pending',
        delivery_address: req.body.delivery_address,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating prescription:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Server error in createPrescription:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};