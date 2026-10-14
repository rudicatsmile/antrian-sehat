export const APP_NAME = "Antrean Sehat";
export const HOSPITAL_NAME = "RSUD Sejahtera Sehat";
export const HOSPITAL_TAGLINE = "Sistem Antrean & Booking Layanan Kesehatan Terpadu";
export const HOSPITAL_CAMPUS = "Kampus Utama RSUD Sejahtera Sehat";

export const BUILDINGS = [
  { id: "bld-a", kode: "A", nama: "Gedung A", deskripsi: "Rawat Jalan dan Pendaftaran" },
  { id: "bld-b", kode: "B", nama: "Gedung B", deskripsi: "IGD dan Rawat Inap" },
  { id: "bld-c", kode: "C", nama: "Gedung C", deskripsi: "Penunjang Medis (Laboratorium, Radiologi, Farmasi)" },
] as const;

export const UNIT_KINDS = {
  pendaftaran: "Pendaftaran",
  poliklinik: "Poliklinik",
  triase: "Triase IGD",
  laboratorium: "Laboratorium",
  radiologi: "Radiologi",
  farmasi: "Farmasi",
  kasir: "Kasir",
  rawat_inap: "Rawat Inap",
} as const;

export const TRIAGE_LEVELS = {
  merah: {
    label: "Merah (Resusitasi/Kritis)",
    deskripsi: "Kondisi mengancam jiwa, penanganan segera tanpa penundaan",
    color: "hsl(0, 72%, 51%)",
    bg: "bg-red-50 text-red-700 border-red-200",
    badge: "bg-red-600 text-white",
    dot: "bg-red-500",
  },
  kuning: {
    label: "Kuning (Urgent/Gawat)",
    deskripsi: "Kondisi darurat tetapi tanda vital masih stabil, penanganan cepat",
    color: "hsl(45, 93%, 47%)",
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    badge: "bg-amber-500 text-white",
    dot: "bg-amber-500",
  },
  hijau: {
    label: "Hijau (Non-Urgent/Tidak Gawat)",
    deskripsi: "Kondisi tidak gawat dan stabil, dapat menunggu antrean",
    color: "hsl(142, 71%, 35%)",
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    badge: "bg-emerald-600 text-white",
    dot: "bg-emerald-500",
  },
} as const;

export const PRIORITY_CATEGORIES = {
  normal: { label: "Umum / Normal", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  lansia: { label: "Lansia (> 60 Tahun)", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  disabilitas: { label: "Disabilitas / Khusus", badge: "bg-purple-50 text-purple-700 border-purple-200" },
  ibu_hamil: { label: "Ibu Hamil", badge: "bg-pink-50 text-pink-700 border-pink-200" },
  emergency: { label: "Darurat / Cito", badge: "bg-red-50 text-red-700 border-red-200" },
} as const;

export const TICKET_STATUSES = {
  menunggu: { label: "Menunggu", color: "bg-slate-100 text-slate-700" },
  dipanggil: { label: "Dipanggil", color: "bg-teal-100 text-teal-800 animate-pulse font-semibold" },
  dilayani: { label: "Sedang Dilayani", color: "bg-blue-100 text-blue-800" },
  selesai: { label: "Selesai", color: "bg-emerald-100 text-emerald-800" },
  dilewati: { label: "Dilewati", color: "bg-amber-100 text-amber-800" },
  batal: { label: "Batal", color: "bg-rose-100 text-rose-800" },
} as const;
