"use server";

import { redirect } from "next/navigation";
import { buatKoneksiAdmin } from "@/lib/supabase/server";

/**
 * Server Action untuk memproses login admin menggunakan Supabase Auth.
 * Menerima FormData dari form login dan mengarahkan ke /admin jika berhasil.
 */
export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data?.get ? data.get("email") : null;
  const password = data?.get ? data.get("password") : null;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await buatKoneksiAdmin();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.toString().trim(),
    password: password.toString(),
  });

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "Email atau password salah."
          : `Gagal masuk: ${error.message}`,
    };
  }

  redirect("/admin");
}

/**
 * Server Action untuk mengakhiri sesi admin (logout) lalu kembali ke halaman login.
 */
export async function keluar() {
  const supabase = await buatKoneksiAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/**
 * Server Action untuk mengganti password admin yang sedang login.
 * Memeriksa sesi login di server, memvalidasi minimal 8 karakter, dan memeriksa kesamaan konfirmasi.
 */
export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data?.get ? data.get("password_baru") : null;
  const konfirmasiPassword = data?.get ? data.get("konfirmasi_password") : null;

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  const passStr = passwordBaru.toString();
  const konfStr = konfirmasiPassword.toString();

  if (passStr.length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passStr !== konfStr) {
    return { error: "Konfirmasi password tidak sama dengan password baru." };
  }

  const supabase = await buatKoneksiAdmin();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Kamu harus login terlebih dahulu untuk mengganti password." };
  }

  const { error } = await supabase.auth.updateUser({
    password: passStr,
  });

  if (error) {
    return { error: `Gagal mengganti password: ${error.message}` };
  }

  return { sukses: "Password berhasil diganti." };
}
