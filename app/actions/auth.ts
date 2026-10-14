"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// In-memory rate limiting map for demo / safety guard
const rateLimitStore = new Map<string, { otpRequests: number[]; verifyAttempts: number; lockedUntil?: number }>();

function checkRateLimit(phone: string) {
  const now = Date.now();
  const fifteenMinutes = 15 * 60 * 1000;
  let record = rateLimitStore.get(phone);

  if (!record) {
    record = { otpRequests: [], verifyAttempts: 0 };
    rateLimitStore.set(phone, record);
  }

  // Filter requests older than 15 minutes
  record.otpRequests = record.otpRequests.filter((t) => now - t < fifteenMinutes);

  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      allowed: false,
      error: `Terlalu banyak percobaan. Akun ditangguhkan selama ${remainingMinutes} menit.`,
    };
  }

  if (record.otpRequests.length >= 3) {
    return {
      allowed: false,
      error: "Maksimal 3 permintaan OTP per 15 menit telah tercapai. Harap tunggu beberapa saat.",
    };
  }

  return { allowed: true };
}

function recordOtpRequest(phone: string) {
  const record = rateLimitStore.get(phone);
  if (record) {
    record.otpRequests.push(Date.now());
  }
}

function checkVerifyAttempt(phone: string) {
  let record = rateLimitStore.get(phone);
  if (!record) {
    record = { otpRequests: [], verifyAttempts: 0 };
    rateLimitStore.set(phone, record);
  }

  const now = Date.now();
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return {
      allowed: false,
      error: `Akun terkunci karena salah 5 kali percobaan verifikasi. Coba lagi dalam ${remainingMinutes} menit.`,
    };
  }

  if (record.verifyAttempts >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // Lock for 15 minutes
    return {
      allowed: false,
      error: "Maksimal 5 kali percobaan verifikasi salah tercapai. Akun dikunci selama 15 menit.",
    };
  }

  return { allowed: true };
}

function incrementVerifyFail(phone: string) {
  const record = rateLimitStore.get(phone);
  if (record) {
    record.verifyAttempts += 1;
  }
}

function resetVerifyAttempts(phone: string) {
  const record = rateLimitStore.get(phone);
  if (record) {
    record.verifyAttempts = 0;
  }
}

/**
 * Normalizes phone number into Indonesian international format without leading plus or symbols (e.g. 6281234567890).
 */
export async function normalizeIndonesianPhone(phone: string): Promise<string> {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Sends OTP to patient's WhatsApp number.
 */
export async function signInWithOtp(formData: { nik?: string; phone: string }) {
  try {
    const rawPhone = formData.phone?.trim() || "";
    const rawNik = formData.nik?.trim() || "";

    if (!rawPhone) {
      return { success: false, error: "Nomor WhatsApp wajib diisi." };
    }

    const normalizedPhone = await normalizeIndonesianPhone(rawPhone);
    if (!/^62[0-9]{8,13}$/.test(normalizedPhone)) {
      return { success: false, error: "Nomor WhatsApp tidak valid. Format: 08xx-xxxx-xxxx." };
    }

    if (rawNik) {
      if (!/^[0-9]{16}$/.test(rawNik)) {
        return { success: false, error: "NIK harus tepat 16 digit angka sesuai KTP/KK." };
      }
    }

    // Rate limit check
    const rateCheck = checkRateLimit(normalizedPhone);
    if (!rateCheck.allowed) {
      return { success: false, error: rateCheck.error };
    }

    recordOtpRequest(normalizedPhone);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      // In mock/development mode, simulate OTP delivery
      return {
        success: true,
        message: "Kode OTP simulasi telah dikirim ke WhatsApp Anda (Gunakan kode: 123456).",
        normalizedPhone,
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: `+${normalizedPhone}`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Kode verifikasi 6 digit telah dikirim melalui pesan WhatsApp.",
      normalizedPhone,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memproses pengiriman OTP." };
  }
}

/**
 * Verifies OTP code, establishes session, and handles profile initialization.
 */
export async function verifyOtp(payload: {
  phone: string;
  token: string;
  nik?: string;
  namaLengkap?: string;
  tanggalLahir?: string;
  jenisKelamin?: "L" | "P";
  alamat?: string;
}) {
  try {
    const normalizedPhone = await normalizeIndonesianPhone(payload.phone);
    const token = payload.token.trim();

    if (!token || token.length !== 6) {
      return { success: false, error: "Kode OTP harus berupa 6 digit angka." };
    }

    // Check verify rate limit
    const verifyLimit = checkVerifyAttempt(normalizedPhone);
    if (!verifyLimit.allowed) {
      return { success: false, error: verifyLimit.error };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isMock = !supabaseUrl || supabaseUrl.includes("mock.supabase.co");

    if (isMock) {
      // Simulate verification in mock mode
      if (token !== "123456" && token !== "654321") {
        incrementVerifyFail(normalizedPhone);
        return { success: false, error: "Kode OTP tidak valid atau telah kedaluwarsa. (Gunakan 123456 untuk simulasi)" };
      }

      resetVerifyAttempts(normalizedPhone);

      // Determine redirect role based on phone number or payload
      let redirectPath = "/dashboard";
      if (normalizedPhone.endsWith("999")) {
        redirectPath = "/admin/dashboard";
      } else if (normalizedPhone.endsWith("888")) {
        redirectPath = "/petugas/dashboard";
      }

      return {
        success: true,
        redirectUrl: redirectPath,
      };
    }

    const supabase = await createClient();
    const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
      phone: `+${normalizedPhone}`,
      token: token,
      type: "sms",
    });

    if (verifyError || !authData.user) {
      incrementVerifyFail(normalizedPhone);
      return { success: false, error: verifyError?.message || "Kode OTP tidak valid atau kedaluwarsa." };
    }

    resetVerifyAttempts(normalizedPhone);
    const user = authData.user;

    // Check or upsert profile using service role to bypass initial RLS restrictions
    const serviceSupabase = createServiceRoleClient();
    const { data: existingProfile } = await serviceSupabase
      .from("profiles")
      .select("id, role, no_rm, nik")
      .eq("id", user.id)
      .maybeSingle();

    let userRole = "pasien";

    if (existingProfile) {
      userRole = existingProfile.role;
      // Update NIK if provided and not yet filled
      if (payload.nik && !existingProfile.nik) {
        await serviceSupabase
          .from("profiles")
          .update({
            nik: payload.nik,
            nama_lengkap: payload.namaLengkap || user.user_metadata?.nama_lengkap || "Pasien",
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
    } else {
      // Generate initial RM if patient
      const currentYear = new Date().getFullYear();
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const generatedNoRm = `RM-${currentYear}-${randomSuffix}`;

      await serviceSupabase.from("profiles").insert({
        id: user.id,
        role: "pasien",
        nik: payload.nik || null,
        nama_lengkap: payload.namaLengkap || "Pasien Antrean Sehat",
        no_whatsapp: normalizedPhone,
        tanggal_lahir: payload.tanggalLahir || null,
        jenis_kelamin: payload.jenisKelamin || null,
        alamat: payload.alamat || null,
        no_rm: generatedNoRm,
      });
    }

    // Determine target redirect
    let redirectUrl = "/dashboard";
    if (userRole === "admin") {
      redirectUrl = "/admin/dashboard";
    } else if (userRole === "petugas") {
      redirectUrl = "/petugas/dashboard";
    }

    revalidatePath("/", "layout");
    return {
      success: true,
      redirectUrl,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal melakukan verifikasi OTP." };
  }
}

/**
 * Signs out the current session and redirects to /masuk.
 */
export async function signOutUser() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Continue redirect even if offline
  }
  redirect("/masuk");
}
