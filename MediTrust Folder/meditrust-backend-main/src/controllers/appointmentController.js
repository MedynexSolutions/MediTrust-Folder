import { supabase } from "../config/supabase.js";

export const bookAppointment = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: req.body.patient_id,
        patient_email: req.body.patient_email,
        patient_name: req.body.patient_name,
        doctor_id: req.body.doctor_id,
        doctor_email: req.body.doctor_email,
        doctor_name: req.body.doctor_name,
        specialization: req.body.specialization,
        appointment_type: req.body.appointment_type,
        appointment_date: req.body.appointment_date,
        time_slot: req.body.time_slot,
        status: req.body.status || 'pending',
        fee: req.body.fee,
        notes: req.body.notes,
        hospital_name: req.body.hospital_name,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error booking appointment:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Server error in bookAppointment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};