import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ShieldCheck, Heart, Award, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HOSPITAL_NAME, BUILDINGS, APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Tentang Kami | ${HOSPITAL_NAME}`,
  description: "Profil, visi misi, fasilitas gedung, dan komitmen pelayanan prima RSUD Sejahtera Sehat.",
};

export default function TentangPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-12">
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
          Profil Rumah Sakit
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
          Melayani dengan Hati, Berinovasi dengan Teknologi
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {HOSPITAL_NAME} berkomitmen menghadirkan layanan kesehatan paripurna yang mudah diakses, berkeadilan, dan transparan melalui sistem terintegrasi {APP_NAME}.
        </p>
      </div>

      {/* Visi Misi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-secondary/40 border-teal-200/80">
          <CardHeader className="p-6 pb-3">
            <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center mb-2">
              <Award className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Visi Rumah Sakit</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 text-sm text-foreground leading-relaxed">
            Menjadi Rumah Sakit Umum Daerah rujukan terdepan yang unggul dalam mutu pelayanan medis, keselamatan pasien, dan kepuasan masyarakat berbasis teknologi informasi terpadu di tahun 2030.
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-6 pb-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center mb-2 border border-teal-100">
              <Heart className="h-5 w-5" />
            </div>
            <CardTitle className="text-lg">Misi Utama</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 text-xs space-y-2 text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Menyelenggarakan pelayanan kesehatan yang aman, bermutu, dan terjangkau bagi seluruh lapisan masyarakat.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Meniadakan penumpukan antrean fisik melalui antrean cerdas dan estimasi waktu tunggu real-time.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>Menjunjung tinggi keadilan layanan dengan prioritas khusus bagi pasien lansia, disabilitas, dan ibu hamil.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informasi Gedung & Kampus */}
      <section className="space-y-6 pt-6 border-t border-border">
        <div>
          <h2 className="text-2xl font-bold font-heading">Fasilitas Multi-Gedung Terintegrasi</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Kampus utama kami terdiri dari 3 gedung fungsional yang dirancang untuk memisahkan alur pasien secara higienis dan teratur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BUILDINGS.map((b) => (
            <Card key={b.id} className="border-border">
              <CardHeader className="p-6 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-primary text-white font-bold">{b.kode}</Badge>
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{b.nama}</CardTitle>
                <CardDescription className="text-xs">{b.deskripsi}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-2 text-xs text-muted-foreground space-y-1">
                <div className="p-3 rounded-lg bg-surface border border-border">
                  <span className="font-semibold text-foreground block mb-1">Unit Layanan Utama:</span>
                  {b.kode === "A" && "Loket Pendaftaran, Poliklinik Spesialis, Ruang Tunggu Terbuka, Kasir."}
                  {b.kode === "B" && "Instalasi Gawat Darurat (Triase 24 Jam), Ruang Rawat Inap Kelas 1-3 & VIP, HCU."}
                  {b.kode === "C" && "Laboratorium Patologi, Radiologi (CT-Scan, MRI, USG), Farmasi & Apotek."}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <div className="p-8 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-heading font-bold text-base">Ingin mendaftar atau berkonsultasi?</h3>
          <p className="text-xs text-muted-foreground">Booking tiket antrean dokter Anda hari ini secara online.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/booking">
            Mulai Booking Sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
