import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ override: true });

const cleanEnv = (key) => key ? key.toString().replace(/^["']|["']$/g, '').trim() : "";

const supabase = createClient(
  cleanEnv(process.env.VITE_SUPABASE_URL),
  cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
);

async function run() {
  console.log("Checking BTKI table structure...");
  
  // Try fetching one row
  const { data, error } = await supabase.from('BTKI').select('*').limit(1);
  
  if (error) {
    console.error("Error fetching BTKI:", error);
  } else {
    console.log("BTKI Sample:", data);
  }
}

run();
