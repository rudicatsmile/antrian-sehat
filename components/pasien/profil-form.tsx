"use client";

import * as React from "react";
import { User, ShieldCheck, Upload, Save, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientProfile } from "@/lib/types";

interface ProfilFormProps {
  initialProfile: PatientProfile | null;
}

export function ProfilForm({ initialProfile }: ProfilFormProps) {
  const [profile, setProfile] = React.useState<PatientProfile>(
    initialProfile || {
      id: "",
      nik: "Belum terdaftar",
      namaLengkap: "",
      noWhatsapp: "",
      tanggalLahir: "1990-01-01",
      jenisKelamin: "L",
      alamat: "",
      noRm: "RM-BARU",
      kategoriPrioritas: "normal",
    }
  );
  const [uploadedDoc, setUploadedDoc] = React.useState<string | null>(
    profile.dokumenPrioritasName || null
  );
  const [loading, setLoading] = React.useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile.id) {
      try {
        const { uploadPatientDocument } = await import("@/lib/storage");
        const res = await uploadPatientDocument(profile.id, "prioritas", file);
        if (res.success) {
          setUploadedDoc(file.name);
          toast.success(`Dokumen ${file.name} berhasil diunggah ke penyimpanan berkas aman (Supabase Storage).`);
        } else {
          toast.error(res.error || "Gagal mengunggah berkas.");
        }
      } catch (err: any) {
        toast.error(err.message || "Gagal mengunggah berkas.");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.id) {
      toast.error("Profil pasien belum tersimpan di database.");
      return;
    }

    setLoading(true);
    try {
      const { updatePatient } = await import("@/app/actions/pasien");
      const res = await updatePatient(profile.id, {
        nama_lengkap: profile.namaLengkap,
        no_whatsapp: profile.noWhatsapp,
        alamat: profile.alamat,
        kategori_prioritas: profile.kategoriPrioritas as any,
      });

      if (res.success) {
        toast.success("Profil data pasien dan dokumen pendukung prioritas berhasil diperbarui!");
      } else {
        toast.error(res.error || "Gagal memperbarui profil.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Identitas Dasar (Readonly / Locked NIK & RM) */}
      <Card className="border-border">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold font-heading">
            Identitas Kependudukan & Medis
          </CardTitle>
          <CardDescription className="text-xs">
            NIK dan Nomor Rekam Medis (RM) dikunci oleh sistem untuk mencegah duplikasi data medis.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">NIK (16 Digit)</Label>
            <Input value={profile.nik} readOnly className="bg-surface font-mono cursor-not-allowed" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Nomor Rekam Medis Digital</Label>
            <Input value={profile.noRm} readOnly className="bg-surface font-mono font-bold text-primary cursor-not-allowed" />
          </div>
        </CardContent>
      </Card>

      {/* Data Diri yang dapat diedit */}
      <Card className="border-border">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold font-heading">
            Data Pribadi & Kontak
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nama" className="text-xs">Nama Lengkap Sesuai KTP *</Label>
            <Input
              id="nama"
              value={profile.namaLengkap}
              onChange={(e) => setProfile({ ...profile, namaLengkap: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="wa" className="text-xs">Nomor WhatsApp Aktif *</Label>
              <Input
                id="wa"
                value={profile.noWhatsapp}
                onChange={(e) => setProfile({ ...profile, noWhatsapp: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tglLahir" className="text-xs">Tanggal Lahir</Label>
              <Input
                id="tglLahir"
                type="date"
                value={profile.tanggalLahir}
                onChange={(e) => setProfile({ ...profile, tanggalLahir: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="alamat" className="text-xs">Alamat Domisili Lengkap *</Label>
            <textarea
              id="alamat"
              rows={3}
              className="flex w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={profile.alamat}
              onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Jalur Prioritas & Dokumen Pendukung */}
      <Card className="border-border">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-sm font-semibold font-heading">
            Kategori Jalur Prioritas & Dokumen Bukti
          </CardTitle>
          <CardDescription className="text-xs">
            Unggah dokumen pendukung resmi (KTP untuk lansia, surat disabilitas, buku KIA untuk ibu hamil) maksimal 2 MB format PDF/JPG/PNG.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="prioritas" className="text-xs">Kategori Prioritas Layanan</Label>
            <select
              id="prioritas"
              className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={profile.kategoriPrioritas}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  kategoriPrioritas: e.target.value as "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency",
                })
              }
            >
              <option value="normal">Normal / Umum</option>
              <option value="lansia">Lansia (Usia &gt; 60 Tahun)</option>
              <option value="disabilitas">Disabilitas Fisik / Sensorik</option>
              <option value="ibu_hamil">Ibu Hamil</option>
            </select>
          </div>

          {/* Document upload box */}
          <div className="p-4 rounded-xl border border-dashed border-border bg-surface text-center space-y-2">
            <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
            <div className="text-xs font-semibold text-foreground">
              {uploadedDoc ? `Dokumen terunggah: ${uploadedDoc}` : "Unggah Dokumen Pendukung Prioritas"}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Format didukung: PDF, JPG, PNG (Maks 2 MB). Tersimpan di bucket privat Supabase Storage.
            </p>
            <label className="inline-block mt-2">
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg"
                className="hidden"
                onChange={handleFileUpload}
              />
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background border border-border text-xs font-medium cursor-pointer hover:bg-muted transition-colors">
                <FileText className="h-3.5 w-3.5 text-primary" />
                Pilih Berkas Dokumen
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} size="lg" className="w-full text-xs gap-2 h-11">
        <Save className="h-4 w-4" />
        {loading ? "Menyimpan Perubahan..." : "Simpan Pembaruan Profil"}
      </Button>
    </form>
  );
}
