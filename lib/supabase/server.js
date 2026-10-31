import { createClient } from "@supabase/supabase-js";

/**
 * Membersihkan URL Supabase jika ada path /rest/v1 atau trailing slash yang tidak sengaja tertempel.
 */
function bersihkanUrl(url) {
  if (!url) return url;
  return url.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
}

/**
 * Koneksi Supabase di sisi server untuk membaca data publik (seperti katalog dan detail produk).
 * Memakai SUPABASE_SECRET_KEY untuk melewati RLS saat dibaca dari server.
 */
export function buatKoneksiServer() {
  const supabaseUrl = bersihkanUrl(process.env.SUPABASE_URL);
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY harus diisi di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const buatKlienServer = buatKoneksiServer;
export default buatKoneksiServer;
