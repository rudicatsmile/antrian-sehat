"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, UserPlus, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, HOSPITAL_NAME } from "@/lib/constants";

export default function DaftarPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nik: "",
    namaLengkap: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    noWhatsapp: "",
    alamat: "",
    kategoriPrioritas: "normal",
    setujuPrivasi: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.nik.length !== 16 || !/^\d+$/.test(formData.nik)) {
      toast.error("NIK harus berupa 16 digit angka kependudukan resmi.");
      return;
    }

    if (!formData.namaLengkap.trim()) {
      toast.error("Nama lengkap wajib diisi sesuai KTP.");
      return;
    }

    if (!formData.noWhatsapp.startsWith("08") && !formData.noWhatsapp.startsWith("62")) {
      toast.error("Nomor WhatsApp harus valid diawali 08 atau 62.");
      return;
    }

    if (!formData.setujuPrivasi) {
      toast.error("Anda wajib menyetujui kebijakan pemrosesan data kependudukan.");
      return;
    }

    setLoading(true);
    try {
      const { createPatient } = await import("@/app/actions/pasien");
      const res = await createPatient({
        nik: formData.nik,
        namaLengkap: formData.namaLengkap,
        noWhatsapp: formData.noWhatsapp,
        tanggalLahir: formData.tanggalLahir || "1990-01-01",
        jenisKelamin: formData.jenisKelamin as "L" | "P",
        alamat: formData.alamat,
        kategoriPrioritas: formData.kategoriPrioritas as "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency",
        isPasienLama: false,
      });

      if (res.success) {
        toast.success(`Pendaftaran berhasil! Nomor Rekam Medis Anda: ${res.noRm}.`);
        router.push("/masuk");
      } else {
        toast.error(res.error || "Gagal mendaftarkan pasien baru.");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="border-border shadow-lg">
        <CardHeader className="p-6 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
              Pasien Baru
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold font-heading">
            Registrasi Pasien Baru {HOSPITAL_NAME}
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            Lengkapi data kependudukan Anda untuk pembuatan Rekam Medis digital dan kemudahan booking antrean rawat jalan.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* NIK */}
            <div className="space-y-1.5">
              <Label htmlFor="nik" className="text-xs">Nomor Induk Kependudukan (NIK 16 Digit) *</Label>
              <Input
                id="nik"
                maxLength={16}
                placeholder="Contoh: 3271041508560002"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, "") })}
                required
              />
              <span className="text-[11px] text-muted-foreground block">
                Harus tepat 16 digit angka sesuai e-KTP atau Kartu Keluarga.
              </span>
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-1.5">
              <Label htmlFor="nama" className="text-xs">Nama Lengkap Sesuai KTP *</Label>
              <Input
                id="nama"
                placeholder="Contoh: Budi Santoso"
                value={formData.namaLengkap}
                onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                required
              />
            </div>

            {/* Tanggal Lahir & Jenis Kelamin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tglLahir" className="text-xs">Tanggal Lahir *</Label>
                <Input
                  id="tglLahir"
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

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <Label htmlFor="noWa" className="text-xs">Nomor WhatsApp Aktif *</Label>
              <Input
                id="noWa"
                placeholder="Contoh: 081298765432"
                value={formData.noWhatsapp}
                onChange={(e) => setFormData({ ...formData, noWhatsapp: e.target.value.replace(/\D/g, "") })}
                required
              />
              <span className="text-[11px] text-muted-foreground block">
                Nomor ini akan menerima pesan tiket antrean dan notifikasi giliran tiba.
              </span>
            </div>

            {/* Alamat */}
            <div className="space-y-1.5">
              <Label htmlFor="alamat" className="text-xs">Alamat Domisili Lengkap *</Label>
              <textarea
                id="alamat"
                rows={3}
                className="flex w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Jl. Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan, Kota..."
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                required
              />
            </div>

            {/* Kategori Prioritas */}
            <div className="space-y-1.5">
              <Label htmlFor="prioritas" className="text-xs">Kategori Jalur Layanan</Label>
              <select
                id="prioritas"
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={formData.kategoriPrioritas}
                onChange={(e) => setFormData({ ...formData, kategoriPrioritas: e.target.value })}
              >
                <option value="normal">Umum / Normal</option>
                <option value="lansia">Lansia (Usia 60 tahun ke atas)</option>
                <option value="disabilitas">Disabilitas Fisik / Sensorik</option>
                <option value="ibu_hamil">Ibu Hamil</option>
              </select>
              <span className="text-[11px] text-muted-foreground block">
                Pasien prioritas didahulukan dalam antrean poliklinik dan loket pendaftaran.
              </span>
            </div>

            {/* Privacy Checkbox */}
            <div className="p-3.5 rounded-xl bg-surface border border-border flex items-start gap-3">
              <input
                type="checkbox"
                id="setuju"
                className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                checked={formData.setujuPrivasi}
                onChange={(e) => setFormData({ ...formData, setujuPrivasi: e.target.checked })}
                required
              />
              <Label htmlFor="setuju" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                Saya menyatakan bahwa data yang saya berikan adalah benar, dan saya menyetujui pemrosesan data kependudukan untuk pembuatan rekam medis digital sesuai Kebijakan Privasi {HOSPITAL_NAME}.
              </Label>
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2">
              <UserPlus className="h-4 w-4" />
              {loading ? "Memproses Pendaftaran..." : "Daftar & Terbitkan Nomor Rekam Medis"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="p-6 pt-0 border-t border-border mt-4 text-center text-xs text-muted-foreground justify-center">
          <p>
            Sudah memiliki nomor rekam medis atau pernah berobat?{" "}
            <Link href="/masuk" className="text-primary font-semibold hover:underline">
              Masuk dengan NIK
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
