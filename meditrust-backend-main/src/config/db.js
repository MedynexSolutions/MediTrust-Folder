import "./env.js";
import { supabase } from "./supabase.js";

export const connectDB = async () => {
  const { error } = await supabase
    .from("users")
    .select("id")
    .limit(1);

  if (error) {
    console.error(`Supabase Connection Error: ${error.message}`);
    return;
  }

  console.log("Supabase Connected");
};

export default connectDB;
