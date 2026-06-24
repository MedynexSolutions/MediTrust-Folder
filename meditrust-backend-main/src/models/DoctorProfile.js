import { createSupabaseModel } from "./supabaseModel.js";

const DoctorProfile = createSupabaseModel({
  table: "doctor_profiles"
});

export default DoctorProfile;
