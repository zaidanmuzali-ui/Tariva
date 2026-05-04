import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ override: true });

const cleanEnv = (key: string | undefined): string => {
  if (!key) return "";
  return key.toString()
    .replace(/^["']|["']$/g, '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[\r\n\t\f\v]/g, '');
};

const supabase = createClient(
  cleanEnv(process.env.VITE_SUPABASE_URL),
  cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
);

async function run() {
  console.log("Testing textSearch...");
  const query = "kopi luwak sangrai";
  
  // Try text search
  const { data: textData, error: textError } = await supabase
    .from('BTKI')
    .select('HS_Code, Uraian_Barang')
    .textSearch('Uraian_Barang', query.split(' ').join(' | '))
    .limit(3);
    
  if (textError) {
    console.error("textSearch error:", textError);
  } else {
    console.log("textSearch result:", textData);
  }
}

run();
