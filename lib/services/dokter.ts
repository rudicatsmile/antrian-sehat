import { createClient } from "@/lib/supabase/server";
import { Doctor, DoctorSession } from "@/lib/types";

const DOCTOR_PHOTOS: Record<string, { fotoUrl: string; gelar: string; ruangPraktek: string; jadwalHari: string[] }> = {
  "dr. Hendra Wijaya": {
    fotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    gelar: "Sp.PD, FINASIM",
    ruangPraktek: "Ruang Periksa 201, Gedung A Lantai 2",
    jadwalHari: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
  },
  "dr. Ratna Kusumawati": {
    fotoUrl: "https://images.unsplash.com/photo-1594824813576-95fc1d60067b?w=300&auto=format&fit=crop&q=80",
    gelar: "Sp.A",
    ruangPraktek: "Ruang Periksa 205, Gedung A Lantai 2",
    jadwalHari: ["Senin", "Rabu", "Kamis", "Sabtu"],
  },
  "dr. Yudi Prasetyo": {
    fotoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80",
    gelar: "Sp.B, FICS",
    ruangPraktek: "Ruang Periksa 302, Gedung A Lantai 3",
    jadwalHari: ["Selasa", "Kamis", "Jumat"],
  },
  "dr. Sari Indah Lestari": {
    fotoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80",
    gelar: "Sp.OG",
    ruangPraktek: "Ruang Periksa 306, Gedung A Lantai 3",
    jadwalHari: ["Senin", "Selasa", "Rabu", "Jumat"],
  },
};

export async function getDokterList(unitSlug?: string): Promise<Doctor[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const query = supabase
    .from("doctors")
    .select(`
      id,
      nama,
      spesialisasi,
      is_active,
      unit_id,
      units (
        id,
        nama,
        slug
      )
    `)
    .eq("is_active", true);

  const { data: doctors, error } = await query;

  if (error || !doctors) {
    console.error("Error fetching doctors:", error);
    return [];
  }

  // Filter by unitSlug if provided
  const filtered = unitSlug
    ? doctors.filter((d: any) => d.units?.slug === unitSlug)
    : doctors;

  // Fetch today's and upcoming sessions for these doctors
  const docIds = filtered.map((d: any) => d.id);
  const { data: sessions } = await supabase
    .from("doctor_sessions")
    .select("id, doctor_id, sesi, jam_mulai, jam_selesai, kuota, terpakai, is_aktif")
    .in("doctor_id", docIds)
    .eq("tanggal", today)
    .eq("is_aktif", true)
    .order("jam_mulai", { ascending: true });

  return filtered.map((d: any) => {
    const meta = DOCTOR_PHOTOS[d.nama] || {
      fotoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80",
      gelar: "Spesialis",
      ruangPraktek: "Ruang Konsultasi Dokter",
      jadwalHari: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
    };

    const docSessions: DoctorSession[] = (sessions || [])
      .filter((s: any) => s.doctor_id === d.id)
      .map((s: any) => ({
        id: s.id,
        sesi: s.sesi,
        hari: "Hari Ini",
        jamMulai: s.jam_mulai.slice(0, 5),
        jamSelesai: s.jam_selesai.slice(0, 5),
        kuota: s.kuota,
        terpakai: s.terpakai,
        isAktif: s.is_aktif,
      }));

    return {
      id: d.id,
      nama: d.nama,
      gelar: meta.gelar,
      spesialisasi: d.spesialisasi,
      unitSlug: d.units?.slug || "poliklinik",
      unitNama: d.units?.nama || "Poliklinik",
      unit: d.units?.nama || "Poliklinik",
      sip: `SIP.${d.id.slice(0, 8).toUpperCase()}`,
      fotoUrl: meta.fotoUrl,
      jadwalHari: meta.jadwalHari,
      ruangPraktek: meta.ruangPraktek,
      sessions: docSessions,
    };
  });
}

export async function getDokterById(id: string): Promise<Doctor | null> {
  const doctors = await getDokterList();
  return doctors.find((d) => d.id === id) || null;
}
