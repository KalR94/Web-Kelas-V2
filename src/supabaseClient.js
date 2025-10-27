// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Ganti dengan URL dan anon key milikmu dari Supabase > Project Settings > API
const supabaseUrl = "https://dpshbqbrivvdqkubfufk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc2hicWJyaXZ2ZHFrdWJmdWZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU0Nzg4MSwiZXhwIjoyMDc3MTIzODgxfQ.ZoMdwNW7opkFpSUzHxBq50wCwX889NVbS-EsY6a_5yg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
