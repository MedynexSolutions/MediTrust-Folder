import { supabase } from "../config/supabase.js";

export const createHealthRecord = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('health_logs')
      .insert({
        patient_id: req.body.patient_id,
        patient_email: req.body.patient_email,
        log_type: req.body.log_type,
        title: req.body.title,
        description: req.body.description,
        log_date: req.body.log_date || req.body.date,
        severity: req.body.severity,
        medicine_name: req.body.medicine_name,
        medicine_dose: req.body.medicine_dose,
        medicine_taken: req.body.medicine_taken,
        doctor_name: req.body.doctor_name,
        reminder_time: req.body.reminder_time,
        file_url: req.body.file_url || '',
        file_type: req.body.file_type,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating health record:', error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Server error in createHealthRecord:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};