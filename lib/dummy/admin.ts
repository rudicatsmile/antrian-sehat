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
  role: "admin" | "petugas" | "pasien";
  assignedUnits: string[];
  status: "aktif" | "nonaktif";
  lastLogin: string;
}

export interface NotificationLogRecord {
  id: string;
  nomorTujuan: string;
  namaPasien: string;
  jenisPesan: "Konfirmasi Booking" | "Giliran Hampir Tiba" | "Panggilan Loket" | "Pembayaran Lunas" | "Hasil Lab Siap";
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

export const DUMMY_ADMIN_STATS: AdminStats = {
  totalKunjunganHariIni: 486,
  totalKunjunganMingguan: 3210,
  totalPendapatanHariIni: 42850000,
  rataRataWaktuTungguMenit: 14.5,
  persentaseBookingOnline: 68.4,
  kepuasanPasien: 94.2,
};

export const DUMMY_CHART_KUNJUNGAN: ChartKunjunganGedung[] = [
  { jam: "07:00", gedungA: 45, gedungB: 12, gedungC: 20 },
  { jam: "08:00", gedungA: 95, gedungB: 24, gedungC: 48 },
  { jam: "09:00", gedungA: 130, gedungB: 35, gedungC: 72 },
  { jam: "10:00", gedungA: 115, gedungB: 28, gedungC: 65 },
  { jam: "11:00", gedungA: 80, gedungB: 22, gedungC: 45 },
  { jam: "12:00", gedungA: 35, gedungB: 18, gedungC: 25 },
  { jam: "13:00", gedungA: 70, gedungB: 25, gedungC: 40 },
  { jam: "14:00", gedungA: 60, gedungB: 20, gedungC: 32 },
];

export const DUMMY_USERS_MANAGEMENT: UserManagementRecord[] = [
  {
    id: "usr-1",
    nama: "dr. Hendra Wijaya, Sp.PD",
    email: "hendra.wijaya@rsud.go.id",
    noWhatsapp: "6281122334455",
    role: "petugas",
    assignedUnits: ["Poliklinik Penyakit Dalam"],
    status: "aktif",
    lastLogin: "14 Okt 2026, 07:45 WIB",
  },
  {
    id: "usr-2",
    nama: "Ns. Maya Astuti, S.Kep",
    email: "maya.astuti@rsud.go.id",
    noWhatsapp: "6281234567801",
    role: "petugas",
    assignedUnits: ["Loket Pendaftaran & Informasi"],
    status: "aktif",
    lastLogin: "14 Okt 2026, 07:15 WIB",
  },
  {
    id: "usr-3",
    nama: "Ns. Bambang Tri, S.Kep",
    email: "bambang.tri@rsud.go.id",
    noWhatsapp: "6281234567802",
    role: "petugas",
    assignedUnits: ["Triase IGD"],
    status: "aktif",
    lastLogin: "14 Okt 2026, 06:50 WIB",
  },
  {
    id: "usr-4",
    nama: "Ahmad Zulkarnain, S.Kom (IT RS)",
    email: "admin.it@rsud.go.id",
    noWhatsapp: "6281234567899",
    role: "admin",
    assignedUnits: ["Seluruh Unit & Gedung"],
    status: "aktif",
    lastLogin: "14 Okt 2026, 08:30 WIB",
  },
];

export const DUMMY_NOTIFICATION_LOGS: NotificationLogRecord[] = [
  {
    id: "notif-1",
    nomorTujuan: "6281298765432",
    namaPasien: "Budi Santoso",
    jenisPesan: "Panggilan Loket",
    isiPesan: "Nomor POL-D-014 dipanggil. Silakan menuju Ruang Periksa 201, Gedung A Lantai 2.",
    status: "terkirim",
    waktuKirim: "14 Okt 2026, 09:12 WIB",
    gatewayProvider: "Waba Provider Indo (Official API)",
  },
  {
    id: "notif-2",
    nomorTujuan: "6281599887766",
    namaPasien: "Agus Setiawan",
    jenisPesan: "Giliran Hampir Tiba",
    isiPesan: "Nomor Anda POL-D-015 tinggal 1 antrean lagi. Mohon bersiap di ruang tunggu Poli Lantai 2.",
    status: "terkirim",
    waktuKirim: "14 Okt 2026, 09:10 WIB",
    gatewayProvider: "Waba Provider Indo (Official API)",
  },
  {
    id: "notif-3",
    nomorTujuan: "6281311223344",
    namaPasien: "Siti Aminah",
    jenisPesan: "Konfirmasi Booking",
    isiPesan: "Terima kasih, Ibu Siti. Booking Anda untuk Poliklinik Kebidanan tanggal 15 Okt sesi pagi telah kami terima.",
    status: "terkirim",
    waktuKirim: "14 Okt 2026, 08:45 WIB",
    gatewayProvider: "Waba Provider Indo (Official API)",
  },
];

export const DUMMY_INTEGRATIONS: IntegrationStatus[] = [
  {
    service: "wa_gateway",
    nama: "WhatsApp Business API Gateway",
    status: "terhubung",
    latencyMs: 142,
    lastChecked: "14 Okt 2026, 09:15 WIB",
    deskripsi: "Mengirim OTP NIK, pengingat antrean H-1, notifikasi panggilan loket, dan resi tagihan.",
  },
  {
    service: "midtrans",
    nama: "Midtrans Payment Gateway (Snap & Core)",
    status: "terhubung",
    latencyMs: 198,
    lastChecked: "14 Okt 2026, 09:14 WIB",
    deskripsi: "Layanan pembayaran online mandiri melalui Virtual Account, QRIS Gopay/ShopeePay, dan Kartu.",
  },
  {
    service: "emr_fhir",
    nama: "Integrasi Rekam Medis Elektronik (FHIR-lite)",
    status: "terhubung",
    latencyMs: 310,
    lastChecked: "14 Okt 2026, 09:10 WIB",
    deskripsi: "Sinkronisasi demografi pasien dan status encounter kunjungan rawat jalan.",
  },
];
