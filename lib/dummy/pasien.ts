export interface PatientProfile {
  id: string;
  nik: string;
  namaLengkap: string;
  noWhatsapp: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  alamat: string;
  noRm: string;
  kategoriPrioritas: "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency";
  dokumenPrioritasName?: string;
  fotoUrl?: string;
}

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
  status: "menunggu" | "dipanggil" | "dilayani" | "selesai" | "dilewati" | "batal";
  urutan: number;
  sisaAntreanDiDepan: number;
  estimasiMenit: number;
  qrCodeUrl: string;
  prioritas: "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency";
  triageLevel?: "merah" | "kuning" | "hijau";
  timeline: {
    waktu: string;
    judul: string;
    keterangan: string;
    selesai: boolean;
  }[];
}

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
  status: "belum_bayar" | "pending" | "settlement" | "expire" | "cancel";
  snapToken?: string;
  metodeBayar?: "midtrans" | "tunai";
  paidAt?: string;
  items: InvoiceItemDetail[];
}

export const CURRENT_PATIENT: PatientProfile = {
  id: "pat-budi-01",
  nik: "3271041508560002",
  namaLengkap: "Budi Santoso",
  noWhatsapp: "6281298765432",
  tanggalLahir: "1956-08-15",
  jenisKelamin: "L",
  alamat: "Jl. Dahlia No. 42, RT 03/RW 05, Kel. Sukamaju, Kec. Cilodong, Depok",
  noRm: "RM-2024-004812",
  kategoriPrioritas: "lansia",
  dokumenPrioritasName: "KTP_Surat_Lansia_Budi.pdf",
};

export const DUMMY_ACTIVE_TICKETS: QueueTicketItem[] = [
  {
    id: "tkt-pol-d-014",
    nomorTiket: "POL-D-014",
    unitSlug: "poliklinik-penyakit-dalam",
    unitNama: "Poliklinik Penyakit Dalam",
    buildingNama: "Gedung A (Rawat Jalan)",
    ruangLokasi: "Ruang Periksa 201, Lantai 2",
    dokterNama: "dr. Hendra Wijaya, Sp.PD",
    sesiNama: "Sesi Pagi (08:00 - 11:30)",
    tanggal: "2026-10-14",
    waktuBooking: "07:15 WIB",
    status: "dipanggil",
    urutan: 14,
    sisaAntreanDiDepan: 0,
    estimasiMenit: 0,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=POL-D-014",
    prioritas: "lansia",
    timeline: [
      { waktu: "07:15 WIB", judul: "Booking Terkonfirmasi", keterangan: "Tiket diterbitkan melalui aplikasi online", selesai: true },
      { waktu: "08:10 WIB", judul: "Pasien Tiba & Check-in", keterangan: "Verifikasi kedatangan di Loket Gedung A", selesai: true },
      { waktu: "08:45 WIB", judul: "Masuk Daftar Antrean Poli", keterangan: "Menunggu giliran di Ruang Tunggu Lantai 2", selesai: true },
      { waktu: "09:12 WIB", judul: "Dipanggil ke Ruang Periksa", keterangan: "Silakan menuju Ruang Periksa 201 dr. Hendra Wijaya", selesai: true },
    ],
  },
  {
    id: "tkt-lab-021",
    nomorTiket: "LAB-021",
    unitSlug: "laboratorium",
    unitNama: "Laboratorium Patologi Klinik",
    buildingNama: "Gedung C (Penunjang Medis)",
    ruangLokasi: "Loket Pengambilan Sampel 2, Lantai 1",
    tanggal: "2026-10-14",
    waktuBooking: "08:30 WIB",
    status: "menunggu",
    urutan: 21,
    sisaAntreanDiDepan: 2,
    estimasiMenit: 10,
    qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=LAB-021",
    prioritas: "lansia",
    timeline: [
      { waktu: "08:30 WIB", judul: "Rujukan Lab Dibuat", keterangan: "Permintaan dari Poliklinik Penyakit Dalam", selesai: true },
      { waktu: "08:45 WIB", judul: "Menunggu Panggilan Sampel", keterangan: "2 antrean di depan Anda di Loket 2 Gedung C", selesai: false },
      { waktu: "--:-- WIB", judul: "Pemeriksaan Spesimen", keterangan: "Proses uji lab darah lengkap & urin", selesai: false },
      { waktu: "--:-- WIB", judul: "Hasil Siap Diambil", keterangan: "Notifikasi WA dikirim saat hasil siap", selesai: false },
    ],
  },
];

export const DUMMY_INVOICES: InvoiceItem[] = [
  {
    id: "inv-2025-000521",
    invoiceNo: "INV-2025-000521",
    ticketNomor: "POL-D-014",
    unitNama: "Poliklinik Penyakit Dalam & Laboratorium",
    tanggal: "14 Oktober 2026",
    totalAmount: 185000,
    status: "belum_bayar",
    items: [
      { id: "it-1", namaItem: "Konsultasi & Pemeriksaan Dokter Spesialis Penyakit Dalam", qty: 1, hargaSatuan: 75000, subtotal: 75000 },
      { id: "it-2", namaItem: "Pemeriksaan Hematologi Lengkap (Darah Rutin)", qty: 1, hargaSatuan: 65000, subtotal: 65000 },
      { id: "it-3", namaItem: "Pemeriksaan Gula Darah Sewaktu (GDS)", qty: 1, hargaSatuan: 25000, subtotal: 25000 },
      { id: "it-4", namaItem: "Biaya Administrasi & Rekam Medis Digital", qty: 1, hargaSatuan: 20000, subtotal: 20000 },
    ],
  },
  {
    id: "inv-2025-000412",
    invoiceNo: "INV-2025-000412",
    ticketNomor: "POL-D-008",
    unitNama: "Poliklinik Penyakit Dalam",
    tanggal: "28 September 2026",
    totalAmount: 95000,
    status: "settlement",
    metodeBayar: "midtrans",
    paidAt: "28 September 2026, 11:20 WIB",
    items: [
      { id: "it-5", namaItem: "Konsultasi Dokter Spesialis Penyakit Dalam", qty: 1, hargaSatuan: 75000, subtotal: 75000 },
      { id: "it-6", namaItem: "Administrasi Layanan Rawat Jalan", qty: 1, hargaSatuan: 20000, subtotal: 20000 },
    ],
  },
];

export const DUMMY_RIWAYAT_KUNJUNGAN = [
  {
    id: "rw-1",
    tanggal: "28 September 2026",
    unit: "Poliklinik Penyakit Dalam",
    dokter: "dr. Hendra Wijaya, Sp.PD",
    tiket: "POL-D-008",
    statusLayanan: "Selesai",
    catatan: "Kontrol gula darah rutin dan evaluasi tensi berkala.",
    biaya: 95000,
  },
  {
    id: "rw-2",
    tanggal: "12 Agustus 2026",
    unit: "Instalasi Radiologi",
    dokter: "dr. Hendra Wijaya, Sp.PD",
    tiket: "RAD-XRAY-003",
    statusLayanan: "Selesai",
    catatan: "Foto Rontgen Thorax PA. Hasil terlampir di rekam medis digital.",
    biaya: 140000,
  },
  {
    id: "rw-3",
    tanggal: "15 Juli 2026",
    unit: "Farmasi Rawat Jalan",
    dokter: "dr. Hendra Wijaya, Sp.PD",
    tiket: "FAR-RC-012",
    statusLayanan: "Selesai",
    catatan: "Pengambilan paket obat hipertensi & suplemen vitamin.",
    biaya: 180000,
  },
];
