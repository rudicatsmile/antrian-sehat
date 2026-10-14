"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { normalizeIndonesianPhone } from "./auth";

/**
 * Format: RM-YYYY-XXXXXX (e.g. RM-2026-004812)
 */
export async function generateNoRm(): Promise<string> {
  const year = new Date().getFullYear();
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000).toString();
  return `RM-${year}-${randomSixDigits}`;
}

const patientSchema = z.object({
  nik: z.string().regex(/^[0-9]{16}$/, "NIK harus terdiri dari 16 digit angka"),
  namaLengkap: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  noWhatsapp: z.string().min(9, "Nomor WhatsApp tidak valid"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenisKelamin: z.enum(["L", "P"], { message: "Pilih jenis kelamin (L atau P)" }),
  alamat: z.string().min(5, "Alamat minimal 5 karakter"),
  kategoriPrioritas: z.enum(["normal", "lansia", "disabilitas", "ibu_hamil", "emergency"]).default("normal"),
  isPasienLama: z.boolean().optional().default(false),
  manualRm: z.string().optional(),
});

export type PatientFormData = z.input<typeof patientSchema>;

/**
 * Creates a new patient record (from public registration or staff registration desk).
 */
export async function createPatient(data: PatientFormData) {
  try {
    const parsed = patientSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Data formulir tidak valid.",
      };
    }

    const { nik, namaLengkap, noWhatsapp, tanggalLahir, jenisKelamin, alamat, kategoriPrioritas, isPasienLama, manualRm } = parsed.data;
    const normalizedPhone = await normalizeIndonesianPhone(noWhatsapp);
    const assignedNoRm = isPasienLama && manualRm && manualRm.trim() ? manualRm.trim() : await generateNoRm();

    const serviceSupabase = createServiceRoleClient();

    // Check if NIK already registered
    const { data: existingNik } = await serviceSupabase
      .from("profiles")
      .select("id, no_rm, nama_lengkap")
      .eq("nik", nik)
      .maybeSingle();

    if (existingNik) {
      return {
        success: false,
        error: `NIK ${nik} sudah terdaftar dengan Nomor Rekam Medis: ${existingNik.no_rm} (${existingNik.nama_lengkap}). Silakan lakukan pembaruan data jika diperlukan.`,
      };
    }

    // Insert new patient into profiles
    const newId = crypto.randomUUID();
    const { data: newPatient, error: insertError } = await serviceSupabase
      .from("profiles")
      .insert({
        id: newId,
        role: "pasien",
        nik,
        nama_lengkap: namaLengkap,
        no_whatsapp: normalizedPhone,
        tanggal_lahir: tanggalLahir,
        jenis_kelamin: jenisKelamin,
        alamat,
        no_rm: assignedNoRm,
        kategori_prioritas: kategoriPrioritas,
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath("/petugas/pendaftaran");
    revalidatePath("/admin/pengguna");

    return {
      success: true,
      message: "Pendaftaran pasien baru berhasil tersimpan di database.",
      noRm: assignedNoRm,
      patient: newPatient,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mendaftarkan pasien baru." };
  }
}

/**
 * Updates patient data and records every change into `patient_change_logs`.
 */
export async function updatePatient(
  patientId: string,
  updatedFields: {
    nama_lengkap?: string;
    no_whatsapp?: string;
    alamat?: string;
    kategori_prioritas?: "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency";
    dokumen_prioritas_path?: string;
    changedById?: string;
  }
) {
  try {
    const serviceSupabase = createServiceRoleClient();

    // Fetch existing profile to compute diff
    const { data: current, error: fetchError } = await serviceSupabase
      .from("profiles")
      .select("*")
      .eq("id", patientId)
      .single();

    if (fetchError || !current) {
      return { success: false, error: "Data pasien tidak ditemukan." };
    }

    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    const changeLogs: { patient_id: string; changed_by: string | null; field_name: string; old_value: string; new_value: string }[] = [];

    const changedBy = updatedFields.changedById || null;

    if (updatedFields.nama_lengkap && updatedFields.nama_lengkap !== current.nama_lengkap) {
      updatePayload.nama_lengkap = updatedFields.nama_lengkap;
      changeLogs.push({
        patient_id: patientId,
        changed_by: changedBy,
        field_name: "nama_lengkap",
        old_value: current.nama_lengkap || "",
        new_value: updatedFields.nama_lengkap,
      });
    }

    if (updatedFields.no_whatsapp) {
      const normalized = await normalizeIndonesianPhone(updatedFields.no_whatsapp);
      if (normalized !== current.no_whatsapp) {
        updatePayload.no_whatsapp = normalized;
        changeLogs.push({
          patient_id: patientId,
          changed_by: changedBy,
          field_name: "no_whatsapp",
          old_value: current.no_whatsapp || "",
          new_value: normalized,
        });
      }
    }

    if (updatedFields.alamat && updatedFields.alamat !== current.alamat) {
      updatePayload.alamat = updatedFields.alamat;
      changeLogs.push({
        patient_id: patientId,
        changed_by: changedBy,
        field_name: "alamat",
        old_value: current.alamat || "",
        new_value: updatedFields.alamat,
      });
    }

    if (updatedFields.kategori_prioritas && updatedFields.kategori_prioritas !== current.kategori_prioritas) {
      updatePayload.kategori_prioritas = updatedFields.kategori_prioritas;
      changeLogs.push({
        patient_id: patientId,
        changed_by: changedBy,
        field_name: "kategori_prioritas",
        old_value: current.kategori_prioritas || "",
        new_value: updatedFields.kategori_prioritas,
      });
    }

    if (updatedFields.dokumen_prioritas_path && updatedFields.dokumen_prioritas_path !== current.dokumen_prioritas_path) {
      updatePayload.dokumen_prioritas_path = updatedFields.dokumen_prioritas_path;
      changeLogs.push({
        patient_id: patientId,
        changed_by: changedBy,
        field_name: "dokumen_prioritas_path",
        old_value: current.dokumen_prioritas_path || "",
        new_value: updatedFields.dokumen_prioritas_path,
      });
    }

    // Update profile
    const { error: updateError } = await serviceSupabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", patientId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Insert change logs if any changes occurred
    if (changeLogs.length > 0) {
      await serviceSupabase.from("patient_change_logs").insert(changeLogs);
    }

    revalidatePath(`/petugas/pendaftaran/update/${patientId}`);
    revalidatePath("/profil");
    revalidatePath("/petugas/pendaftaran");

    return {
      success: true,
      message: `Berhasil memperbarui ${changeLogs.length} data pasien dan mencatat ke audit log.`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal memperbarui data pasien." };
  }
}

/**
 * Uploads priority document (e.g. KTP Lansia, Surat Disabilitas, Buku KIA) and updates priority status.
 */
export async function uploadPriorityDocument(payload: {
  patientId: string;
  category: "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency";
  documentPath: string;
}) {
  return await updatePatient(payload.patientId, {
    kategori_prioritas: payload.category,
    dokumen_prioritas_path: payload.documentPath,
  });
}

export async function searchPatientByNik(nik: string) {
  try {
    const serviceSupabase = createServiceRoleClient();
    const { data: patient, error } = await serviceSupabase
      .from("profiles")
      .select("id, nik, nama_lengkap, no_rm, tanggal_lahir, alamat, no_whatsapp, jenis_kelamin, kategori_prioritas")
      .eq("nik", nik)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (!patient) {
      return { success: false, error: "Pasien dengan NIK tersebut belum terdaftar dalam sistem." };
    }

    return {
      success: true,
      patient: {
        id: patient.id,
        nik: patient.nik,
        nama: patient.nama_lengkap,
        noRm: patient.no_rm,
        tglLahir: patient.tanggal_lahir || "-",
        alamat: patient.alamat || "-",
        noWhatsapp: patient.no_whatsapp,
        kategoriPrioritas: patient.kategori_prioritas,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mencari data pasien." };
  }
}

