"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileImage, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const MODALITIES = [
  { id: "xray", kode: "RAD-XRAY", nama: "Foto Rontgen Konvensional (Thorax/Ekstremitas)", durasi: "10 mnt", sisaKuota: 15, catatan: "Tidak perlu persiapan puasa. Lepaskan kalung/logam." },
  { id: "usg", kode: "RAD-USG", nama: "Ultrasonografi (USG 4D Abdomen / Kandungan)", durasi: "20 mnt", sisaKuota: 8, catatan: "Pemeriksaan USG abdomen memerlukan puasa 6 jam dan minum air putih untuk menahan kencing." },
  { id: "ctscan", kode: "RAD-CT", nama: "CT-Scan 128 Slice (Kepala / Thorax / Abdomen)", durasi: "30 mnt", sisaKuota: 4, catatan: "Wajib menyertakan hasil laboratorium Ureum & Kreatinin jika menggunakan zat kontras." },
  { id: "mri", kode: "RAD-MRI", nama: "Magnetic Resonance Imaging (MRI 1.5 Tesla)", durasi: "45 mnt", sisaKuota: 3, catatan: "Dilarang bagi pasien pengguna alat pacu jantung (pacemaker) atau implan logam." },
  { id: "mammo", kode: "RAD-MAM", nama: "Mammografi Digital Payudara", durasi: "20 mnt", sisaKuota: 6, catatan: "Sebaiknya dilakukan 1 minggu setelah periode menstruasi berakhir." },
];

export default function BookingRadiologiPage() {
  const router = useRouter();
  const [selectedModality, setSelectedModality] = React.useState(MODALITIES[0].id);
  const [tanggal, setTanggal] = React.useState("2026-10-15");
  const [sesi, setSesi] = React.useState("pagi");
  const [loading, setLoading] = React.useState(false);

  const activeMod = MODALITIES.find((m) => m.id === selectedModality) || MODALITIES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Booking Radiologi Berhasil! Tiket ${activeMod.kode}-008 diterbitkan. Konfirmasi dikirim via WhatsApp.`);
      router.push("/antrean/saya");
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/booking"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Pilihan Layanan
      </Link>

      <div className="space-y-1">
        <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
          Penunjang Medis
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
          Booking Radiologi & Diagnostik Imejing
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Pilih modalitas pemeriksaan radiologi sesuai lembar pengantar dokter DPJP Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold font-heading">
              Pilih Modalitas Imejing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {MODALITIES.map((mod) => {
              const isSelected = selectedModality === mod.id;
              return (
                <div
                  key={mod.id}
                  onClick={() => setSelectedModality(mod.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-secondary/60 ring-1 ring-primary shadow-xs"
                      : "border-border hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-semibold text-xs text-foreground">
                      {mod.nama}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono font-semibold bg-surface">
                      Sisa {mod.sisaKuota} Kuota
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {mod.catatan}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Date and Session */}
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold font-heading">
              Pilih Tanggal & Waktu Pemeriksaan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tgl" className="text-xs">Tanggal Pemeriksaan *</Label>
              <input
                id="tgl"
                type="date"
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                min="2026-10-14"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sesi" className="text-xs">Sesi Waktu *</Label>
              <select
                id="sesi"
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={sesi}
                onChange={(e) => setSesi(e.target.value)}
              >
                <option value="pagi">Sesi Pagi (08:00 - 12:00 WIB)</option>
                <option value="siang">Sesi Siang (13:00 - 16:00 WIB)</option>
                <option value="sore">Sesi Sore (16:30 - 18:00 WIB)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} size="lg" className="w-full text-xs gap-2 h-11">
          <CheckCircle2 className="h-4 w-4" />
          {loading ? "Memproses..." : "Konfirmasi Booking Radiologi"}
        </Button>
      </form>
    </div>
  );
}
