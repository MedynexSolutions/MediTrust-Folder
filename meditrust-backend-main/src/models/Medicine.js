import { createSupabaseModel } from "./supabaseModel.js";

const Medicine = createSupabaseModel({
  table: "medicines"
});

export default Medicine;
