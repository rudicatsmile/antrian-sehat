import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { PatientProfile, InvoiceItem, RiwayatKunjunganItem, PatientChangeLog } from "@/lib/types";

export async function getCurrentPatientProfile(userId?: string): Promise<PatientProfile | null> {
  const supabase = await createClient();

  let targetId = userId;
  if (!targetId) {
    const { data: { user } } = await supabase.auth.getUser();
    targetId = user?.id;
  }

  if (!targetId) {
    // If not logged in or in public view, try to get the first patient profile in DB
    const serviceSupabase = createServiceRoleClient();
    const { data: firstProfile } = await serviceSupabase
      .from("profiles")
      .select("*")
      .eq("role", "pasien")
      .limit(1)
      .maybeSingle();

    if (firstProfile) {
      return {
        id: firstProfile.id,
        nik: firstProfile.nik || "3271041508560002",
        namaLengkap: firstProfile.nama_lengkap,
        noWhatsapp: firstProfile.no_whatsapp,
        tanggalLahir: firstProfile.tanggal_lahir || "1985-01-01",
        jenisKelamin: (firstProfile.jenis_kelamin as "L" | "P") || "L",
        alamat: firstProfile.alamat || "Alamat belum diatur",
        noRm: firstProfile.no_rm || "RM-BARU",
        kategoriPrioritas: firstProfile.kategori_prioritas || "normal",
        dokumenPrioritasName: firstProfile.dokumen_prioritas_path?.split("/").pop(),
      };
    }

    return null;
  }

  const { data: p } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", targetId)
    .maybeSingle();

  if (!p) return null;

  return {
    id: p.id,
    nik: p.nik || "",
    namaLengkap: p.nama_lengkap,
    noWhatsapp: p.no_whatsapp,
    tanggalLahir: p.tanggal_lahir || "1990-01-01",
    jenisKelamin: (p.jenis_kelamin as "L" | "P") || "L",
    alamat: p.alamat || "",
    noRm: p.no_rm || "RM-BELUM-ADA",
    kategoriPrioritas: p.kategori_prioritas || "normal",
    dokumenPrioritasName: p.dokumen_prioritas_path?.split("/").pop(),
  };
}

export async function getPatientInvoices(patientId?: string): Promise<InvoiceItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("invoices")
    .select(`
      id,
      invoice_no,
      total_amount,
      status,
      snap_token,
      metode_bayar,
      paid_at,
      created_at,
      ticket_id,
      queue_tickets (
        nomor_tiket,
        units (
          nama
        )
      ),
      invoice_items (
        id,
        nama_item,
        qty,
        harga_satuan
      )
    `)
    .order("created_at", { ascending: false });

  if (patientId) {
    query = query.eq("patient_id", patientId);
  }

  const { data: invoices, error } = await query;

  if (error || !invoices) {
    return [];
  }

  return invoices.map((inv: any) => ({
    id: inv.id,
    invoiceNo: inv.invoice_no,
    ticketNomor: inv.queue_tickets?.nomor_tiket,
    unitNama: inv.queue_tickets?.units?.nama || "Pelayanan RSUD",
    tanggal: new Date(inv.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    totalAmount: inv.total_amount,
    status: inv.status,
    snapToken: inv.snap_token,
    metodeBayar: inv.metode_bayar,
    paidAt: inv.paid_at,
    items: (inv.invoice_items || []).map((it: any) => ({
      id: it.id,
      namaItem: it.nama_item,
      qty: it.qty,
      hargaSatuan: it.harga_satuan,
      subtotal: it.qty * it.harga_satuan,
    })),
  }));
}

export async function getPatientHistory(patientId?: string): Promise<RiwayatKunjunganItem[]> {
  const supabase = await createClient();

  let query = supabase
    .from("queue_tickets")
    .select(`
      id,
      nomor_tiket,
      tanggal,
      status,
      units (
        nama
      ),
      doctor_sessions (
        doctors (
          nama
        )
      )
    `)
    .in("status", ["selesai", "dilewati", "batal"])
    .order("tanggal", { ascending: false });

  if (patientId) {
    query = query.eq("patient_id", patientId);
  }

  const { data: history } = await query;

  if (!history) return [];

  return history.map((h: any) => ({
    id: h.id,
    nomorTiket: h.nomor_tiket,
    unitNama: h.units?.nama || "Pelayanan RSUD",
    dokterNama: h.doctor_sessions?.doctors?.nama || "Dokter Jaga RSUD",
    tanggal: h.tanggal,
    status: h.status,
    diagnosaUtama: "Konsultasi & Pemeriksaan Rawat Jalan",
    tindakan: "Pemeriksaan Tanda Vital & Resep",
    resepObat: ["Obat sesuai instruksi dokter"],
  }));
}

export async function getPatientChangeLogs(patientId: string): Promise<PatientChangeLog[]> {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("patient_change_logs")
    .select(`
      id,
      patient_id,
      field_name,
      old_value,
      new_value,
      created_at,
      profiles:changed_by (
        nama_lengkap
      )
    `)
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (!logs) return [];

  return logs.map((l: any) => ({
    id: l.id,
    patientId: l.patient_id,
    fieldName: l.field_name,
    oldValue: l.old_value || "-",
    newValue: l.new_value || "-",
    changedBy: l.profiles?.nama_lengkap || "Petugas Pendaftaran",
    createdAt: new Date(l.created_at).toLocaleString("id-ID"),
  }));
}
