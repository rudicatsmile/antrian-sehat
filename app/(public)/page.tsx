import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarPlus,
  Clock,
  ShieldCheck,
  Activity,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Tv,
  PhoneCall,
  Sparkles,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLayananList } from "@/lib/services/layanan";
import { getDokterList } from "@/lib/services/dokter";
import { APP_NAME, HOSPITAL_NAME, HOSPITAL_TAGLINE, BUILDINGS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Beranda | Sistem Antrean & Booking Layanan Terpadu",
  description: "Daftar antrean rumah sakit online, pantau estimasi waktu tunggu real-time, dan terima notifikasi WhatsApp di RSUD Sejahtera Sehat.",
};

export default async function HomePage() {
  const units = await getLayananList();
  const featuredUnits = units.slice(0, 6);
  const doctors = await getDokterList();

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 via-background to-background pt-12 md:pt-20 pb-8 border-b border-border/50">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-teal-200 text-primary text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Transformasi Digital Layanan RSUD Modern</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-foreground font-heading leading-tight">
                Antre Lebih Tenang, <br />
                <span className="text-primary">Waktu Tunggu Terprediksi</span> Pasti.
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Daftar antrean poliklinik, laboratorium, radiologi, dan farmasi dari rumah.
                Dapatkan notifikasi status giliran langsung ke WhatsApp Anda tanpa menunggu berdesakan di rumah sakit.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button size="lg" asChild className="gap-2 text-base px-6 h-12 shadow-md">
                  <Link href="/booking">
                    <CalendarPlus className="h-5 w-5" />
                    Booking Antrean Sekarang
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="gap-2 text-base h-12">
                  <Link href="/jadwal-dokter">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Lihat Jadwal Dokter
                  </Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60">
                <div>
                  <div className="text-2xl font-bold text-foreground font-heading">&lt; 15 Mnt</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Rata-rata Waktu Tunggu</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground font-heading">100%</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Prioritas Triase Medis</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground font-heading">24 Jam</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Layanan IGD Terpadu</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Antrean Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status Panggilan Hari Ini
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[11px] bg-secondary text-primary border-teal-200">
                    Live Real-time
                  </Badge>
                </div>

                {/* Active Calls Demo */}
                <div className="space-y-3.5 my-5">
                  <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-teal-800 font-medium block">Poliklinik Penyakit Dalam</span>
                      <span className="text-xs text-muted-foreground">dr. Hendra Wijaya, Sp.PD</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-teal-900 font-mono tracking-tight">POL-D-014</span>
                      <span className="text-[10px] text-teal-700 font-medium block">Panggilan ke-1</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-900 font-medium block">Triase IGD (Urgent)</span>
                      <span className="text-xs text-muted-foreground">Kamar Tindakan Bedah 1</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-950 font-mono tracking-tight">TRG-K-003</span>
                      <span className="text-[10px] text-amber-800 font-medium block">Sedang Dilayani</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between">
                    <div>
                      <span className="text-xs text-foreground font-medium block">Laboratorium Patologi</span>
                      <span className="text-xs text-muted-foreground">Loket Pengambilan Sampel</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-foreground font-mono">LAB-021</span>
                      <span className="text-[10px] text-muted-foreground block">Menunggu (2 di depan)</span>
                    </div>
                  </div>
                </div>

                <Button variant="secondary" asChild className="w-full text-xs gap-1.5 h-10">
                  <Link href="/display/tv-poli-lt2-a8f9" target="_blank">
                    <Tv className="h-4 w-4 text-primary" />
                    Buka Layar Display Monitor Ruang Tunggu
                    <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Langkah Mudah Booking */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
            Alur Layanan
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">
            4 Langkah Mudah Berobat Tanpa Menumpuk
          </h2>
          <p className="text-sm text-muted-foreground">
            Cukup gunakan smartphone Anda untuk mendapatkan kepastian jadwal dokter dan antrean tertib.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-border hover:shadow-sm transition-shadow">
            <CardHeader className="p-5 pb-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center font-bold text-base mb-3 border border-teal-100 font-heading">
                01
              </div>
              <CardTitle className="text-base">Pilih Unit & Dokter</CardTitle>
              <CardDescription className="text-xs">
                Pilih poliklinik tujuan, dokter spesialis yang bertugas, dan sesi jam kedatangan.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border hover:shadow-sm transition-shadow">
            <CardHeader className="p-5 pb-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center font-bold text-base mb-3 border border-teal-100 font-heading">
                02
              </div>
              <CardTitle className="text-base">Dapatkan Tiket Digital</CardTitle>
              <CardDescription className="text-xs">
                Nomor antrean dan QR Code resmi langsung tersimpan di aplikasi dan dikirimkan via WhatsApp.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border hover:shadow-sm transition-shadow">
            <CardHeader className="p-5 pb-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center font-bold text-base mb-3 border border-teal-100 font-heading">
                03
              </div>
              <CardTitle className="text-base">Pantau Estimasi Waktu</CardTitle>
              <CardDescription className="text-xs">
                Cek sisa antrean di depan Anda dari rumah atau saat perjalanan menuju rumah sakit.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border hover:shadow-sm transition-shadow">
            <CardHeader className="p-5 pb-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center font-bold text-base mb-3 border border-teal-100 font-heading">
                04
              </div>
              <CardTitle className="text-base">Tiba Tepat Waktu</CardTitle>
              <CardDescription className="text-xs">
                Dapatkan notifikasi WhatsApp saat giliran Anda tinggal 2 nomor lagi untuk masuk ke ruang periksa.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Unit Layanan Unggulan */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Badge variant="outline" className="text-primary border-teal-200 bg-secondary mb-2">
              Unit Layanan
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">
              Layanan Medis Lengkap & Terintegrasi
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Dari pendaftaran, poliklinik spesialis, IGD triase, penunjang medis hingga farmasi.
            </p>
          </div>
          <Button variant="outline" asChild className="self-start sm:self-auto gap-2 text-xs">
            <Link href="/layanan">
              Lihat Semua Unit ({units.length})
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredUnits.map((unit) => (
            <Card key={unit.id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-[11px] font-mono font-semibold bg-surface">
                    Kode: {unit.kode}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{unit.lantai}</span>
                </div>
                <CardTitle className="text-lg hover:text-primary transition-colors">
                  <Link href={`/layanan/${unit.slug}`}>
                    {unit.nama}
                  </Link>
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2 mt-2 leading-relaxed">
                  {unit.deskripsi}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 border-t border-border/60 mt-4 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  <span>Estimasi tunggu: </span>
                  <span className="font-semibold text-foreground">~{unit.estimasiTungguMenit} menit</span>
                </div>
                <Button size="sm" variant="ghost" asChild className="gap-1 text-xs text-primary hover:text-primary">
                  <Link href={`/layanan/${unit.slug}`}>
                    Detail Unit
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Jadwal Dokter Hari Ini Preview */}
      <section className="bg-surface py-12 border-y border-border">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <Badge variant="outline" className="text-primary border-teal-200 bg-secondary mb-2">
                Dokter Spesialis
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">
                Ketersediaan Dokter Spesialis Hari Ini
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pantau sisa kuota sesi konsultasi dokter sebelum melakukan booking.
              </p>
            </div>
            <Button variant="outline" asChild className="self-start sm:self-auto gap-2 text-xs">
              <Link href="/jadwal-dokter">
                Buka Seluruh Jadwal
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doc) => {
              const activeSession = doc.sessions[0] || {
                sesi: "pagi",
                kuota: 30,
                terpakai: 0,
                jamMulai: "08:00",
                jamSelesai: "12:00",
              };
              const sisaKuota = Math.max(0, activeSession.kuota - activeSession.terpakai);
              return (
                <Card key={doc.id} className="overflow-hidden">
                  <div className="p-5 space-y-3">
                    <div className="h-12 w-12 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm border border-teal-200">
                      {doc.nama.replace("dr. ", "").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-sm text-foreground">{doc.nama}</h4>
                      <p className="text-xs text-teal-800 font-medium">{doc.gelar}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{doc.unitNama}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-background border border-border text-xs space-y-1">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Sesi {activeSession.sesi.toUpperCase()}:</span>
                        <span className="font-mono">{activeSession.jamMulai} - {activeSession.jamSelesai}</span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-border/60">
                        <span>Sisa Kuota:</span>
                        <span className="font-bold text-primary font-mono">{sisaKuota} dari {activeSession.kuota}</span>
                      </div>
                    </div>

                    <Button size="sm" asChild className="w-full text-xs">
                      <Link href={`/booking/poliklinik?doc=${doc.id}`}>
                        Booking Dokter Ini
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-2xl bg-teal-900 text-white p-8 md:p-12 relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              Siap Menikmati Kemudahan Berobat di {HOSPITAL_NAME}?
            </h3>
            <p className="text-teal-100 text-sm sm:text-base leading-relaxed">
              Mulai pendaftaran antrean Anda sekarang. Pasien lansia, disabilitas, dan ibu hamil secara otomatis mendapatkan jalur antrean prioritas.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="lg" asChild className="bg-white text-teal-950 hover:bg-teal-50 font-semibold text-sm">
                <Link href="/booking">
                  Mulai Booking Antrean
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="border-teal-700 text-white hover:bg-teal-800 hover:text-white text-sm">
                <Link href="/kontak">
                  Hubungi Layanan Informasi
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
