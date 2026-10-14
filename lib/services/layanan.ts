import { createClient } from "@/lib/supabase/server";
import { UnitLayanan } from "@/lib/types";

// Static descriptions and requirements map per unit slug
const UNIT_META: Record<string, { deskripsi: string; persyaratan: string[] }> = {
  pendaftaran: {
    deskripsi: "Pendaftaran pasien baru, penerbitan rekam medis digital, konfirmasi kedatangan (check-in), dan loket cetak tiket manual.",
    persyaratan: [
      "KTP asli atau e-KTP / Kartu Keluarga bagi anak-anak",
      "Nomor WhatsApp aktif untuk penerimaan tiket & notifikasi",
      "Dokumen pendukung untuk prioritas lansia/disabilitas/ibu hamil",
    ],
  },
  "poliklinik-penyakit-dalam": {
    deskripsi: "Pemeriksaan dan penanganan penyakit sistemik dewasa, metabolik, hipertensi, diabetes, dan konsultasi kesehatan menyeluruh.",
    persyaratan: [
      "Rujukan Faskes 1 (Puskesmas/Klinik) jika menggunakan BPJS",
      "Kartu Pasien / Rekam Medis RSUD",
      "Hasil pemeriksaan penunjang terdahulu (jika ada)",
    ],
  },
  "poliklinik-anak": {
    deskripsi: "Layanan tumbuh kembang anak, imunisasi wajib, infeksi pediatrik, gizi anak, dan konsultasi dokter spesialis anak.",
    persyaratan: [
      "Buku KIA (Kesehatan Ibu dan Anak) atau KMS",
      "Kartu Keluarga (KK) yang memuat NIK anak",
      "Surat rujukan Faskes 1 jika menggunakan asuransi",
    ],
  },
  "poliklinik-bedah": {
    deskripsi: "Konsultasi pra-operasi, perawatan luka pascabedah, pengangkatan jahitan, dan tindakan bedah minor terencana.",
    persyaratan: [
      "Surat rujukan dokter faskes perujuk",
      "Hasil rontgen, USG, atau CT-Scan terkait (jika ada)",
      "Kartu identitas dan kartu jaminan kesehatan",
    ],
  },
  "poliklinik-kandungan": {
    deskripsi: "Pemeriksaan kehamilan (antenatal care), USG 4D fetomaternal, program kehamilan, deteksi dini kanker serviks, dan KB.",
    persyaratan: [
      "Buku KIA (pink) jika dalam kondisi hamil",
      "KTP dan Kartu Pasien",
      "Surat rujukan BPJS (bagi pasien BPJS Kesehatan)",
    ],
  },
  "triase-igd": {
    deskripsi: "Pemilahan kegawatdaruratan medis 24 jam dengan klasifikasi Merah (kritis), Kuning (urgent), dan Hijau (stabil).",
    persyaratan: [
      "Tidak ada persyaratan awal untuk kondisi gawat darurat (prioritas penyelamatan nyawa)",
      "Identitas keluarga pengantar (KTP/SIM) dapat dilengkapi setelah pasien tertangani",
    ],
  },
  laboratorium: {
    deskripsi: "Pengambilan sampel darah, urine, feses, kimia klinik, hematologi lengkap, dan analisis mikrobiologi terstandarisasi.",
    persyaratan: [
      "Surat pengantar dokter pemeriksa (formulir permintaan lab)",
      "Puasa 10-12 jam sebelum pemeriksaan untuk panel profil lipid/gula darah puasa",
    ],
  },
  radiologi: {
    deskripsi: "Layanan diagnostik pencitraan rontgen digital (DR), USG Doppler, CT-Scan multi-slice, dan radiografi kontras.",
    persyaratan: [
      "Surat pengantar radiologi dari dokter perujuk",
      "Hasil tes fungsi ginjal (Ureum/Kreatinin) jika menggunakan zat kontras",
      "Pelepasan aksesoris logam sebelum memasuki ruang pemindaian",
    ],
  },
  farmasi: {
    deskripsi: "Penyerahan obat resep rawat jalan, peracikan obat puyer/kapsul, dan konseling informasi obat (KIO) oleh apoteker.",
    persyaratan: [
      "Resep obat asli dari dokter poliklinik atau IGD",
      "Nomor tiket antrean farmasi",
      "Konfirmasi alergi obat kepada petugas farmasi saat verifikasi",
    ],
  },
  kasir: {
    deskripsi: "Pembayaran terpusat tagihan pelayanan rawat jalan, tindakan medis, farmasi, dan administrasi rawat inap.",
    persyaratan: [
      "Kuitansi/rincian tagihan pelayanan dari unit asal",
      "Alat pembayaran resmi: QRIS, Debit/Kredit, atau Tunai",
    ],
  },
  "rawat-inap": {
    deskripsi: "Admisi pasien opname, verifikasi ketersediaan bed (Kelas 1, 2, 3, VIP), dan persiapan tindakan pra-operasi (pre-op).",
    persyaratan: [
      "Surat Pengantar Rawat Inap (SPRI) resmi dari dokter DPJP",
      "KTP pasien dan KTP penanggung jawab/keluarga",
      "Kartu BPJS/Asuransi dan surat jaminan (jika menggunakan asuransi)",
    ],
  },
};

export async function getLayananList(): Promise<UnitLayanan[]> {
  const supabase = await createClient();

  const { data: units, error } = await supabase
    .from("units")
    .select(`
      id,
      kode,
      nama,
      slug,
      kind,
      lantai,
      default_service_minutes,
      jam_buka,
      jam_tutup,
      is_active,
      building_id,
      buildings (
        id,
        nama,
        kode
      )
    `)
    .eq("is_active", true)
    .order("kode", { ascending: true });

  if (error || !units) {
    console.error("Error fetching units:", error);
    return [];
  }

  const today = new Date().toISOString().split("T")[0];

  // Fetch ticket and counter stats for each unit
  const { data: tickets } = await supabase
    .from("queue_tickets")
    .select("unit_id, status")
    .eq("tanggal", today);

  const { data: counters } = await supabase
    .from("counters")
    .select("unit_id, is_open")
    .eq("is_open", true);

  return units.map((u: any) => {
    const meta = UNIT_META[u.slug] || {
      deskripsi: `Layanan ${u.nama} RSUD Sejahtera Sehat.`,
      persyaratan: ["KTP/Identitas resmi", "Nomor WhatsApp aktif"],
    };

    const unitTickets = tickets?.filter((t) => t.unit_id === u.id) || [];
    const waitingTickets = unitTickets.filter((t) => t.status === "menunggu");
    const activeCounters = counters?.filter((c) => c.unit_id === u.id).length || 1;

    const totalKuota = 100;
    const sisaKuota = Math.max(0, totalKuota - unitTickets.length);
    const avgMinutes = u.default_service_minutes || 10;
    const estimasiTunggu = Math.max(5, Math.round((waitingTickets.length * avgMinutes) / Math.max(1, activeCounters)));

    return {
      id: u.id,
      kode: u.kode,
      nama: u.nama,
      slug: u.slug,
      buildingId: u.building_id,
      buildingName: u.buildings?.nama ? `${u.buildings.nama} (${u.buildings.kode})` : "Gedung Utama",
      gedung: u.buildings?.nama ? `${u.buildings.nama} (${u.buildings.kode})` : "Gedung Utama",
      lantai: u.lantai || "Lantai 1",
      kind: u.kind,
      kategori: u.kind,
      deskripsi: meta.deskripsi,
      jamBuka: u.jam_buka ? u.jam_buka.slice(0, 5) : "08:00",
      jamTutup: u.jam_tutup ? u.jam_tutup.slice(0, 5) : "15:00",
      defaultServiceMinutes: u.default_service_minutes || 10,
      persyaratan: meta.persyaratan,
      estimasiTungguMenit: estimasiTunggu,
      sisaKuotaHariIni: sisaKuota,
      totalKuotaHariIni: totalKuota,
      loketAktif: activeCounters,
      isActive: u.is_active,
    };
  });
}

export async function getLayananBySlug(slug: string): Promise<UnitLayanan | null> {
  const all = await getLayananList();
  return all.find((l) => l.slug === slug) || null;
}
