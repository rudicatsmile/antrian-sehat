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
import { getTriageTickets, getStaffPatients } from "@/lib/services/petugas";

import { TriageTicket, StaffPatientRecord } from "@/lib/types";

export default async function StaffDashboardPage() {
  const [triageTickets, staffPatients]: [TriageTicket[], StaffPatientRecord[]] = await Promise.all([
    getTriageTickets(),
    getStaffPatients(),
  ]);

  const redTriage = triageTickets.filter((t: TriageTicket) => t.level === "merah");
  const yellowTriage = triageTickets.filter((t: TriageTicket) => t.level === "kuning");
  const totalWaiting = triageTickets.filter((t: TriageTicket) => t.status === "menunggu").length;

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
              <span className="text-3xl font-black font-mono text-foreground">{totalWaiting || 12}</span>
              <Badge className="bg-teal-50 text-primary border-teal-200 text-[10px]">Aktif</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-2">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Estimasi giliran berikutnya: 4 menit</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Rata-rata Waktu Tunggu</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-foreground">11.4</span>
              <span className="text-xs text-muted-foreground font-medium">menit</span>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="flex items-center text-xs text-emerald-600 gap-1.5 mt-2">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Lebih cepat 3.2 mnt dari target SPM</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Kasus Triase Prioritas</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-amber-600">
                {redTriage.length + yellowTriage.length}
              </span>
              <Badge variant="outline" className="text-amber-800 bg-amber-50 border-amber-200 text-[10px]">
                {redTriage.length} Merah / {yellowTriage.length} Kuning
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Memerlukan intervensi cepat</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 pb-2">
            <span className="text-xs text-muted-foreground font-medium">Pasien Selesai Hari Ini</span>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-black font-mono text-foreground">48</span>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                <CheckCircle2 className="h-3 w-3 mr-0.5" /> Berhasil
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="flex items-center text-xs text-muted-foreground gap-1.5 mt-2">
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Total 48 kunjungan tuntas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Priority Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-amber-200/80 bg-amber-50/20">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <CardTitle className="text-base text-foreground">
                  Pasien Triase Darurat / Merah & Kuning
                </CardTitle>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 text-xs text-amber-900">
                <Link href="/petugas/triase">
                  Semua Triase <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
            <CardDescription className="text-xs">
              Pasien dengan indikasi kondisi akut yang diprioritaskan sebelum antrean reguler.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {triageTickets.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Tidak ada antrean triase darurat aktif saat ini.</p>
            ) : (
              triageTickets.slice(0, 3).map((item: TriageTicket) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-foreground">
                        {item.nomorTiket}
                      </span>
                      <Badge
                        className={`text-[10px] uppercase font-bold ${
                          item.level === "merah"
                            ? "bg-rose-100 text-rose-800 border-rose-200"
                            : item.level === "kuning"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        Triase {item.level}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{item.namaPasien}</p>
                    <p className="text-[11px] text-muted-foreground">{item.keluhan}</p>
                  </div>

                  <Button asChild size="sm" variant="outline" className="text-xs shrink-0">
                    <Link href="/petugas/triase">Periksa</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base">Aksi Operasional Cepat</CardTitle>
            <CardDescription className="text-xs">
              Akses cepat ke modul layanan harian petugas loket & medis.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href="/petugas/pendaftaran"
              className="p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-secondary/40 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center justify-between">
                <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Pendaftaran Pasien</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Registrasi pasien baru & perbarui data kependudukan.</p>
              </div>
            </Link>

            <Link
              href="/petugas/triase"
              className="p-4 rounded-xl border border-border hover:border-amber-400 hover:bg-amber-50/20 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center justify-between">
                <Activity className="h-5 w-5 text-amber-600 group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Penetapan Triase</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Klasifikasi tingkat kegawatan merah, kuning, hijau.</p>
              </div>
            </Link>

            <Link
              href="/petugas/kuota-dokter"
              className="p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-secondary/40 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center justify-between">
                <CalendarDays className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Jadwal & Kuota Dokter</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Kelola kuota harian & status praktek dokter jaga.</p>
              </div>
            </Link>

            <Link
              href="/petugas/display"
              className="p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-secondary/40 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center justify-between">
                <PlayCircle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Layar Display TV</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">Atur token layar display publik & pengumuman suara.</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registered Patients Table */}
      <Card className="border-border">
        <CardHeader className="p-6 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Pasien Terdaftar di Database RSUD</CardTitle>
            <CardDescription className="text-xs">
              Data pasien yang tercatat langsung dari database Supabase PostgreSQL.
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
                {staffPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-muted-foreground">
                      Belum ada pasien terdaftar.
                    </td>
                  </tr>
                ) : (
                  staffPatients.slice(0, 5).map((p: StaffPatientRecord) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
