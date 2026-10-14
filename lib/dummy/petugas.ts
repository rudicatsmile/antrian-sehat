export interface StaffPatientRecord {
  id: string;
  nik: string;
  namaLengkap: string;
  noWhatsapp: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  alamat: string;
  noRm?: string;
  kategoriPrioritas: "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency";
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
  level: "merah" | "kuning" | "hijau";
  tandaVital: {
    tensi: string;
    nadi: string;
    rr: string;
    spo2: string;
    suhu: string;
  };
  waktuMasuk: string;
  status: "menunggu" | "dipanggil" | "dilayani" | "selesai" | "dilewati";
  perawatPemeriksa: string;
}

export interface UnitQueueItem {
  id: string;
  nomorTiket: string;
  namaPasien: string;
  kategoriPrioritas: "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency";
  triageLevel?: "merah" | "kuning" | "hijau";
  status: "menunggu" | "dipanggil" | "dilayani" | "selesai" | "dilewati";
  panggilanKe: number; // 0..3
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
  prioritas: "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency";
  status: "menunggu_kamar" | "dirawat" | "pre_op" | "dibatalkan";
  waktuDaftar: string;
}

export interface DisplayScreen {
  id: string;
  nama: string;
  token: string;
  gedungNama: string;
  unitNama: string;
  mode: "antrean" | "info" | "bergantian";
  pengumuman: string;
  isActive: boolean;
  lastSeen: string;
}

export const DUMMY_STAFF_PATIENTS: StaffPatientRecord[] = [
  {
    id: "sp-1",
    nik: "3271041508560002",
    namaLengkap: "Budi Santoso",
    noWhatsapp: "6281298765432",
    tanggalLahir: "1956-08-15",
    jenisKelamin: "L",
    alamat: "Jl. Dahlia No. 42, RT 03/RW 05, Depok",
    noRm: "RM-2024-004812",
    kategoriPrioritas: "lansia",
    waktuDaftar: "14 Okt 2026, 07:30 WIB",
  },
  {
    id: "sp-2",
    nik: "3271054402920005",
    namaLengkap: "Siti Aminah",
    noWhatsapp: "6281311223344",
    tanggalLahir: "1992-02-14",
    jenisKelamin: "P",
    alamat: "Jl. Mawar No. 12, Pancoran Mas, Depok",
    noRm: "RM-2024-005119",
    kategoriPrioritas: "ibu_hamil",
    waktuDaftar: "14 Okt 2026, 08:00 WIB",
  },
  {
    id: "sp-3",
    nik: "3271031904880001",
    namaLengkap: "Agus Setiawan",
    noWhatsapp: "6281599887766",
    tanggalLahir: "1988-04-19",
    jenisKelamin: "L",
    alamat: "Jl. Kenanga No. 8, Beji, Depok",
    noRm: "RM-2024-003920",
    kategoriPrioritas: "disabilitas",
    waktuDaftar: "14 Okt 2026, 08:15 WIB",
  },
  {
    id: "sp-4",
    nik: "3271026011980007",
    namaLengkap: "Dewi Anggraini",
    noWhatsapp: "6281807654321",
    tanggalLahir: "1998-11-20",
    jenisKelamin: "P",
    alamat: "Jl. Melati Raya No. 104, Sawangan, Depok",
    noRm: "RM-2025-001043",
    kategoriPrioritas: "normal",
    waktuDaftar: "14 Okt 2026, 08:45 WIB",
  },
  {
    id: "sp-5",
    nik: "3271010101750003",
    namaLengkap: "Rudi Hartono",
    noWhatsapp: "6281987650123",
    tanggalLahir: "1975-01-01",
    jenisKelamin: "L",
    alamat: "Jl. Raya Bogor KM 31, Cimanggis",
    noRm: "RM-2026-000122",
    kategoriPrioritas: "emergency",
    waktuDaftar: "14 Okt 2026, 09:00 WIB",
  },
];

export const DUMMY_PATIENT_CHANGE_LOGS: PatientChangeLog[] = [
  {
    id: "cl-1",
    patientId: "sp-1",
    fieldName: "Kategori Prioritas",
    oldValue: "normal",
    newValue: "lansia",
    changedBy: "Ns. Maya Astuti (Petugas Loket)",
    createdAt: "14 Okt 2026, 07:35 WIB",
  },
  {
    id: "cl-2",
    patientId: "sp-1",
    fieldName: "Alamat Tinggal",
    oldValue: "Jl. Dahlia No. 12",
    newValue: "Jl. Dahlia No. 42, RT 03/RW 05, Depok",
    changedBy: "Ns. Maya Astuti (Petugas Loket)",
    createdAt: "14 Okt 2026, 07:38 WIB",
  },
];

export const DUMMY_TRIAGE_TICKETS: TriageTicket[] = [
  {
    id: "trg-1",
    nomorTiket: "TRG-M-001",
    namaPasien: "Tn. Bambang Sutrisno",
    usia: 54,
    keluhan: "Nyeri dada tembus punggung, keringat dingin, penurunan kesadaran",
    level: "merah",
    tandaVital: { tensi: "80/50 mmHg", nadi: "135 x/m", rr: "32 x/m", spo2: "88%", suhu: "36.2 °C" },
    waktuMasuk: "09:05 WIB",
    status: "dilayani",
    perawatPemeriksa: "Ns. Bambang Tri, S.Kep",
  },
  {
    id: "trg-2",
    nomorTiket: "TRG-K-003",
    namaPasien: "Rudi Hartono",
    usia: 51,
    keluhan: "Luka robek terbuka paha kanan akibat kecelakaan kerja, perdarahan aktif",
    level: "kuning",
    tandaVital: { tensi: "130/85 mmHg", nadi: "98 x/m", rr: "22 x/m", spo2: "97%", suhu: "36.8 °C" },
    waktuMasuk: "09:12 WIB",
    status: "menunggu",
    perawatPemeriksa: "Ns. Cindy Permata, S.Kep",
  },
  {
    id: "trg-3",
    nomorTiket: "TRG-H-002",
    namaPasien: "An. Farhan Maulana",
    usia: 8,
    keluhan: "Demam 3 hari, batuk pilek, masih aktif minum dan makan",
    level: "hijau",
    tandaVital: { tensi: "100/70 mmHg", nadi: "88 x/m", rr: "20 x/m", spo2: "99%", suhu: "38.1 °C" },
    waktuMasuk: "09:20 WIB",
    status: "menunggu",
    perawatPemeriksa: "Ns. Cindy Permata, S.Kep",
  },
];

export const DUMMY_UNIT_QUEUES: Record<string, {
  sedangDilayani: UnitQueueItem | null;
  antreanBerikutnya: UnitQueueItem[];
  antreanDilewati: UnitQueueItem[];
}> = {
  "poliklinik-penyakit-dalam": {
    sedangDilayani: {
      id: "uq-1",
      nomorTiket: "POL-D-014",
      namaPasien: "Budi Santoso",
      kategoriPrioritas: "lansia",
      status: "dipanggil",
      panggilanKe: 1,
      waktuBooking: "07:15 WIB",
      estimasiTunggu: "Sedang dipanggil",
    },
    antreanBerikutnya: [
      {
        id: "uq-2",
        nomorTiket: "POL-D-015",
        namaPasien: "Agus Setiawan",
        kategoriPrioritas: "disabilitas",
        status: "menunggu",
        panggilanKe: 0,
        waktuBooking: "07:30 WIB",
        estimasiTunggu: "12 menit",
      },
      {
        id: "uq-3",
        nomorTiket: "POL-D-016",
        namaPasien: "Dewi Anggraini",
        kategoriPrioritas: "normal",
        status: "menunggu",
        panggilanKe: 0,
        waktuBooking: "07:45 WIB",
        estimasiTunggu: "24 menit",
      },
      {
        id: "uq-4",
        nomorTiket: "POL-D-017",
        namaPasien: "Ahmad Faisal",
        kategoriPrioritas: "normal",
        status: "menunggu",
        panggilanKe: 0,
        waktuBooking: "08:00 WIB",
        estimasiTunggu: "36 menit",
      },
    ],
    antreanDilewati: [
      {
        id: "uq-skip-1",
        nomorTiket: "POL-D-012",
        namaPasien: "Hendra Gunawan",
        kategoriPrioritas: "normal",
        status: "dilewati",
        panggilanKe: 3,
        waktuBooking: "07:00 WIB",
        estimasiTunggu: "Batas panggil sisa 8 mnt",
      },
    ],
  },
};

export const DUMMY_ROOMS: RoomBed[] = [
  { id: "rm-1", namaKamar: "Melati 201", kelas: "Kelas 1", gedung: "Gedung B Lantai 3", kapasitas: 4, terisi: 3 },
  { id: "rm-2", namaKamar: "Melati 202", kelas: "Kelas 1", gedung: "Gedung B Lantai 3", kapasitas: 4, terisi: 4 },
  { id: "rm-3", namaKamar: "Anggrek 105", kelas: "Kelas 2", gedung: "Gedung B Lantai 2", kapasitas: 6, terisi: 5 },
  { id: "rm-4", namaKamar: "Bougenville 101", kelas: "Kelas 3", gedung: "Gedung B Lantai 2", kapasitas: 8, terisi: 6 },
  { id: "rm-5", namaKamar: "Dahlia 301", kelas: "VIP", gedung: "Gedung B Lantai 4", kapasitas: 2, terisi: 1 },
];

export const DUMMY_INPATIENT_REQUESTS: InpatientRequest[] = [
  {
    id: "in-1",
    namaPasien: "Ny. Ratnawati",
    noRm: "RM-2024-002198",
    kelasDiminta: "Kelas 1",
    indikasi: "Observasi Dengue Hemorrhagic Fever (DHF) Grade II",
    isPreOp: false,
    prioritas: "lansia",
    status: "menunggu_kamar",
    waktuDaftar: "14 Okt 2026, 08:30 WIB",
  },
  {
    id: "in-2",
    namaPasien: "Tn. Joko Widodo",
    noRm: "RM-2023-009123",
    kelasDiminta: "Kelas 2",
    indikasi: "Appendisitis Akut Perforasi",
    isPreOp: true,
    jenisTindakan: "Apendektomi Laparoskopi",
    prioritas: "emergency",
    status: "pre_op",
    waktuDaftar: "14 Okt 2026, 09:00 WIB",
  },
];

export const DUMMY_DISPLAY_SCREENS: DisplayScreen[] = [
  {
    id: "scr-1",
    nama: "TV Ruang Tunggu Poliklinik Lt. 2",
    token: "tv-poli-lt2-a8f9",
    gedungNama: "Gedung A (Rawat Jalan)",
    unitNama: "Poliklinik Penyakit Dalam & Anak",
    mode: "bergantian",
    pengumuman: "Mohon siapkan KTP dan nomor antrean saat mendekati giliran Anda.",
    isActive: true,
    lastSeen: "Baru saja",
  },
  {
    id: "scr-2",
    nama: "TV Ruang Tunggu IGD Pintu Masuk",
    token: "tv-igd-pintu-b2c1",
    gedungNama: "Gedung B (IGD)",
    unitNama: "Triase IGD",
    mode: "antrean",
    pengumuman: "Prioritas penanganan didasarkan pada kegawatan medis pasien.",
    isActive: true,
    lastSeen: "Baru saja",
  },
  {
    id: "scr-3",
    nama: "TV Ruang Farmasi & Apotek",
    token: "tv-farmasi-lt1-c4d3",
    gedungNama: "Gedung C (Penunjang)",
    unitNama: "Farmasi Rawat Jalan",
    mode: "antrean",
    pengumuman: "Obat racik membutuhkan waktu ekstra 15-20 menit untuk keamanan dosis.",
    isActive: true,
    lastSeen: "Baru saja",
  },
];
