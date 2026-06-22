import { createSupabaseModel } from "./supabaseModel.js";

const Prescription = createSupabaseModel({
  table: "prescriptions"
});

export default Prescription;
