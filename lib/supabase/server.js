import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

/**
 * Koneksi sesi admin memakai Supabase Auth (@supabase/ssr dan cookie).
 * Memakai SUPABASE_PUBLISHABLE_KEY untuk login, keluar, ganti password, dan kelola produk.
 */
export async function buatKoneksiAdmin() {
  const cookieStore = await cookies();
  const supabaseUrl = bersihkanUrl(process.env.SUPABASE_URL);
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY harus diisi di environment variable."
    );
  }

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Dipanggil dari Server Component saat rendering, abaikan jika set cookie tidak diizinkan
        }
      },
    },
  });
}

export const buatKlienServer = buatKoneksiServer;
export const buatKoneksiSesiAdmin = buatKoneksiAdmin;
export default buatKoneksiServer;
