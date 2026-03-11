import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing env vars!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Testing connection to:", supabaseUrl);
    try {
        const { data, error } = await supabase.from('frotas').select('*').limit(1);
        if (error) {
            console.error("Supabase error:", error);
        } else {
            console.log("Success! Data received:", data);
        }
    } catch (err) {
        console.error("Network error:", err);
    }
}

test();
