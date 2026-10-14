import { createClient } from "@/lib/supabase/server";
import { QueueTicketItem, UnitQueueItem, TriageTicket } from "@/lib/types";

export async function getActiveTicketsByPatient(patientId: string): Promise<QueueTicketItem[]> {
  const supabase = await createClient();

  const { data: tickets, error } = await supabase
    .from("queue_tickets")
    .select(`
      id,
      nomor_tiket,
      tanggal,
      status,
      urutan,
      prioritas,
      triage,
      estimasi_menit,
      created_at,
      units (
        id,
        nama,
        slug,
        lantai,
        buildings (
          nama
        )
      ),
      doctor_sessions (
        sesi,
        doctors (
          nama
        )
      )
    `)
    .eq("patient_id", patientId)
    .in("status", ["menunggu", "dipanggil", "dilayani"])
    .order("created_at", { ascending: false });

  if (error || !tickets) {
    return [];
  }

  // Count tickets ahead in the same unit
  return Promise.all(
    tickets.map(async (t: any) => {
      const { count: aheadCount } = await supabase
        .from("queue_tickets")
        .select("*", { count: "exact", head: true })
        .eq("unit_id", t.units?.id)
        .eq("tanggal", t.tanggal)
        .eq("status", "menunggu")
        .lt("urutan", t.urutan);

      // Fetch queue events for timeline
      const { data: events } = await supabase
        .from("queue_events")
        .select("created_at, aksi, catatan")
        .eq("ticket_id", t.id)
        .order("created_at", { ascending: true });

      const timeline = (events && events.length > 0)
        ? events.map((e: any) => ({
            waktu: new Date(e.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
            judul: e.aksi.toUpperCase(),
            keterangan: e.catatan || `Aksi ${e.aksi} tercatat pada antrean.`,
            selesai: true,
          }))
        : [
            {
              waktu: new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              judul: "Tiket Diterbitkan",
              keterangan: "Nomor antrean berhasil dibuat di sistem Antrean Sehat.",
              selesai: true,
            },
            {
          waktu: t.status === "dipanggil" || t.status === "dilayani" || t.status === "selesai" ? "Aktif" : "--:--",
          judul: "Panggilan Loket / Poli",
          keterangan: "Pasien dipanggil menuju ruang atau loket pelayanan.",
          selesai: t.status === "dipanggil" || t.status === "dilayani" || t.status === "selesai",
        },
        {
          waktu: t.status === "dilayani" || t.status === "selesai" ? "Sedang berjalan" : "--:--",
          judul: "Sedang Dilayani",
          keterangan: "Pemeriksaan medis atau proses administrasi berlangsung.",
          selesai: t.status === "dilayani" || t.status === "selesai",
        },
        {
          waktu: t.status === "selesai" ? "Selesai" : "--:--",
          judul: "Pelayanan Selesai",
          keterangan: "Pelayanan tuntas dan resep/instruksi diberikan.",
          selesai: t.status === "selesai",
        },
      ];

      return {
        id: t.id,
        nomorTiket: t.nomor_tiket,
        unitSlug: t.units?.slug || "poliklinik",
        unitNama: t.units?.nama || "Poliklinik",
        buildingNama: t.units?.buildings?.nama || "Gedung Utama",
        ruangLokasi: t.units?.lantai || "Lantai 1",
        dokterNama: t.doctor_sessions?.doctors?.nama,
        sesiNama: t.doctor_sessions?.sesi ? `Sesi ${t.doctor_sessions.sesi}` : undefined,
        tanggal: t.tanggal,
        waktuBooking: new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        status: t.status,
        urutan: t.urutan,
        sisaAntreanDiDepan: aheadCount || 0,
        estimasiMenit: t.estimasi_menit || 15,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(t.nomor_tiket)}`,
        prioritas: t.prioritas,
        triageLevel: t.triage,
        timeline,
      };
    })
  );
}

export async function getTicketById(ticketId: string): Promise<QueueTicketItem | null> {
  const supabase = await createClient();

  const { data: rawTicket, error } = await supabase
    .from("queue_tickets")
    .select(`
      id,
      nomor_tiket,
      tanggal,
      status,
      urutan,
      prioritas,
      triage,
      estimasi_menit,
      created_at,
      units (
        id,
        nama,
        slug,
        lantai,
        buildings (
          nama
        )
      ),
      doctor_sessions (
        sesi,
        doctors (
          nama
        )
      )
    `)
    .eq("id", ticketId)
    .maybeSingle();

  if (error || !rawTicket) {
    return null;
  }

  const t: any = rawTicket;
  const unit = Array.isArray(t.units) ? t.units[0] : t.units;
  const building = unit?.buildings ? (Array.isArray(unit.buildings) ? unit.buildings[0] : unit.buildings) : null;
  const session = Array.isArray(t.doctor_sessions) ? t.doctor_sessions[0] : t.doctor_sessions;
  const doctor = session?.doctors ? (Array.isArray(session.doctors) ? session.doctors[0] : session.doctors) : null;

  const { count: aheadCount } = await supabase
    .from("queue_tickets")
    .select("*", { count: "exact", head: true })
    .eq("unit_id", unit?.id)
    .eq("tanggal", t.tanggal)
    .eq("status", "menunggu")
    .lt("urutan", t.urutan);

  const { data: events } = await supabase
    .from("queue_events")
    .select("created_at, aksi, catatan")
    .eq("ticket_id", t.id)
    .order("created_at", { ascending: true });

  const timeline = (events && events.length > 0)
    ? events.map((e) => ({
        waktu: new Date(e.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        judul: e.aksi.toUpperCase(),
        keterangan: e.catatan || `Aksi ${e.aksi} tercatat pada antrean.`,
        selesai: true,
      }))
    : [
        {
          waktu: new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          judul: "Tiket Diterbitkan",
          keterangan: "Nomor antrean berhasil dibuat di sistem Antrean Sehat.",
          selesai: true,
        },
        {
          waktu: t.status === "dipanggil" || t.status === "dilayani" || t.status === "selesai" ? "Aktif" : "--:--",
          judul: "Panggilan Loket / Poli",
          keterangan: "Pasien dipanggil menuju ruang atau loket pelayanan.",
          selesai: t.status === "dipanggil" || t.status === "dilayani" || t.status === "selesai",
        },
        {
          waktu: t.status === "dilayani" || t.status === "selesai" ? "Sedang berjalan" : "--:--",
          judul: "Sedang Dilayani",
          keterangan: "Pemeriksaan medis atau proses administrasi berlangsung.",
          selesai: t.status === "dilayani" || t.status === "selesai",
        },
        {
          waktu: t.status === "selesai" ? "Selesai" : "--:--",
          judul: "Pelayanan Selesai",
          keterangan: "Pelayanan tuntas dan resep/instruksi diberikan.",
          selesai: t.status === "selesai",
        },
      ];

  return {
    id: t.id,
    nomorTiket: t.nomor_tiket,
    unitSlug: unit?.slug || "poliklinik",
    unitNama: unit?.nama || "Poliklinik",
    buildingNama: building?.nama || "Gedung Utama",
    ruangLokasi: unit?.lantai || "Lantai 1",
    dokterNama: doctor?.nama,
    sesiNama: session?.sesi ? `Sesi ${session.sesi}` : undefined,
    tanggal: t.tanggal,
    waktuBooking: new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    status: t.status,
    urutan: t.urutan,
    sisaAntreanDiDepan: aheadCount || 0,
    estimasiMenit: t.estimasi_menit || 15,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(t.nomor_tiket)}`,
    prioritas: t.prioritas,
    triageLevel: t.triage,
    timeline,
  };
}

export async function getUnitQueue(unitSlug: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: unit } = await supabase
    .from("units")
    .select("id, nama, slug")
    .eq("slug", unitSlug)
    .maybeSingle();

  if (!unit) {
    return {
      calling: null,
      waiting: [],
      skipped: [],
      sedangDilayani: null,
      antreanBerikutnya: [],
      antreanDilewati: [],
    };
  }

  const { data: tickets } = await supabase
    .from("queue_tickets")
    .select(`
      id,
      nomor_tiket,
      status,
      urutan,
      prioritas,
      triage,
      jumlah_panggilan,
      created_at,
      profiles (
        nama_lengkap
      )
    `)
    .eq("unit_id", unit.id)
    .eq("tanggal", today)
    .order("urutan", { ascending: true });

  const callingTicket = tickets?.find((t) => t.status === "dipanggil" || t.status === "dilayani");
  const waitingTickets = tickets?.filter((t) => t.status === "menunggu") || [];
  const skippedTickets = tickets?.filter((t) => t.status === "dilewati") || [];

  const mapItem = (t: any): UnitQueueItem => ({
    id: t.id,
    nomorTiket: t.nomor_tiket,
    namaPasien: t.profiles?.nama_lengkap || "Pasien",
    noRm: t.profiles?.no_rm || "RM-BELUM-ADA",
    kategoriPrioritas: t.prioritas,
    triageLevel: t.triage,
    status: t.status,
    panggilanKe: t.jumlah_panggilan || 0,
    waktuBooking: new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    estimasiTunggu: `${t.urutan * 10} mnt`,
  });

  const calling = callingTicket ? mapItem(callingTicket) : null;
  const waiting = waitingTickets.map(mapItem);
  const skipped = skippedTickets.map(mapItem);

  return {
    calling,
    waiting,
    skipped,
    sedangDilayani: calling,
    antreanBerikutnya: waiting,
    antreanDilewati: skipped,
  };
}

export async function getTriageTickets(): Promise<TriageTicket[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: tickets } = await supabase
    .from("queue_tickets")
    .select(`
      id,
      nomor_tiket,
      status,
      triage,
      created_at,
      profiles (
        nama_lengkap,
        tanggal_lahir
      )
    `)
    .not("triage", "is", null)
    .eq("tanggal", today)
    .order("created_at", { ascending: false });

  if (!tickets) return [];

  return tickets.map((t: any) => {
    const birthYear = t.profiles?.tanggal_lahir ? new Date(t.profiles.tanggal_lahir).getFullYear() : 1990;
    const usia = new Date().getFullYear() - birthYear;

    return {
      id: t.id,
      nomorTiket: t.nomor_tiket,
      namaPasien: t.profiles?.nama_lengkap || "Pasien IGD",
      usia,
      keluhan: "Pemeriksaan IGD",
      level: t.triage || "hijau",
      tandaVital: {
        tensi: "120/80",
        nadi: "80 x/mnt",
        rr: "18 x/mnt",
        spo2: "98%",
        suhu: "36.6 °C",
      },
      waktuMasuk: new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      status: t.status,
      perawatPemeriksa: "Perawat Triase",
    };
  });
}
