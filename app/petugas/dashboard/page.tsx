"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  PlayCircle,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  CalendarDays,
  Activity,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_TRIAGE_TICKETS, DUMMY_STAFF_PATIENTS } from "@/lib/dummy/petugas";

export default function StaffDashboardPage() {
  const redTriage = DUMMY_TRIAGE_TICKETS.filter((t) => t.level === "merah");
  const yellowTriage = DUMMY_TRIAGE_TICKETS.filter((t) => t.level === "kuning");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Panel Operasional Petugas Medis
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Dasbor Petugas Layanan & Triase
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Unit Ditugaskan: <strong className="text-foreground">Loket Pendaftaran & Poliklinik Rawat Jalan (Gedung A)</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href="/petugas/panel/poliklinik-penyakit-dalam">
              <PlayCircle className="h-4 w-4 mr-1.5" />
              Buka Panel Panggil Poli
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Pasien Menunggu (Hari Ini)</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-foreground">34</span>
              <Badge className="bg-teal-50 text-primary border-teal-200 text-[10px]">Aktif</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-[11px] text-muted-foreground">
            Tersebar di 4 loket pendaftaran & poli
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Pasien Selesai Dilayani</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-emerald-700">128</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-[11px] text-muted-foreground">
            Waktu rata-rata 11.4 menit per pasien
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Triase IGD Gawat (Merah/Kuning)</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-red-600">
                {redTriage.length + yellowTriage.length}
              </span>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-[11px] text-muted-foreground">
            1 Resusitasi Kritis, 1 Gawat Cepat
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Rata-rata Waktu Layanan</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-teal-800">10.2</span>
              <span className="text-xs font-semibold text-muted-foreground">menit</span>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 text-[11px] text-muted-foreground">
            Sesuai target standar operasional RSUD
          </CardContent>
        </Card>
      </div>

      {/* Operational Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Loket Pendaftaran */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="p-6 pb-3">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center mb-2">
              <UserCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Loket Pendaftaran Pasien</CardTitle>
            <CardDescription className="text-xs">
              Registrasi pasien baru, terbitkan RM digital, dan cetak tiket antrean loket.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <Button asChild size="sm" className="w-full text-xs">
              <Link href="/petugas/pendaftaran">
                Buka Menu Loket →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Panel Triase */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="p-6 pb-3">
            <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-2">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Panel Triase IGD</CardTitle>
            <CardDescription className="text-xs">
              Klasifikasi medis merah/kuning/hijau dan pemanggilan pasien gawat darurat.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <Button asChild size="sm" variant="outline" className="w-full text-xs border-red-200 text-red-700 hover:bg-red-50">
              <Link href="/petugas/triase">
                Kelola Triase IGD →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Kuota Dokter */}
        <Card className="border-border hover:border-primary/50 transition-colors">
          <CardHeader className="p-6 pb-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
              <CalendarDays className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Pengaturan Kuota Dokter</CardTitle>
            <CardDescription className="text-xs">
              Atur kapasitas maksimal kuota pasien per sesi pagi, siang, dan sore per tanggal.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <Button asChild size="sm" variant="outline" className="w-full text-xs">
              <Link href="/petugas/kuota-dokter">
                Atur Kuota Sesi →
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registered Patients Table */}
      <Card className="border-border">
        <CardHeader className="p-6 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Pasien Terdaftar Hari Ini di Loket</CardTitle>
            <CardDescription className="text-xs">
              5 pasien terakhir yang didaftarkan melalui loket pendaftaran Gedung A.
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/petugas/pendaftaran">Kelola Seluruh Pasien</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="p-3">Nama Lengkap Pasien</th>
                  <th className="p-3">NIK</th>
                  <th className="p-3">No. Rekam Medis</th>
                  <th className="p-3">Prioritas</th>
                  <th className="p-3">Waktu Daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DUMMY_STAFF_PATIENTS.map((p) => (
                  <tr key={p.id} className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-foreground">{p.namaLengkap}</td>
                    <td className="p-3 font-mono text-muted-foreground">{p.nik}</td>
                    <td className="p-3 font-mono font-bold text-teal-800">{p.noRm}</td>
                    <td className="p-3 capitalize">
                      <Badge variant="outline" className="text-[10px]">
                        {p.kategoriPrioritas}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">{p.waktuDaftar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
