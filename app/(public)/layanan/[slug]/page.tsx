import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  MapPin,
  CheckCircle2,
  CalendarPlus,
  ArrowLeft,
  Users,
  ShieldAlert,
  AlertCircle,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLayananBySlug } from "@/lib/services/layanan";
import { getDokterList } from "@/lib/services/dokter";
import { APP_NAME, HOSPITAL_NAME } from "@/lib/constants";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const unit = await getLayananBySlug(slug);
  if (!unit) return { title: "Layanan Tidak Ditemukan" };

  return {
    title: `${unit.nama} | ${APP_NAME}`,
    description: unit.deskripsi,
  };
}

export default async function LayananDetailPage({ params }: Props) {
  const { slug } = await params;
  const unit = await getLayananBySlug(slug);

  if (!unit) {
    notFound();
  }

  const relatedDoctors = await getDokterList(slug);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      {/* Back Link */}
      <Link
        href="/layanan"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Seluruh Layanan
      </Link>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs bg-surface font-bold text-teal-800">
              KODE: {unit.kode}
            </Badge>
            <Badge variant="outline" className="text-xs bg-secondary text-primary border-teal-200">
              {unit.buildingName}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading">
            {unit.nama}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {unit.lantai}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Operasional: {unit.jamBuka} - {unit.jamTutup} WIB
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-primary" />
              {unit.loketAktif} Loket Aktif
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button size="lg" asChild className="gap-2">
            <Link href={`/booking/${unit.kind === "poliklinik" ? "poliklinik" : unit.kind}`}>
              <CalendarPlus className="h-4 w-4" />
              Booking Antrean Unit Ini
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Overview & Persyaratan */}
        <div className="md:col-span-2 space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading">Deskripsi Layanan</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {unit.deskripsi}
            </p>
          </section>

          {/* Persyaratan Dokumen */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold font-heading">Persyaratan & Dokumen Wajib</h2>
            <div className="space-y-2.5">
              {unit.persyaratan.map((syarat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-surface border border-border text-xs">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-foreground">{syarat}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Dokter yang bertugas jika poliklinik */}
          {relatedDoctors.length > 0 && (
            <section className="space-y-3 pt-4 border-t border-border">
              <h2 className="text-lg font-bold font-heading">Dokter Spesialis Bertugas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedDoctors.map((doc) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {doc.nama.replace("dr. ", "").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-heading font-semibold text-xs truncate">{doc.nama}</h4>
                        <p className="text-[11px] text-teal-800">{doc.gelar}</p>
                        <p className="text-[11px] text-muted-foreground mt-1 truncate">{doc.ruangPraktek}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right: Info Widget */}
        <div className="space-y-6">
          <Card className="bg-surface/50 border-border">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-heading">Estimasi Waktu Pelayanan</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="text-center p-4 rounded-xl bg-background border border-border">
                <span className="text-xs text-muted-foreground block mb-1">Rata-rata Waktu Tunggu</span>
                <span className="text-3xl font-extrabold text-primary font-mono">
                  ~{unit.estimasiTungguMenit}
                </span>
                <span className="text-xs text-muted-foreground block mt-1">menit per pasien</span>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span>Durasi Konsultasi:</span>
                  <span className="font-medium text-foreground">~{unit.defaultServiceMinutes} menit</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span>Loket Pelayanan Aktif:</span>
                  <span className="font-medium text-foreground">{unit.loketAktif} Loket</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Sisa Kuota Hari Ini:</span>
                  <span className="font-semibold text-primary">{unit.sisaKuotaHariIni} antrean</span>
                </div>
              </div>

              <Button asChild className="w-full text-xs">
                <Link href={`/booking/${unit.kind === "poliklinik" ? "poliklinik" : unit.kind}`}>
                  Booking Antrean Sekarang
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Emergency note if triase */}
          {unit.kind === "triase" && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-red-900">
                <AlertCircle className="h-4 w-4" />
                <span>Ketentuan Pasien IGD</span>
              </div>
              <p className="leading-relaxed">
                Pasien dengan kegawatan mengancam nyawa (Triase Merah) akan langsung ditangani tim resusitasi tanpa proses antrean biasa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
