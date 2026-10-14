"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bed, Clock, CheckCircle2, AlertCircle, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const ROOM_CLASSES = [
  { id: "Kelas 1", nama: "Kelas 1 (4 Tempat Tidur / Kamar)", fasilitas: "AC, Kamar Mandi Dalam, TV Bersama, Lemari Pasien", sisa: 3 },
  { id: "Kelas 2", nama: "Kelas 2 (6 Tempat Tidur / Kamar)", fasilitas: "AC, Kamar Mandi Dalam, Lemari Pasien", sisa: 5 },
  { id: "Kelas 3", nama: "Kelas 3 (8 Tempat Tidur / Kamar)", fasilitas: "Kipas Angin / AC Sentral, Kamar Mandi Bersama", sisa: 8 },
  { id: "VIP", nama: "VIP Room (1 Pasien / Kamar Privat)", fasilitas: "Sofa Tamu, Kulkas, AC Privat, TV Smart, Kamar Mandi Air Panas", sisa: 2 },
];

export default function BookingRawatInapPage() {
  const router = useRouter();
  const [kelas, setKelas] = React.useState("Kelas 1");
  const [indikasi, setIndikasi] = React.useState("Perawatan lanjutan penyakit dalam & regulasi gula darah");
  const [isPreOp, setIsPreOp] = React.useState(false);
  const [jenisTindakan, setJenisTindakan] = React.useState("");
  const [estimasiTgl, setEstimasiTgl] = React.useState("2026-10-16");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Permintaan Rawat Inap Berhasil Diajukan! Petugas Admis Gedung B akan segera memverifikasi ketersediaan kamar.");
      router.push("/dashboard");
    }, 900);
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
          Rawat Inap
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
          Pendaftaran & Waiting List Rawat Inap
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Pengajuan alokasi tempat tidur perawatan berdasarkan Surat Pengantar Rawat Inap (SPRI) dokter DPJP.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold font-heading">
              Pilih Kelas Perawatan Kamar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            {ROOM_CLASSES.map((rc) => {
              const isSelected = kelas === rc.id;
              return (
                <div
                  key={rc.id}
                  onClick={() => setKelas(rc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-secondary/60 ring-1 ring-primary shadow-xs"
                      : "border-border hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-semibold text-xs text-foreground">
                      {rc.nama}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-surface font-semibold text-teal-800">
                      Tersedia {rc.sisa} Bed
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {rc.fasilitas}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Indikasi Medis */}
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold font-heading">
              Indikasi Medis & Persiapan Pre-Operasi
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="indikasi" className="text-xs">Indikasi Masuk Rawat Inap *</Label>
              <textarea
                id="indikasi"
                rows={3}
                className="flex w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={indikasi}
                onChange={(e) => setIndikasi(e.target.value)}
                required
              />
            </div>

            {/* Pre Op Checkbox */}
            <div className="p-3.5 rounded-xl bg-surface border border-border space-y-3">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="preop"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                  checked={isPreOp}
                  onChange={(e) => setIsPreOp(e.target.checked)}
                />
                <Label htmlFor="preop" className="text-xs font-semibold cursor-pointer">
                  Pasien Memerlukan Tindakan Operasi (Pre-Operasi)
                </Label>
              </div>

              {isPreOp && (
                <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="tindakan" className="text-xs">Rencana Tindakan Medis</Label>
                    <input
                      id="tindakan"
                      className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                      placeholder="Contoh: Apendektomi / Herniorafi"
                      value={jenisTindakan}
                      onChange={(e) => setJenisTindakan(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tglOp" className="text-xs">Estimasi Tanggal Tindakan</Label>
                    <input
                      id="tglOp"
                      type="date"
                      className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                      value={estimasiTgl}
                      onChange={(e) => setEstimasiTgl(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} size="lg" className="w-full text-xs gap-2 h-11">
          <CheckCircle2 className="h-4 w-4" />
          {loading ? "Mengirim Pengajuan..." : "Ajukan Permintaan Rawat Inap"}
        </Button>
      </form>
    </div>
  );
}
