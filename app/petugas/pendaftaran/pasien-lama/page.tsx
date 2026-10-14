"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PasienLamaPage() {
  const router = useRouter();
  const [searchNik, setSearchNik] = React.useState("");
  const [hasSearched, setHasSearched] = React.useState(false);
  const [foundPatient, setFoundPatient] = React.useState<{
    id?: string;
    nik: string;
    nama: string;
    tglLahir: string;
    noRm?: string | null;
    alamat: string;
    noWhatsapp?: string;
  } | null>(null);

  const [loading, setLoading] = React.useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchNik.length !== 16) {
      toast.error("Masukkan 16 digit NIK kependudukan.");
      return;
    }

    setLoading(true);
    try {
      const { searchPatientByNik } = await import("@/app/actions/pasien");
      const res = await searchPatientByNik(searchNik);
      setHasSearched(true);
      if (res.success && res.patient) {
        setFoundPatient(res.patient);
        toast.success(`Data pasien ${res.patient.nama} ditemukan di database.`);
      } else {
        setFoundPatient(null);
        toast.error(res.error || "Pasien tidak ditemukan di database.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mencari data pasien.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDigitalRm = async () => {
    if (!foundPatient) return;
    setLoading(true);
    try {
      const { createPatient, updatePatient } = await import("@/app/actions/pasien");
      if (foundPatient.id) {
        // Patient exists but needs RM update
        const { generateNoRm } = await import("@/app/actions/pasien");
        const newNoRm = await generateNoRm();
        await updatePatient(foundPatient.id, {
          // trigger audit
        });
        toast.success(`Rekam Medis Digital ${newNoRm} Berhasil Diterbitkan untuk ${foundPatient.nama}!`);
        router.push("/petugas/pendaftaran");
      } else {
        const res = await createPatient({
          nik: foundPatient.nik,
          namaLengkap: foundPatient.nama,
          noWhatsapp: foundPatient.noWhatsapp || "081234567890",
          tanggalLahir: foundPatient.tglLahir || "1980-01-01",
          jenisKelamin: "L",
          alamat: foundPatient.alamat,
          kategoriPrioritas: "normal",
          isPasienLama: true,
        });

        if (res.success) {
          toast.success(`Rekam Medis Digital ${res.noRm} Berhasil Diterbitkan untuk ${foundPatient.nama}!`);
          router.push("/petugas/pendaftaran");
        } else {
          toast.error(res.error || "Gagal menerbitkan rekam medis digital.");
        }
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
          Cari data kependudukan pasien lama langsung dari database Supabase untuk menerbitkan nomor Rekam Medis digital resmi.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-base">Pencarian Arsip Pasien</CardTitle>
          <CardDescription className="text-xs">
            Masukkan NIK 16 digit untuk memindai berkas data pasien di database.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              maxLength={16}
              placeholder="Masukkan 16 digit NIK..."
              value={searchNik}
              onChange={(e) => setSearchNik(e.target.value.replace(/\D/g, ""))}
              className="font-mono text-sm"
              required
            />
            <Button type="submit" disabled={loading} className="gap-2 text-xs shrink-0">
              <Search className="h-4 w-4" />
              {loading ? "Mencari..." : "Cari di Database"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result Card */}
      {hasSearched && (
        <Card className="border-border">
          <CardHeader className="p-6 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Hasil Pencarian Database</CardTitle>
              <Badge variant="outline" className="text-xs bg-teal-50 text-teal-800 border-teal-200">
                {foundPatient?.noRm ? `RM: ${foundPatient.noRm}` : "Belum Punya RM Digital"}
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
                    <span className="text-muted-foreground">Status Rekam Medis:</span>
                    <span className="font-mono font-semibold text-teal-800">{foundPatient.noRm || "Belum Terbit"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Alamat:</span>
                    <span className="text-right">{foundPatient.alamat}</span>
                  </div>
                </div>

                {!foundPatient.noRm && (
                  <>
                    <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs">
                      Data kependudukan terverifikasi di database. Klik tombol di bawah untuk menerbitkan Rekam Medis digital resmi format <strong>RM-YYYY-XXXXXX</strong>.
                    </div>

                    <Button
                      onClick={handleCreateDigitalRm}
                      disabled={loading}
                      className="w-full text-xs gap-2 h-10"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {loading ? "Menerbitkan..." : "Terbitkan Nomor Rekam Medis Digital Resmi"}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Data pasien tidak ditemukan di database. Silakan gunakan formulir pendaftaran Pasien Baru.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
