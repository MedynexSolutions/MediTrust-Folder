import { createSupabaseModel } from "./supabaseModel.js";

const HealthRecord = createSupabaseModel({
  table: "health_records"
});

export default HealthRecord;
