// supabase.js
import { supabase } from "./supabaseClient";

// ===== AUTH =====
export const auth = supabase.auth;

// Fungsi login dengan Google
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) console.error("Error login:", error.message);
  return data;
}

// Fungsi logout
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Error logout:", error.message);
  return !error;
}

// ===== DATABASE =====
// Supabase menggantikan Firestore
export const db = {
  // tambah data
  add: async (table, record) => {
    const { data, error } = await supabase.from(table).insert([record]);
    if (error) throw error;
    return data;
  },

  // ambil semua data
  getAll: async (table) => {
    const { data, error } = await supabase.from(table).select("*");
    if (error) throw error;
    return data;
  },

  // ambil data dengan filter
  getWhere: async (table, field, value) => {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq(field, value);
    if (error) throw error;
    return data;
  },

  // update data
  update: async (table, idField, idValue, newData) => {
    const { data, error } = await supabase
      .from(table)
      .update(newData)
      .eq(idField, idValue);
    if (error) throw error;
    return data;
  },

  // hapus data
  delete: async (table, idField, idValue) => {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq(idField, idValue);
    if (error) throw error;
    return data;
  },
};

// ===== STORAGE =====
// Supabase menggantikan Firebase Storage
export const storage = {
  // upload file ke bucket
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    if (error) throw error;
    return data;
  },

  // ambil URL publik file
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // hapus file
  remove: async (bucket, path) => {
    const { data, error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
    return data;
  },
};
