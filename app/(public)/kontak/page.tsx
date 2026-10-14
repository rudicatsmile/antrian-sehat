"use client";

import * as React from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HOSPITAL_NAME, HOSPITAL_CAMPUS } from "@/lib/constants";

export default function KontakPage() {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    nama: "",
    noWhatsapp: "",
    email: "",
    subjek: "Informasi Antrean",
    pesan: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.noWhatsapp || !formData.pesan) {
      toast.error("Mohon lengkapi nama, nomor WhatsApp, dan isi pesan Anda.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Pesan Anda telah berhasil dikirim ke Petugas Layanan Informasi RSUD Sejahtera Sehat.");
      setFormData({
        nama: "",
        noWhatsapp: "",
        email: "",
        subjek: "Informasi Antrean",
        pesan: "",
      });
    }, 800);
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 space-y-12">
      {/* Header */}
      <div className="max-w-2xl space-y-3">
        <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
          Kontak & Pengaduan
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
          Hubungi Kami & Lokasi Rumah Sakit
        </h1>
        <p className="text-sm text-muted-foreground">
          Tim Humas dan Layanan Pelanggan kami siap membantu menjawab pertanyaan Anda terkait jadwal dokter, rujukan, atau bantuan pendaftaran.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Kontak */}
        <div className="lg:col-span-7">
          <Card className="border-border">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-lg">Kirim Pesan Pertanyaan / Masukan</CardTitle>
              <CardDescription className="text-xs">
                Pesan Anda akan diteruskan ke tim layanan pengaduan resmi RSUD Sejahtera Sehat.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nama" className="text-xs">Nama Lengkap Pasien / Penanya *</Label>
                  <Input
                    id="nama"
                    placeholder="Contoh: Budi Santoso"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="noWa" className="text-xs">Nomor WhatsApp Aktif *</Label>
                    <Input
                      id="noWa"
                      placeholder="081234567890"
                      value={formData.noWhatsapp}
                      onChange={(e) => setFormData({ ...formData, noWhatsapp: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs">Alamat Email (Opsional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="subjek" className="text-xs">Kategori Pertanyaan</Label>
                  <select
                    id="subjek"
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={formData.subjek}
                    onChange={(e) => setFormData({ ...formData, subjek: e.target.value })}
                  >
                    <option value="Informasi Antrean">Informasi Booking & Antrean</option>
                    <option value="Jadwal Dokter">Konfirmasi Jadwal Praktik Dokter</option>
                    <option value="Rawat Inap">Ketersediaan Kamar Rawat Inap</option>
                    <option value="Pengaduan Layanan">Pengaduan / Keluhan Layanan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pesan" className="text-xs">Isi Pesan / Pertanyaan *</Label>
                  <textarea
                    id="pesan"
                    rows={4}
                    className="flex w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    placeholder="Tuliskan pertanyaan atau kendala yang Anda alami secara jelas..."
                    value={formData.pesan}
                    onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full text-xs gap-2">
                  <Send className="h-3.5 w-3.5" />
                  {loading ? "Mengirim Pesan..." : "Kirimkan Pesan Anda"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Kontak & Peta Statis */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-base">Informasi Kontak Resmi</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-xs text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground block">Alamat Rumah Sakit:</span>
                  <span>{HOSPITAL_CAMPUS}, Jl. Pemuda Sehat No. 108, Kota Depok, Jawa Barat 16431</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground block">Call Center Pendaftaran:</span>
                  <span>(021) 7788-9900 (Senin - Sabtu, 07:00 - 15:00 WIB)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground block">WhatsApp Layanan Pasien:</span>
                  <span>+62 812-9876-5432 (Respon Otomatis 24 Jam)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-foreground block">Email Resmi:</span>
                  <span>humas@rsud-sejahtera.go.id / pengaduan@rsud-sejahtera.go.id</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Static Map View */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Peta Lokasi Kampus RSUD</span>
              <Badge variant="outline" className="text-[10px] bg-secondary text-primary">GPS Ready</Badge>
            </div>
            {/* Visual Static Hospital Map Simulator */}
            <div className="h-48 rounded-lg bg-slate-100 border border-border flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:16px_16px]" />
              <MapPin className="h-8 w-8 text-primary animate-bounce mb-2" />
              <span className="font-bold text-xs text-foreground block">{HOSPITAL_NAME}</span>
              <span className="text-[11px] text-muted-foreground">Area Kampus Utama Gedung A, B, C</span>
              <span className="text-[10px] text-primary underline mt-2 block font-medium cursor-pointer">
                Buka di Google Maps
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
