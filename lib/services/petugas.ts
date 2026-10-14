import { createClient } from "@/lib/supabase/server";
import { StaffPatientRecord, RoomBed, InpatientRequest, DisplayScreen } from "@/lib/types";
export { getTriageTickets, getUnitQueue } from "@/lib/services/antrean";

export async function getStaffPatients(): Promise<StaffPatientRecord[]> {
  const supabase = await createClient();

  const { data: patients, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "pasien")
    .order("created_at", { ascending: false });

  if (error || !patients) return [];

  return patients.map((p: any) => ({
    id: p.id,
    nik: p.nik || "-",
    namaLengkap: p.nama_lengkap,
    noWhatsapp: p.no_whatsapp,
    tanggalLahir: p.tanggal_lahir || "-",
    jenisKelamin: (p.jenis_kelamin as "L" | "P") || "L",
    alamat: p.alamat || "-",
    noRm: p.no_rm || undefined,
    kategoriPrioritas: p.kategori_prioritas || "normal",
    waktuDaftar: new Date(p.created_at).toLocaleString("id-ID"),
  }));
}

export async function getStaffPatientById(id: string): Promise<StaffPatientRecord | null> {
  const all = await getStaffPatients();
  return all.find((p) => p.id === id) || null;
}

export async function getRooms(): Promise<RoomBed[]> {
  const supabase = await createClient();

  const { data: rooms, error } = await supabase
    .from("rooms")
    .select(`
      id,
      nama_kamar,
      kelas,
      kapasitas,
      terisi,
      units (
        nama,
        buildings (
          nama
        )
      )
    `)
    .order("nama_kamar", { ascending: true });

  if (error || !rooms) return [];

  return rooms.map((r: any) => ({
    id: r.id,
    namaKamar: r.nama_kamar,
    kelas: r.kelas,
    gedung: r.units?.buildings?.nama || "Gedung B (IGD & Rawat Inap)",
    kapasitas: r.kapasitas,
    terisi: r.terisi,
  }));
}

export async function getInpatientRequests(): Promise<InpatientRequest[]> {
  const supabase = await createClient();

  const { data: requests, error } = await supabase
    .from("inpatient_requests")
    .select(`
      id,
      kelas_diminta,
      indikasi,
      is_pre_op,
      jenis_tindakan,
      prioritas,
      status,
      created_at,
      profiles (
        nama_lengkap,
        no_rm
      )
    `)
    .order("created_at", { ascending: false });

  if (error || !requests) return [];

  return requests.map((r: any) => ({
    id: r.id,
    namaPasien: r.profiles?.nama_lengkap || "Pasien",
    noRm: r.profiles?.no_rm || "RM-BELUM-ADA",
    kelasDiminta: r.kelas_diminta,
    indikasi: r.indikasi,
    isPreOp: r.is_pre_op,
    jenisTindakan: r.jenis_tindakan || undefined,
    prioritas: r.prioritas,
    status: r.status,
    waktuDaftar: new Date(r.created_at).toLocaleString("id-ID"),
  }));
}

export async function getDisplayScreens(): Promise<DisplayScreen[]> {
  const supabase = await createClient();

  const { data: screens, error } = await supabase
    .from("display_screens")
    .select(`
      id,
      nama,
      token,
      mode,
      pengumuman,
      is_active,
      buildings (
        nama
      ),
      units (
        nama
      )
    `)
    .order("created_at", { ascending: true });

  if (error || !screens) return [];

  return screens.map((s: any) => ({
    id: s.id,
    nama: s.nama,
    token: s.token,
    gedungNama: s.buildings?.nama || "Gedung Utama",
    unitNama: s.units?.nama || "Umum",
    mode: s.mode,
    pengumuman: s.pengumuman || "",
    isActive: s.is_active,
  }));
}

export async function getDisplayScreenByToken(token: string): Promise<DisplayScreen | null> {
  const all = await getDisplayScreens();
  return all.find((s) => s.token === token) || null;
}
