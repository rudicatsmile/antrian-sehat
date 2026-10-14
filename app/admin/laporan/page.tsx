"use client";

import * as React from "react";
import { FileSpreadsheet, Download, Filter, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const REPORT_ROWS = [
  { unit: "Poliklinik Penyakit Dalam", kunjungan: 184, waktuTunggu: "11.2 mnt", pendapatan: 17400000, pembatalan: 3 },
  { unit: "Poliklinik Anak", kunjungan: 92, waktuTunggu: "14.5 mnt", pendapatan: 8280000, pembatalan: 2 },
  { unit: "Poliklinik Bedah Umum", kunjungan: 64, waktuTunggu: "18.0 mnt", pendapatan: 7680000, pembatalan: 1 },
  { unit: "Poliklinik Kebidanan & Kandungan", kunjungan: 88, waktuTunggu: "13.8 mnt", pendapatan: 9680000, pembatalan: 4 },
  { unit: "Triase IGD", kunjungan: 72, waktuTunggu: "2.5 mnt", pendapatan: 14400000, pembatalan: 0 },
  { unit: "Laboratorium Patologi", kunjungan: 145, waktuTunggu: "8.4 mnt", pendapatan: 18850000, pembatalan: 1 },
  { unit: "Radiologi (USG/X-Ray/CT)", kunjungan: 58, waktuTunggu: "16.2 mnt", pendapatan: 12760000, pembatalan: 2 },
  { unit: "Farmasi & Resep Racik", kunjungan: 320, waktuTunggu: "12.0 mnt", pendapatan: 28800000, pembatalan: 0 },
];

export default function AdminLaporanPage() {
  const [dateRange, setDateRange] = React.useState("minggu_ini");

  const handleExportCSV = () => {
    toast.success("File CSV 'laporan-antrean-sehat-oktober-2026.csv' berhasil diekspor dan diunduh!");
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Analitik & Audit
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Laporan Kunjungan & Waktu Tunggu
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Laporan agregasi kunjungan pasien, efektivitas waktu tunggu, tingkat pembatalan, dan rekapitulasi keuangan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="flex h-9 rounded-lg border border-border bg-background px-3 py-1 text-xs"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="hari_ini">Hari Ini</option>
            <option value="minggu_ini">Minggu Ini (7 Hari Terakhir)</option>
            <option value="bulan_ini">Bulan Ini (Oktober 2026)</option>
            <option value="tahun_ini">Tahun Berjalan 2026</option>
          </select>
          <Button onClick={handleExportCSV} size="sm" className="gap-2 text-xs">
            <Download className="h-4 w-4" />
            Ekspor CSV
          </Button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-border">
          <span className="text-xs text-muted-foreground">Total Kunjungan Periode Ini</span>
          <div className="text-2xl font-bold font-mono text-foreground mt-1">1,023 Pasien</div>
        </Card>
        <Card className="p-4 border-border">
          <span className="text-xs text-muted-foreground">Rata-rata Waktu Tunggu</span>
          <div className="text-2xl font-bold font-mono text-teal-800 mt-1">11.8 Menit</div>
        </Card>
        <Card className="p-4 border-border">
          <span className="text-xs text-muted-foreground">Total Penerimaan Layanan</span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">Rp 117.850.000</div>
        </Card>
        <Card className="p-4 border-border">
          <span className="text-xs text-muted-foreground">Tingkat Pembatalan Tiket</span>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">1.2% (Rendah)</div>
        </Card>
      </div>

      {/* Reports Table */}
      <Card className="border-border">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-heading">
            Tabel Rekapitulasi per Unit Layanan
          </CardTitle>
          <CardDescription className="text-xs">
            Data statistik performa antrean dan waktu layanan pada periode yang dipilih.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">Unit Layanan</th>
                  <th className="p-3.5 text-center">Jumlah Kunjungan</th>
                  <th className="p-3.5 text-center">Rata-rata Tunggu</th>
                  <th className="p-3.5 text-right">Total Penerimaan</th>
                  <th className="p-3.5 text-center">Tiket Batal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {REPORT_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface/50">
                    <td className="p-3.5 font-semibold text-foreground">{row.unit}</td>
                    <td className="p-3.5 text-center font-mono font-bold text-foreground">
                      {row.kunjungan}
                    </td>
                    <td className="p-3.5 text-center font-mono text-teal-800">
                      {row.waktuTunggu}
                    </td>
                    <td className="p-3.5 text-right font-mono font-semibold text-foreground">
                      Rp {row.pendapatan.toLocaleString("id-ID")}
                    </td>
                    <td className="p-3.5 text-center font-mono text-muted-foreground">
                      {row.pembatalan}
                    </td>
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
