import "./env.js";
import { supabase } from "./supabase.js";

export const connectDB = async () => {
  try {
    // Test connection by checking if we can access the database
    const { error } = await supabase
      .from("doctor_profiles")
      .select("id")
      .limit(1);

    if (error) {
      console.warn(`Supabase Connection Warning: ${error.message}`);
      console.warn("Tables may not exist yet. Run supabase/schema.sql to create them.");
      return;
    }

    console.log("Supabase Connected Successfully");
  } catch (error) {
    console.error(`Supabase Connection Error: ${error.message}`);
  }
};

export default connectDB;
