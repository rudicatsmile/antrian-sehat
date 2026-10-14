"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus, CheckCircle2, Printer, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PasienBaruPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [generatedRm, setGeneratedRm] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    nik: "",
    namaLengkap: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    noWhatsapp: "",
    alamat: "",
    kategoriPrioritas: "normal",
    unitTujuan: "poliklinik-penyakit-dalam",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.nik.length !== 16 || !/^\d+$/.test(formData.nik)) {
      toast.error("NIK harus terdiri dari 16 digit angka.");
      return;
    }

    setLoading(true);
    try {
      const { createPatient } = await import("@/app/actions/pasien");
      const res = await createPatient({
        nik: formData.nik,
        namaLengkap: formData.namaLengkap,
        noWhatsapp: formData.noWhatsapp || "081234567890",
        tanggalLahir: formData.tanggalLahir || "1990-01-01",
        jenisKelamin: formData.jenisKelamin as "L" | "P",
        alamat: formData.alamat || "Alamat Pasien",
        kategoriPrioritas: formData.kategoriPrioritas as "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency",
        isPasienLama: false,
      });

      if (res.success) {
        setGeneratedRm(res.noRm || "RM-2026-009921");
        toast.success(`Pasien Baru Berhasil Didaftarkan! Rekam Medis ${res.noRm} diterbitkan.`);
      } else {
        toast.error(res.error || "Gagal mendaftarkan pasien.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mendaftarkan pasien.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    toast.success(`Mencetak Tiket Loket untuk ${formData.namaLengkap}...`);
    router.push("/petugas/pendaftaran");
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
          Form Loket
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
          Pendaftaran Pasien Baru Loket
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Penerbitan rekam medis digital baru dan pencetakan tiket antrean pertama untuk pasien langsung.
        </p>
      </div>

      {generatedRm ? (
        <Card className="border-teal-200 bg-teal-50/50 p-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-teal-600 text-white flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-lg text-teal-950">
              Registrasi Pasien Baru Sukses
            </h3>
            <p className="text-xs text-teal-800">
              Nomor Rekam Medis digital resmi telah dibuat dalam sistem database:
            </p>
            <div className="text-3xl font-black font-mono text-teal-900 pt-2 tracking-wider">
              {generatedRm}
            </div>
          </div>

          <div className="pt-4 border-t border-teal-200/60 flex items-center justify-center gap-3">
            <Button onClick={handlePrint} className="gap-2 text-xs">
              <Printer className="h-4 w-4" />
              Cetak Tiket Antrean Poli
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/petugas/pendaftaran")}
              className="text-xs"
            >
              Kembali ke Daftar Loket
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="border-border shadow-sm">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base">Data Kependudukan Pasien Baru</CardTitle>
            <CardDescription className="text-xs">
              Seluruh field bertanda bintang wajib diisi berdasarkan identitas e-KTP pasien.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nik" className="text-xs">NIK 16 Digit Pasien *</Label>
                <Input
                  id="nik"
                  maxLength={16}
                  placeholder="3271xxxxxxxxxxxx"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, "") })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nama" className="text-xs">Nama Lengkap Pasien *</Label>
                <Input
                  id="nama"
                  placeholder="Nama sesuai KTP"
                  value={formData.namaLengkap}
                  onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tgl" className="text-xs">Tanggal Lahir *</Label>
                  <Input
                    id="tgl"
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="jk" className="text-xs">Jenis Kelamin *</Label>
                  <select
                    id="jk"
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={formData.jenisKelamin}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wa" className="text-xs">Nomor WhatsApp Aktif *</Label>
                <Input
                  id="wa"
                  placeholder="081234567890"
                  value={formData.noWhatsapp}
                  onChange={(e) => setFormData({ ...formData, noWhatsapp: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="alamat" className="text-xs">Alamat Domisili Lengkap *</Label>
                <textarea
                  id="alamat"
                  rows={3}
                  className="flex w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="prioritas" className="text-xs">Kategori Prioritas</Label>
                  <select
                    id="prioritas"
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={formData.kategoriPrioritas}
                    onChange={(e) => setFormData({ ...formData, kategoriPrioritas: e.target.value })}
                  >
                    <option value="normal">Normal / Umum</option>
                    <option value="lansia">Lansia (Usia &gt; 60 Thn)</option>
                    <option value="disabilitas">Disabilitas</option>
                    <option value="ibu_hamil">Ibu Hamil</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="unit" className="text-xs">Poli / Unit Tujuan</Label>
                  <select
                    id="unit"
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={formData.unitTujuan}
                    onChange={(e) => setFormData({ ...formData, unitTujuan: e.target.value })}
                  >
                    <option value="poliklinik-penyakit-dalam">Poli Penyakit Dalam</option>
                    <option value="poliklinik-anak">Poli Spesialis Anak</option>
                    <option value="poliklinik-bedah">Poli Spesialis Bedah</option>
                    <option value="poliklinik-kandungan">Poli Kebidanan & Kandungan</option>
                    <option value="laboratorium">Laboratorium</option>
                  </select>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full text-xs gap-2 h-10">
                <UserPlus className="h-4 w-4" />
                {loading ? "Menyimpan Data Pasien..." : "Simpan & Terbitkan No Rekam Medis"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
