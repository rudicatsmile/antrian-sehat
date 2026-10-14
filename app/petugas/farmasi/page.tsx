"use client";

import * as React from "react";
import { Pill, Clock, PlayCircle, CheckCircle2, RotateCcw, AlertCircle, Settings2, Sliders } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PharmacyQueueItem {
  id: string;
  nomorTiket: string;
  namaPasien: string;
  jenis: "rawat_jalan" | "racik" | "pasca_inap" | "konsultasi";
  noResep: string;
  status: "menunggu" | "diracik" | "siap" | "selesai";
  durasiRacikMenit?: number;
  waktuMasuk: string;
}

const INITIAL_PHARMACY_QUEUE: PharmacyQueueItem[] = [
  { id: "ph-1", nomorTiket: "FAR-PI-002", namaPasien: "Ny. Ratnawati", jenis: "pasca_inap", noResep: "RXP-2026-00401", status: "diracik", durasiRacikMenit: 10, waktuMasuk: "08:50 WIB" },
  { id: "ph-2", nomorTiket: "FAR-RC-012", namaPasien: "An. Farhan Maulana", jenis: "racik", noResep: "RXP-2026-00405", status: "diracik", durasiRacikMenit: 15, waktuMasuk: "09:05 WIB" },
  { id: "ph-3", nomorTiket: "FAR-RJ-024", namaPasien: "Budi Santoso", jenis: "rawat_jalan", noResep: "RXP-2026-00412", status: "siap", durasiRacikMenit: 5, waktuMasuk: "09:12 WIB" },
  { id: "ph-4", nomorTiket: "FAR-RC-013", namaPasien: "Dewi Anggraini", jenis: "racik", noResep: "RXP-2026-00418", status: "menunggu", durasiRacikMenit: 20, waktuMasuk: "09:15 WIB" },
  { id: "ph-5", nomorTiket: "FAR-KS-001", namaPasien: "Agus Setiawan", jenis: "konsultasi", noResep: "RXP-2026-00398", status: "menunggu", durasiRacikMenit: 10, waktuMasuk: "09:20 WIB" },
];

export default function PetugasFarmasiPage() {
  const [queue, setQueue] = React.useState<PharmacyQueueItem[]>(INITIAL_PHARMACY_QUEUE);
  const [racikSortMode, setRacikSortMode] = React.useState<"berdasarkan_durasi" | "acak">("berdasarkan_durasi");

  const handleCall = (item: PharmacyQueueItem) => {
    toast.success(`Nomor Antrean Farmasi ${item.nomorTiket} (${item.namaPasien}) dipanggil ke Loket Penyerahan Obat!`);
  };

  const handleReady = (id: string) => {
    setQueue(queue.map((q) => (q.id === id ? { ...q, status: "siap" } : q)));
    toast.success("Status obat berubah menjadi SIAP. Notifikasi WhatsApp otomatis dikirimkan ke pasien.");
  };

  const handleComplete = (id: string) => {
    setQueue(queue.filter((q) => q.id !== id));
    toast.success("Obat berhasil diserahkan dan verifikasi resep telah selesai.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Apotek & Farmasi Rawat Jalan
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Manajemen Antrean Farmasi & Obat Racik
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pengelolaan antrean obat non-racik, peracikan puyer/kapsul, obat pascarawat inap, dan konseling apoteker.
          </p>
        </div>

        {/* Configuration sorting mode */}
        <div className="flex items-center gap-2 bg-surface p-1.5 rounded-lg border border-border text-xs">
          <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Mode Racik:</span>
          <select
            className="bg-background border border-border rounded px-2 py-1 text-xs font-medium"
            value={racikSortMode}
            onChange={(e) => setRacikSortMode(e.target.value as "berdasarkan_durasi" | "acak")}
          >
            <option value="berdasarkan_durasi">Berdasarkan Durasi (Paling Cepat)</option>
            <option value="acak">Acak / Nomor Masuk</option>
          </select>
        </div>
      </div>

      {/* Queue Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-border">
          <span className="text-xs text-muted-foreground">Obat Pasca Inap (Prioritas)</span>
          <div className="text-2xl font-bold font-mono text-purple-700 mt-1">
            {queue.filter((q) => q.jenis === "pasca_inap").length}
          </div>
        </Card>
        <Card className="p-4 border-border">
          <span className="text-xs text-muted-foreground">Obat Racik (Sedang Diracik)</span>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-1">
            {queue.filter((q) => q.jenis === "racik").length}
          </div>
        </Card>
        <Card className="p-4 border-border">
          <span className="text-xs text-muted-foreground">Obat Non-Racik (Siap Serah)</span>
          <div className="text-2xl font-bold font-mono text-teal-800 mt-1">
            {queue.filter((q) => q.status === "siap").length}
          </div>
        </Card>
        <Card className="p-4 border-border">
          <span className="text-xs text-muted-foreground">Konseling Obat Apoteker</span>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1">
            {queue.filter((q) => q.jenis === "konsultasi").length}
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="border-border">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-heading">
            Daftar Antrean Resep Farmasi Hari Ini
          </CardTitle>
          <CardDescription className="text-xs">
            Obat pascarawat inap didahulukan. Pasien yang berstatus &quot;Siap&quot; dipanggil ke loket penyerahan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">No. Tiket</th>
                  <th className="p-3">Nama Pasien</th>
                  <th className="p-3">Kategori Resep</th>
                  <th className="p-3">No. Resep Elektronik</th>
                  <th className="p-3">Durasi Racik</th>
                  <th className="p-3">Status Resep</th>
                  <th className="p-3 text-right">Aksi Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/50">
                    <td className="p-3 font-mono font-bold text-foreground">{item.nomorTiket}</td>
                    <td className="p-3 font-semibold text-foreground">{item.namaPasien}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {item.jenis.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{item.noResep}</td>
                    <td className="p-3 font-mono">~{item.durasiRacikMenit} menit</td>
                    <td className="p-3">
                      <Badge
                        className={
                          item.status === "siap"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : item.status === "diracik"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-surface text-muted-foreground border-border"
                        }
                      >
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      {item.status !== "siap" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReady(item.id)}
                          className="text-[11px] h-7"
                        >
                          Tandai Siap
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleCall(item)}
                        className="text-[11px] h-7 bg-teal-700 hover:bg-teal-800 text-white"
                      >
                        <PlayCircle className="h-3 w-3 mr-1" />
                        Panggil ke Loket
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleComplete(item.id)}
                        className="text-[11px] h-7 text-emerald-700 hover:text-emerald-800"
                      >
                        Serahkan
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
