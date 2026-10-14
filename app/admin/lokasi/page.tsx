"use client";

import * as React from "react";
import { Building, Plus, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BUILDINGS } from "@/lib/constants";

interface BuildingItem {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  alamat: string;
  isActive: boolean;
}

export default function AdminLokasiPage() {
  const [buildings, setBuildings] = React.useState<BuildingItem[]>([
    { id: "bld-a", kode: "A", nama: "Gedung A", deskripsi: "Rawat Jalan dan Pendaftaran", alamat: "Sayap Barat Kampus Utama", isActive: true },
    { id: "bld-b", kode: "B", nama: "Gedung B", deskripsi: "IGD dan Rawat Inap", alamat: "Sayap Timur Kampus Utama", isActive: true },
    { id: "bld-c", kode: "C", nama: "Gedung C", deskripsi: "Penunjang Medis (Lab, Rad, Far)", alamat: "Area Tengah Kampus Utama", isActive: true },
  ]);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    kode: "",
    nama: "",
    deskripsi: "",
    alamat: "",
  });

  const handleAddBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kode || !formData.nama) {
      toast.error("Kode dan Nama Gedung wajib diisi.");
      return;
    }

    const newBuilding: BuildingItem = {
      id: `bld-${Date.now()}`,
      kode: formData.kode.toUpperCase(),
      nama: formData.nama,
      deskripsi: formData.deskripsi,
      alamat: formData.alamat,
      isActive: true,
    };

    setBuildings([...buildings, newBuilding]);
    setModalOpen(false);
    toast.success(`Gedung ${formData.nama} berhasil ditambahkan ke database master lokasi.`);
    setFormData({ kode: "", nama: "", deskripsi: "", alamat: "" });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Master Fasilitas Fisik
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Kelola Lokasi & Gedung RSUD
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Konfigurasi kode gedung, alamat lokasi, dan pemisahan data antrean per unit bangunan.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          + Tambah Gedung Baru
        </Button>
      </div>

      <Card className="border-border shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Kode Gedung</th>
                  <th className="p-4">Nama Gedung</th>
                  <th className="p-4">Deskripsi Peruntukan</th>
                  <th className="p-4">Lokasi Area</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {buildings.map((b) => (
                  <tr key={b.id} className="hover:bg-surface/50">
                    <td className="p-4">
                      <span className="font-mono font-bold text-xs px-2.5 py-1 rounded bg-teal-100 text-teal-800 border border-teal-200">
                        {b.kode}
                      </span>
                    </td>
                    <td className="p-4 font-heading font-bold text-sm text-foreground">
                      {b.nama}
                    </td>
                    <td className="p-4 text-muted-foreground max-w-xs">{b.deskripsi}</td>
                    <td className="p-4 text-muted-foreground">{b.alamat}</td>
                    <td className="p-4">
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                        Aktif
                      </Badge>
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] h-7"
                        onClick={() => toast.info(`Mengubah konfigurasi ${b.nama}`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Gedung Baru</DialogTitle>
            <DialogDescription className="text-xs">
              Mendaftarkan data master gedung baru di lingkungan kampus rumah sakit.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddBuilding} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">Kode Gedung (1-3 Karakter) *</label>
                <Input
                  maxLength={3}
                  placeholder="Contoh: D"
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Nama Gedung *</label>
                <Input
                  placeholder="Contoh: Gedung D"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Deskripsi Peruntukan Layanan</label>
              <Input
                placeholder="Contoh: Paviliun Khusus & Diagnostic Center"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium">Lokasi Area / Alamat</label>
              <Input
                placeholder="Contoh: Sayap Utara Kampus Utama"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full text-xs h-10">
              Simpan Master Gedung
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
