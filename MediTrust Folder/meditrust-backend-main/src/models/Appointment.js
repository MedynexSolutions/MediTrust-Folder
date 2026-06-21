import { createSupabaseModel } from "./supabaseModel.js";

const Appointment = createSupabaseModel({
  table: "appointments"
});

export default Appointment;
