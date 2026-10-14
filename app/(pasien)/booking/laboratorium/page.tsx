"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FlaskConical, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CURRENT_PATIENT } from "@/lib/dummy/pasien";

interface LabTestOption {
  id: string;
  nama: string;
  wajibPuasa: boolean;
  durasiPuasa?: string;
  biaya: number;
}

const LAB_TESTS: LabTestOption[] = [
  { id: "hematologi", nama: "Hematologi Lengkap (Darah Rutin)", wajibPuasa: false, biaya: 65000 },
  { id: "lipid", nama: "Profil Lipid Lengkap (Kolesterol, HDL, LDL, Trigliserida)", wajibPuasa: true, durasiPuasa: "10-12 jam puasa", biaya: 120000 },
  { id: "gds", nama: "Gula Darah Puasa (GDP) & 2 Jam PP", wajibPuasa: true, durasiPuasa: "8-10 jam puasa", biaya: 40000 },
  { id: "urin", nama: "Urin Lengkap & Sedimen", wajibPuasa: false, biaya: 35000 },
  { id: "liver", nama: "Fungsi Hati (SGOT & SGPT)", wajibPuasa: false, biaya: 70000 },
  { id: "ginjal", nama: "Fungsi Ginjal (Ureum & Kreatinin)", wajibPuasa: false, biaya: 75000 },
];

export default function BookingLaboratoriumPage() {
  const router = useRouter();
  const [selectedTests, setSelectedTests] = React.useState<string[]>(["hematologi"]);
  const [tanggal, setTanggal] = React.useState("2026-10-15");
  const [jamKedatangan, setJamKedatangan] = React.useState("07:30");
  const [loading, setLoading] = React.useState(false);

  const toggleTest = (id: string) => {
    if (selectedTests.includes(id)) {
      if (selectedTests.length === 1) {
        toast.error("Minimal harus memilih satu jenis pemeriksaan laboratorium.");
        return;
      }
      setSelectedTests(selectedTests.filter((t) => t !== id));
    } else {
      setSelectedTests([...selectedTests, id]);
    }
  };

  const hasFasting = selectedTests.some(
    (testId) => LAB_TESTS.find((t) => t.id === testId)?.wajibPuasa
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Booking Laboratorium Berhasil! Tiket LAB-028 diterbitkan. Konfirmasi dikirim via WhatsApp.");
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
          Booking Laboratorium Patologi
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Pilih paket pemeriksaan laboratorium klinis dan waktu kedatangan untuk pengambilan sampel darah/urin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold font-heading">
              Pilih Jenis Pemeriksaan Lab
            </CardTitle>
            <CardDescription className="text-xs">
              Centang seluruh item tes laboratorium yang diminta oleh dokter Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-2.5">
            {LAB_TESTS.map((test) => {
              const isChecked = selectedTests.includes(test.id);
              return (
                <div
                  key={test.id}
                  onClick={() => toggleTest(test.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isChecked
                      ? "border-primary bg-secondary/50 ring-1 ring-primary"
                      : "border-border hover:bg-surface"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary pointer-events-none"
                    />
                    <div>
                      <span className="font-heading font-semibold text-xs text-foreground block">
                        {test.nama}
                      </span>
                      {test.wajibPuasa && (
                        <span className="text-[10px] text-amber-700 font-medium flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="h-3 w-3" />
                          Wajib Puasa ({test.durasiPuasa})
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium text-foreground">
                    Rp {test.biaya.toLocaleString("id-ID")}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Fasting warning banner */}
        {hasFasting && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span>Instruksi Khusus Pemeriksaan Puasa</span>
            </div>
            <p className="leading-relaxed">
              Anda memilih pemeriksaan yang mewajibkan puasa (hanya boleh minum air putih). Pasien dianjurkan tiba sebelum pukul 09:00 WIB di Loket Pengambilan Sampel Gedung C Lantai 1.
            </p>
          </div>
        )}

        {/* Date and Arrival Time */}
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold font-heading">
              Jadwal Waktu Kedatangan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="tgl" className="text-xs">Tanggal Kunjungan Lab *</Label>
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
              <Label htmlFor="jam" className="text-xs">Waktu Rencana Kedatangan *</Label>
              <select
                id="jam"
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={jamKedatangan}
                onChange={(e) => setJamKedatangan(e.target.value)}
              >
                <option value="07:30">07:30 WIB (Pagi - Rekomendasi Puasa)</option>
                <option value="08:30">08:30 WIB (Pagi)</option>
                <option value="10:00">10:00 WIB (Siang)</option>
                <option value="13:00">13:00 WIB (Siang)</option>
                <option value="15:00">15:00 WIB (Sore)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} size="lg" className="w-full text-xs gap-2 h-11">
          <CheckCircle2 className="h-4 w-4" />
          {loading ? "Memproses Antrean Lab..." : "Konfirmasi Booking Laboratorium"}
        </Button>
      </form>
    </div>
  );
}
