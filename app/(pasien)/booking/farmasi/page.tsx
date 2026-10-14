"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pill, Clock, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const PHARMACY_TYPES = [
  {
    id: "rawat_jalan",
    kode: "FAR-RJ",
    nama: "Obat Non-Racik Rawat Jalan",
    estimasi: "~10-12 menit",
    deskripsi: "Obat jadi kemasan pabrik (tablet, sirup, tetes, salep) berdasarkan resep elektronik dokter poliklinik.",
  },
  {
    id: "racik",
    kode: "FAR-RC",
    nama: "Obat Racik (Puyer / Kapsul / Salep Campur)",
    estimasi: "~20-25 menit",
    deskripsi: "Pencampuran dosis sediaan khusus oleh Asisten Apoteker berlisensi. Memerlukan ketelitian penimbangan bahan.",
  },
  {
    id: "pasca_inap",
    kode: "FAR-PI",
    nama: "Obat Pulang Pascarawat Inap",
    estimasi: "~15 menit",
    deskripsi: "Paket terapi obat untuk pasien yang telah selesai menjalani rawat inap di gedung perawatan.",
  },
  {
    id: "konsultasi",
    kode: "FAR-KS",
    nama: "Konseling Obat Bersama Apoteker (PIO)",
    estimasi: "10 menit per sesi",
    deskripsi: "Konseling tatap muka terkait aturan pakai obat kronis, interaksi obat, dan edukasi efek samping.",
  },
];

export default function BookingFarmasiPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = React.useState(PHARMACY_TYPES[0].id);
  const [noResep, setNoResep] = React.useState("RXP-2026-00412");
  const [loading, setLoading] = React.useState(false);

  const activePharm = PHARMACY_TYPES.find((p) => p.id === selectedType) || PHARMACY_TYPES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Nomor Antrean Farmasi ${activePharm.kode}-018 Diterbitkan! Konfirmasi dikirim ke WhatsApp.`);
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
          Farmasi & Apotek
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
          Antrean Resep Farmasi
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Pilih kategori pengambilan obat sesuai resep yang diterbitkan dokter pemeriksa Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold font-heading">
              Pilih Jenis Pengambilan Obat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {PHARMACY_TYPES.map((item) => {
              const isSelected = selectedType === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedType(item.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-secondary/60 ring-1 ring-primary shadow-xs"
                      : "border-border hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-heading font-semibold text-xs text-foreground">
                      {item.nama}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono bg-surface">
                      {item.estimasi}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Resep ID */}
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold font-heading">
              Data Resep Elektronik
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2">
            <div className="space-y-1.5">
              <Label htmlFor="noResep" className="text-xs">Nomor Resep Dokter (Terisi Otomatis) *</Label>
              <div className="relative">
                <input
                  id="noResep"
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={noResep}
                  onChange={(e) => setNoResep(e.target.value)}
                  required
                />
                <FileText className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-[11px] text-muted-foreground block">
                Resep elektronik dari kunjungan poliklinik dr. Hendra Wijaya, Sp.PD.
              </span>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} size="lg" className="w-full text-xs gap-2 h-11">
          <CheckCircle2 className="h-4 w-4" />
          {loading ? "Menerbitkan Nomor Antrean..." : "Ambil Nomor Antrean Farmasi"}
        </Button>
      </form>
    </div>
  );
}
