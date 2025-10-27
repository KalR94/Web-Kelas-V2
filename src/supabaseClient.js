// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Ganti dengan URL dan anon key milikmu dari Supabase > Project Settings > API
const supabaseUrl = "https://dpshbqbrivvdqkubfufk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwc2hicWJyaXZ2ZHFrdWJmdWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NDc4ODEsImV4cCI6MjA3NzEyMzg4MX0.Xd4zp6EXr5xg1qOkzJPR73rlPnqZEbvVU4x2WcGwnpA";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
