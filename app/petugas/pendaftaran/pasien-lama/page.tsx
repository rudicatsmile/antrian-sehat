"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, CheckCircle2, FileClock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PasienLamaPage() {
  const router = useRouter();
  const [searchNik, setSearchNik] = React.useState("3271048809620004");
  const [hasSearched, setHasSearched] = React.useState(false);
  const [foundPatient, setFoundPatient] = React.useState<{
    nik: string;
    nama: string;
    tglLahir: string;
    arsipLamaNo: string;
    alamat: string;
  } | null>(null);

  const [loading, setLoading] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchNik.length !== 16) {
      toast.error("Masukkan 16 digit NIK kependudukan.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHasSearched(true);
      // Dummy search result
      setFoundPatient({
        nik: searchNik,
        nama: "Iskandar Zulkarnain",
        tglLahir: "1962-09-18",
        arsipLamaNo: "ARSIP-MANUAL-1998/142",
        alamat: "Jl. Cendrawasih No. 18, Beji, Depok",
      });
    }, 600);
  };

  const handleCreateDigitalRm = async () => {
    if (!foundPatient) return;
    setLoading(true);
    try {
      const { createPatient } = await import("@/app/actions/pasien");
      const res = await createPatient({
        nik: foundPatient.nik,
        namaLengkap: foundPatient.nama,
        noWhatsapp: "081298765432",
        tanggalLahir: foundPatient.tglLahir,
        jenisKelamin: "L",
        alamat: foundPatient.alamat,
        kategoriPrioritas: "lansia",
        isPasienLama: true,
      });

      if (res.success) {
        toast.success(`Rekam Medis Digital ${res.noRm} Berhasil Diterbitkan untuk ${foundPatient.nama}!`);
        router.push("/petugas/pendaftaran");
      } else {
        toast.error(res.error || "Gagal menerbitkan rekam medis digital.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menerbitkan rekam medis digital.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Link
        href="/petugas/pendaftaran"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Loket Pendaftaran
      </Link>

      <div className="space-y-1">
        <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
          Migrasi Pasien Lama
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
          Pasien Lama Tanpa Rekam Medis Digital
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Cari data kependudukan pasien lama berdasarkan NIK e-KTP untuk menerbitkan nomor Rekam Medis digital resmi.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-base">Pencarian Arsip Pasien</CardTitle>
          <CardDescription className="text-xs">
            Masukkan NIK 16 digit untuk memindai berkas arsip pasien manual terdahulu.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              maxLength={16}
              placeholder="3271xxxxxxxxxxxx"
              value={searchNik}
              onChange={(e) => setSearchNik(e.target.value.replace(/\D/g, ""))}
              className="font-mono text-sm"
              required
            />
            <Button type="submit" disabled={loading} className="gap-2 text-xs shrink-0">
              <Search className="h-4 w-4" />
              {loading ? "Mencari..." : "Cari di Arsip"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result Card */}
      {hasSearched && (
        <Card className="border-border">
          <CardHeader className="p-6 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Hasil Pencarian Berkas Arsip</CardTitle>
              <Badge variant="outline" className="text-xs bg-amber-50 text-amber-800 border-amber-200">
                Belum Punya RM Digital
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            {foundPatient ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface border border-border text-xs space-y-2">
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Nama Pasien:</span>
                    <span className="font-bold text-foreground">{foundPatient.nama}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">NIK:</span>
                    <span className="font-mono">{foundPatient.nik}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Tanggal Lahir:</span>
                    <span>{foundPatient.tglLahir}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-muted-foreground">Nomor Arsip Fisik:</span>
                    <span className="font-mono font-semibold text-teal-800">{foundPatient.arsipLamaNo}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Alamat:</span>
                    <span className="text-right">{foundPatient.alamat}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs">
                  Berkas fisik ditemukan. Klik tombol di bawah untuk menerbitkan Rekam Medis digital format <strong>RM-YYYY-XXXXXX</strong> dan mengirimkan undangan aktivasi via WhatsApp.
                </div>

                <Button
                  onClick={handleCreateDigitalRm}
                  disabled={loading}
                  className="w-full text-xs gap-2 h-10"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {loading ? "Menerbitkan..." : "Terbitkan Nomor Rekam Medis Digital Resmi"}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Data tidak ditemukan di arsip manual. Silakan arahkan pasien ke Form Pasien Baru.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
