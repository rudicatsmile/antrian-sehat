// ============================================================
// ANTREAN SEHAT - DOMAIN & APPLICATION TYPES
// Connected to Supabase PostgreSQL Schema
// ============================================================

export type UserRole = "pasien" | "petugas" | "admin";
export type UnitKind =
  | "pendaftaran"
  | "poliklinik"
  | "triase"
  | "laboratorium"
  | "radiologi"
  | "farmasi"
  | "kasir"
  | "rawat_inap";
export type TriageLevel = "merah" | "kuning" | "hijau";
export type PriorityCategory = "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency";
export type TicketStatus = "menunggu" | "dipanggil" | "dilayani" | "selesai" | "dilewati" | "batal";
export type SessionSlot = "pagi" | "siang" | "sore";
export type PaymentStatus = "belum_bayar" | "pending" | "settlement" | "expire" | "cancel" | "deny" | "failure" | "refund";
export type InpatientStatus = "menunggu_kamar" | "dirawat" | "pre_op" | "dibatalkan" | "selesai";
export type DisplayMode = "antrean" | "info" | "bergantian";

// ============================================================
// 1. LAYANAN & UNIT
// ============================================================
export interface UnitLayanan {
  id: string;
  kode: string;
  nama: string;
  slug: string;
  buildingId: string;
  buildingName: string;
  gedung?: string;
  lantai: string;
  kind: UnitKind;
  kategori?: string;
  deskripsi: string;
  jamBuka: string;
  jamTutup: string;
  defaultServiceMinutes: number;
  persyaratan: string[];
  estimasiTungguMenit: number;
  sisaKuotaHariIni: number;
  totalKuotaHariIni: number;
  loketAktif: number;
  isActive: boolean;
}

// ============================================================
// 2. DOKTER & JADWAL SESI
// ============================================================
export interface DoctorSession {
  id: string;
  sesi: SessionSlot;
  hari?: string;
  jamMulai: string;
  jamSelesai: string;
  kuota: number;
  terpakai: number;
  isAktif: boolean;
}

export interface Doctor {
  id: string;
  nama: string;
  gelar: string;
  spesialisasi: string;
  unitSlug: string;
  unitNama: string;
  unit?: string;
  sip?: string;
  fotoUrl: string;
  jadwalHari: string[];
  sessions: DoctorSession[];
  ruangPraktek: string;
}

// ============================================================
// 3. PASIEN & PROFIL
// ============================================================
export interface PatientProfile {
  id: string;
  nik: string;
  namaLengkap: string;
  noWhatsapp: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  alamat: string;
  noRm: string;
  kategoriPrioritas: PriorityCategory;
  dokumenPrioritasName?: string;
  fotoUrl?: string;
}

// ============================================================
// 4. TIKET ANTREAN & TIMELINE
// ============================================================
export interface QueueTicketItem {
  id: string;
  nomorTiket: string;
  unitSlug: string;
  unitNama: string;
  buildingNama: string;
  ruangLokasi: string;
  dokterNama?: string;
  sesiNama?: string;
  tanggal: string;
  waktuBooking: string;
  status: TicketStatus;
  urutan: number;
  sisaAntreanDiDepan: number;
  estimasiMenit: number;
  qrCodeUrl: string;
  prioritas: PriorityCategory;
  triageLevel?: TriageLevel;
  timeline: {
    waktu: string;
    judul: string;
    keterangan: string;
    selesai: boolean;
  }[];
}

// ============================================================
// 5. PEMBAYARAN & INVOICE
// ============================================================
export interface InvoiceItemDetail {
  id: string;
  namaItem: string;
  qty: number;
  hargaSatuan: number;
  subtotal: number;
}

export interface InvoiceItem {
  id: string;
  invoiceNo: string;
  ticketNomor?: string;
  unitNama: string;
  tanggal: string;
  totalAmount: number;
  status: PaymentStatus;
  snapToken?: string;
  metodeBayar?: "midtrans" | "tunai";
  paidAt?: string;
  items: InvoiceItemDetail[];
}

export interface RiwayatKunjunganItem {
  id: string;
  nomorTiket: string;
  unitNama: string;
  dokterNama: string;
  tanggal: string;
  status: string;
  diagnosaUtama?: string;
  tindakan?: string;
  resepObat?: string[];
}

// ============================================================
// 6. PETUGAS, TRIASE, & OPERASIONAL
// ============================================================
export interface StaffPatientRecord {
  id: string;
  nik: string;
  namaLengkap: string;
  noWhatsapp: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  alamat: string;
  noRm?: string;
  kategoriPrioritas: PriorityCategory;
  waktuDaftar: string;
}

export interface PatientChangeLog {
  id: string;
  patientId: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  createdAt: string;
}

export interface TriageTicket {
  id: string;
  nomorTiket: string;
  namaPasien: string;
  usia: number;
  keluhan: string;
  level: TriageLevel;
  tandaVital: {
    tensi: string;
    nadi: string;
    rr: string;
    spo2: string;
    suhu: string;
  };
  waktuMasuk: string;
  status: TicketStatus;
  perawatPemeriksa: string;
}

export interface UnitQueueItem {
  id: string;
  nomorTiket: string;
  namaPasien: string;
  noRm?: string;
  kategoriPrioritas: PriorityCategory;
  triageLevel?: TriageLevel;
  status: TicketStatus;
  panggilanKe: number;
  waktuBooking: string;
  estimasiTunggu: string;
}

export interface RoomBed {
  id: string;
  namaKamar: string;
  kelas: "Kelas 1" | "Kelas 2" | "Kelas 3" | "VIP";
  gedung: string;
  kapasitas: number;
  terisi: number;
}

export interface InpatientRequest {
  id: string;
  namaPasien: string;
  noRm: string;
  kelasDiminta: string;
  indikasi: string;
  isPreOp: boolean;
  jenisTindakan?: string;
  prioritas: PriorityCategory;
  status: InpatientStatus;
  waktuDaftar: string;
}

export interface DisplayScreen {
  id: string;
  nama: string;
  token: string;
  gedungNama: string;
  unitNama: string;
  mode: DisplayMode;
  pengumuman: string;
  isActive: boolean;
}

// ============================================================
// 7. ADMIN, STATISTIK, & INTEGRASI
// ============================================================
export interface AdminStats {
  totalKunjunganHariIni: number;
  totalKunjunganMingguan: number;
  totalPendapatanHariIni: number;
  rataRataWaktuTungguMenit: number;
  persentaseBookingOnline: number;
  kepuasanPasien: number;
}

export interface ChartKunjunganGedung {
  jam: string;
  gedungA: number;
  gedungB: number;
  gedungC: number;
}

export interface UserManagementRecord {
  id: string;
  nama: string;
  email: string;
  noWhatsapp: string;
  role: UserRole;
  assignedUnits: string[];
  status: "aktif" | "nonaktif";
  lastLogin: string;
}

export interface NotificationLogRecord {
  id: string;
  nomorTujuan: string;
  namaPasien: string;
  jenisPesan: string;
  isiPesan: string;
  status: "terkirim" | "antrean" | "gagal";
  waktuKirim: string;
  gatewayProvider: string;
}

export interface IntegrationStatus {
  service: string;
  nama: string;
  status: "terhubung" | "gangguan" | "nonaktif";
  latencyMs: number;
  lastChecked: string;
  deskripsi: string;
}
