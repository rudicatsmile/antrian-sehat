export interface DoctorSession {
  id: string;
  sesi: "pagi" | "siang" | "sore";
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
  fotoUrl: string;
  jadwalHari: string[]; // e.g. ["Senin", "Rabu", "Jumat"]
  sessions: DoctorSession[];
  ruangPraktek: string;
}

export const DUMMY_DOKTER: Doctor[] = [
  {
    id: "doc-hendra",
    nama: "dr. Hendra Wijaya",
    gelar: "Sp.PD, FINASIM",
    spesialisasi: "Spesialis Penyakit Dalam",
    unitSlug: "poliklinik-penyakit-dalam",
    unitNama: "Poliklinik Penyakit Dalam",
    fotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    jadwalHari: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
    ruangPraktek: "Ruang Periksa 201, Gedung A Lantai 2",
    sessions: [
      {
        id: "ses-h-pagi",
        sesi: "pagi",
        jamMulai: "08:00",
        jamSelesai: "11:30",
        kuota: 25,
        terpakai: 22,
        isAktif: true,
      },
      {
        id: "ses-h-siang",
        sesi: "siang",
        jamMulai: "13:00",
        jamSelesai: "15:30",
        kuota: 20,
        terpakai: 14,
        isAktif: true,
      },
    ],
  },
  {
    id: "doc-ratna",
    nama: "dr. Ratna Kusumawati",
    gelar: "Sp.A",
    spesialisasi: "Spesialis Anak",
    unitSlug: "poliklinik-anak",
    unitNama: "Poliklinik Spesialis Anak",
    fotoUrl: "https://images.unsplash.com/photo-1594824813576-95fc1d60067b?w=300&auto=format&fit=crop&q=80",
    jadwalHari: ["Senin", "Rabu", "Kamis", "Sabtu"],
    ruangPraktek: "Ruang Periksa 205, Gedung A Lantai 2",
    sessions: [
      {
        id: "ses-r-pagi",
        sesi: "pagi",
        jamMulai: "08:30",
        jamSelesai: "12:00",
        kuota: 20,
        terpakai: 19,
        isAktif: true,
      },
      {
        id: "ses-r-sore",
        sesi: "sore",
        jamMulai: "16:00",
        jamSelesai: "18:30",
        kuota: 15,
        terpakai: 8,
        isAktif: true,
      },
    ],
  },
  {
    id: "doc-yudi",
    nama: "dr. Yudi Prasetyo",
    gelar: "Sp.B, FICS",
    spesialisasi: "Spesialis Bedah Umum",
    unitSlug: "poliklinik-bedah",
    unitNama: "Poliklinik Spesialis Bedah",
    fotoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80",
    jadwalHari: ["Selasa", "Kamis", "Jumat"],
    ruangPraktek: "Ruang Periksa 302, Gedung A Lantai 3",
    sessions: [
      {
        id: "ses-y-pagi",
        sesi: "pagi",
        jamMulai: "09:00",
        jamSelesai: "12:00",
        kuota: 15,
        terpakai: 10,
        isAktif: true,
      },
      {
        id: "ses-y-siang",
        sesi: "siang",
        jamMulai: "13:30",
        jamSelesai: "16:00",
        kuota: 15,
        terpakai: 4,
        isAktif: true,
      },
    ],
  },
  {
    id: "doc-sari",
    nama: "dr. Sari Indah Lestari",
    gelar: "Sp.OG",
    spesialisasi: "Spesialis Kebidanan & Kandungan",
    unitSlug: "poliklinik-kandungan",
    unitNama: "Poliklinik Kebidanan & Kandungan",
    fotoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80",
    jadwalHari: ["Senin", "Selasa", "Rabu", "Jumat"],
    ruangPraktek: "Ruang Periksa 306, Gedung A Lantai 3",
    sessions: [
      {
        id: "ses-s-pagi",
        sesi: "pagi",
        jamMulai: "08:00",
        jamSelesai: "11:30",
        kuota: 20,
        terpakai: 18,
        isAktif: true,
      },
      {
        id: "ses-s-siang",
        sesi: "siang",
        jamMulai: "13:00",
        jamSelesai: "15:00",
        kuota: 15,
        terpakai: 6,
        isAktif: true,
      },
    ],
  },
];
