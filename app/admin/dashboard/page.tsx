import type { Metadata } from "next";
import Link from "next/link";
import {
  CreditCard,
  TrendingUp,
  Building,
  Layers,
  Cpu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminVisitChart } from "@/components/admin/admin-charts";
import { getAdminStats, getChartKunjungan } from "@/lib/services/admin";
import { formatRupiah } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dasbor Administrator | Antrean Sehat RSUD",
};

export default async function AdminDashboardPage() {
  const [stats, chartData] = await Promise.all([
    getAdminStats(),
    getChartKunjungan(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Pusat Pengendalian Rumah Sakit
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Dasbor Utama Administrator RSUD
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Ringkasan data analitik kunjungan pasien, estimasi waktu tunggu, dan pendapatan langsung dari database Supabase PostgreSQL.
          </p>
        </div>

        <Button asChild size="sm">
          <Link href="/admin/laporan">
            Unduh Laporan Lengkap →
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Total Kunjungan Hari Ini</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-foreground">
                {stats.totalKunjunganHariIni}
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-[11px] text-muted-foreground">
            {stats.persentaseBookingOnline}% booking via aplikasi online
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Pendapatan Hari Ini</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
                {formatRupiah(stats.totalPendapatanHariIni)}
              </span>
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-[11px] text-muted-foreground">
            Kasir Tunai & Webhook Midtrans Real-time
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Rata-rata Waktu Tunggu</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-teal-800">
                {stats.rataRataWaktuTungguMenit}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">menit</span>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-[11px] text-muted-foreground">
            Sesuai standar operasional SPM RSUD
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Tingkat Kepuasan Pasien</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-teal-800">
                {stats.kepuasanPasien}%
              </span>
              <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Sangat Baik</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-[11px] text-muted-foreground">
            Survei kepuasan digital pasca-kunjungan
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="border-border">
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-heading">
                Grafik Volume Beban Antrean per Jam Berdasarkan Gedung
              </CardTitle>
              <CardDescription className="text-xs">
                Perbandingan arus kedatangan pasien di Gedung A (Rawat Jalan), Gedung B (IGD), dan Gedung C (Penunjang).
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono bg-surface">
              Hari Ini
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <AdminVisitChart data={chartData} />
        </CardContent>
      </Card>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="p-5 pb-3">
            <Building className="h-6 w-6 text-primary mb-1" />
            <CardTitle className="text-sm">Kelola Lokasi & Gedung</CardTitle>
            <CardDescription className="text-xs">
              Konfigurasi master data Gedung A, B, C dan titik lokasi antrean.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/admin/lokasi">Buka Kelola Gedung →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="p-5 pb-3">
            <Layers className="h-6 w-6 text-primary mb-1" />
            <CardTitle className="text-sm">Kelola Unit & Loket</CardTitle>
            <CardDescription className="text-xs">
              Atur jam operasional, estimasi standar layanan, dan loket aktif.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/admin/unit">Buka Kelola Unit →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="p-5 pb-3">
            <Cpu className="h-6 w-6 text-primary mb-1" />
            <CardTitle className="text-sm">Status Integrasi Sistem</CardTitle>
            <CardDescription className="text-xs">
              Pantau koneksi WhatsApp Gateway, Midtrans, dan EMR FHIR-lite.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/admin/integrasi">Buka Status Integrasi →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
