import Link from "next/link";
import { Stethoscope, FlaskConical, FileImage, Pill, Bed, ChevronRight, ShieldCheck, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BOOKING_SERVICES = [
  {
    slug: "poliklinik",
    nama: "Poliklinik Rawat Jalan",
    deskripsi: "Pemeriksaan dokter spesialis (Penyakit Dalam, Anak, Bedah, Kandungan). Pilih dokter dan sesi praktik.",
    icon: Stethoscope,
    badge: "Paling Populer",
    estimasi: "~12-15 menit per pasien",
    kuotaHariIni: "Tersedia Sesi Pagi & Siang",
  },
  {
    slug: "laboratorium",
    nama: "Laboratorium Patologi Klinik",
    deskripsi: "Pemeriksaan darah lengkap, tes urin, profil kolesterol lipid, gula darah puasa, dan serologi.",
    icon: FlaskConical,
    badge: "Buka 07:00",
    estimasi: "~8-10 menit pengambilan sampel",
    kuotaHariIni: "Tersedia 28 Kuota",
  },
  {
    slug: "radiologi",
    nama: "Radiologi & Diagnostik Imejing",
    deskripsi: "Pemeriksaan foto rontgen thorax, USG 4D abdomen/kandungan, CT-Scan 128 slice, dan MRI.",
    icon: FileImage,
    badge: "Kapasitas Terbatas",
    estimasi: "~15-20 menit pemeriksaan",
    kuotaHariIni: "Tersedia 10 Kuota",
  },
  {
    slug: "farmasi",
    nama: "Farmasi & Resep Obat Racik",
    deskripsi: "Pengambilan obat resep rawat jalan, obat pascarawat inap, dan layanan konsultasi obat apoteker.",
    icon: Pill,
    badge: "Resep Elektronik",
    estimasi: "~10-15 menit peracikan",
    kuotaHariIni: "Layanan Aktif",
  },
  {
    slug: "rawat-inap",
    nama: "Admis Rawat Inap & Waiting List",
    deskripsi: "Pendaftaran kamar perawatan (Kelas 1, 2, 3, VIP) dan antrean persiapan pre-operasi elektif.",
    icon: Bed,
    badge: "Berdasarkan Ketersediaan",
    estimasi: "Verifikasi kamar 20 menit",
    kuotaHariIni: "Sisa 18 Tempat Tidur",
  },
];

export default function BookingMainPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="space-y-2">
        <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
          Layanan Booking Online
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
          Pilih Unit Layanan yang Dituju
        </h1>
        <p className="text-sm text-muted-foreground">
          Pilih jenis layanan di bawah ini untuk melihat ketersediaan jadwal, kuota dokter, dan persyaratan kedatangan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BOOKING_SERVICES.map((srv) => {
          const Icon = srv.icon;
          return (
            <Card key={srv.slug} className="flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-sm">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-teal-50 text-primary flex items-center justify-center border border-teal-100">
                    <Icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-[11px] bg-secondary text-primary border-teal-200">
                    {srv.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-heading">
                  <Link href={`/booking/${srv.slug}`} className="hover:text-primary transition-colors">
                    {srv.nama}
                  </Link>
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed mt-1">
                  {srv.deskripsi}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/60">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>{srv.estimasi}</span>
                  </div>
                  <span className="font-medium text-foreground">{srv.kuotaHariIni}</span>
                </div>

                <Button asChild className="w-full text-xs gap-1.5">
                  <Link href={`/booking/${srv.slug}`}>
                    Lanjutkan Booking
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
