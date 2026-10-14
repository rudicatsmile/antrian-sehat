"use client";

import * as React from "react";
import {
  UserPlus,
  PlayCircle,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DUMMY_TRIAGE_TICKETS, TriageTicket } from "@/lib/dummy/petugas";

export default function TriaseIGDPage() {
  const [tickets, setTickets] = React.useState<TriageTicket[]>(DUMMY_TRIAGE_TICKETS);
  const [showAddModal, setShowAddModal] = React.useState(false);

  // New Triage Form State
  const [newPatient, setNewPatient] = React.useState({
    namaPasien: "",
    usia: "",
    keluhan: "",
    level: "kuning" as "merah" | "kuning" | "hijau",
    tensi: "120/80 mmHg",
    nadi: "85 x/m",
    rr: "20 x/m",
    spo2: "98%",
    suhu: "36.8 °C",
  });

  // Sort queue strictly: Merah first, then Kuning, then Hijau
  const sortedTickets = [...tickets].sort((a, b) => {
    const order = { merah: 1, kuning: 2, hijau: 3 };
    return order[a.level] - order[b.level];
  });

  const redCount = tickets.filter((t) => t.level === "merah" && t.status !== "selesai").length;
  const yellowCount = tickets.filter((t) => t.level === "kuning" && t.status !== "selesai").length;
  const greenCount = tickets.filter((t) => t.level === "hijau" && t.status !== "selesai").length;

  const handleAddTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.namaPasien.trim() || !newPatient.keluhan.trim()) {
      toast.error("Mohon lengkapi nama pasien dan keluhan utama.");
      return;
    }

    const prefix = newPatient.level === "merah" ? "TRG-M" : newPatient.level === "kuning" ? "TRG-K" : "TRG-H";
    const newNumber = `${prefix}-00${Math.floor(10 + Math.random() * 90)}`;

    const newTicket: TriageTicket = {
      id: `trg-${Date.now()}`,
      nomorTiket: newNumber,
      namaPasien: newPatient.namaPasien,
      usia: parseInt(newPatient.usia) || 30,
      keluhan: newPatient.keluhan,
      level: newPatient.level,
      tandaVital: {
        tensi: newPatient.tensi,
        nadi: newPatient.nadi,
        rr: newPatient.rr,
        spo2: newPatient.spo2,
        suhu: newPatient.suhu,
      },
      waktuMasuk: "Baru Saja",
      status: "menunggu",
      perawatPemeriksa: "Ns. Maya Astuti, S.Kep",
    };

    setTickets([newTicket, ...tickets]);
    setShowAddModal(false);
    toast.success(`Tiket Triase ${newNumber} (${newPatient.level.toUpperCase()}) Berhasil Dibuat!`);
    setNewPatient({
      namaPasien: "",
      usia: "",
      keluhan: "",
      level: "kuning",
      tensi: "120/80 mmHg",
      nadi: "85 x/m",
      rr: "20 x/m",
      spo2: "98%",
      suhu: "36.8 °C",
    });
  };

  const handleMoveTriage = async (ticket: TriageTicket, newLevel: "merah" | "kuning" | "hijau") => {
    try {
      const { moveTriageLevel } = await import("@/app/actions/petugas");
      const res = await moveTriageLevel(ticket.id, newLevel, "staff-triage-id", "Evaluasi ulang tanda vital");
      if (res.success) {
        setTickets(tickets.map((t) => (t.id === ticket.id ? { ...t, level: newLevel } : t)));
        toast.success(res.message || `Level triase berhasil diubah ke ${newLevel.toUpperCase()}`);
      } else {
        toast.error(res.error || "Gagal mengubah level triase.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah level triase.");
    }
  };

  const handleCall = async (ticket: TriageTicket) => {
    try {
      const { callNextTicket } = await import("@/app/actions/petugas");
      await callNextTicket(ticket.id, "Ruang Resusitasi/Tindakan IGD", "staff-triage-id");
      setTickets(
        tickets.map((t) =>
          t.id === ticket.id ? { ...t, status: "dipanggil" } : t
        )
      );
      toast.success(`Nomor ${ticket.nomorTiket} (${ticket.namaPasien}) DIPANGGIL ke Ruang Tindakan IGD.`);
    } catch {
      setTickets(
        tickets.map((t) =>
          t.id === ticket.id ? { ...t, status: "dipanggil" } : t
        )
      );
    }
  };

  const handleServe = async (ticket: TriageTicket) => {
    try {
      const { serveTicket } = await import("@/app/actions/petugas");
      await serveTicket(ticket.id, "staff-triage-id");
      setTickets(
        tickets.map((t) =>
          t.id === ticket.id ? { ...t, status: "dilayani" } : t
        )
      );
      toast.success(`Pasien ${ticket.namaPasien} (${ticket.nomorTiket}) sedang DILAYANI tim medis IGD.`);
    } catch {
      setTickets(
        tickets.map((t) =>
          t.id === ticket.id ? { ...t, status: "dilayani" } : t
        )
      );
    }
  };

  const handleComplete = async (ticket: TriageTicket) => {
    try {
      const { completeTicket } = await import("@/app/actions/petugas");
      await completeTicket(ticket.id, "staff-triage-id");
      setTickets(
        tickets.map((t) =>
          t.id === ticket.id ? { ...t, status: "selesai" } : t
        )
      );
      toast.success(`Tindakan IGD untuk ${ticket.namaPasien} telah SELESAI.`);
    } catch {
      setTickets(
        tickets.map((t) =>
          t.id === ticket.id ? { ...t, status: "selesai" } : t
        )
      );
    }
  };

  const handleSkip = async (ticket: TriageTicket) => {
    if (ticket.level === "merah") {
      toast.error("PELANGGARAN PROTOKOL: Pasien Triase Merah dilarang dilewati dalam kondisi apa pun!");
      return;
    }
    try {
      const { skipTicket } = await import("@/app/actions/petugas");
      const res = await skipTicket(ticket.id, "staff-triage-id", "Pasien tidak merespons panggilan");
      if (res.success) {
        setTickets(
          tickets.map((t) =>
            t.id === ticket.id ? { ...t, status: "dilewati" } : t
          )
        );
        toast.warning(res.message || `Pasien ${ticket.nomorTiket} dilewati.`);
      } else {
        toast.error(res.error || "Gagal melewati antrean.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal melewati antrean.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">
            Instalasi Gawat Darurat (24 Jam)
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Panel Triase IGD Berbasis Prioritas Medis
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Urutan antrean dikendalikan ketat oleh tingkat kegawatan klinis (Merah → Kuning → Hijau).
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)} size="sm" className="gap-2 bg-red-600 hover:bg-red-700 text-white">
          <UserPlus className="h-4 w-4" />
          + Input Pasien Triase Baru
        </Button>
      </div>

      {/* Triase Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Merah */}
        <div className="p-4 rounded-xl border border-red-200 bg-red-50/70 text-red-950 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-red-600 animate-ping" />
              Triase Merah (Resusitasi/Kritis)
            </span>
            <div className="text-2xl font-black font-mono text-red-950">{redCount} Pasien</div>
            <span className="text-[11px] text-red-700">Segera tanpa penundaan (Dilarang lewati)</span>
          </div>
        </div>

        {/* Kuning */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-950 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-amber-500" />
              Triase Kuning (Gawat Segera)
            </span>
            <div className="text-2xl font-black font-mono text-amber-950">{yellowCount} Pasien</div>
            <span className="text-[11px] text-amber-800">Tanda vital stabil, penanganan cepat</span>
          </div>
        </div>

        {/* Hijau */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-950 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500" />
              Triase Hijau (Tidak Gawat)
            </span>
            <div className="text-2xl font-black font-mono text-emerald-950">{greenCount} Pasien</div>
            <span className="text-[11px] text-emerald-800">Kondisi non-urgent, dapat menunggu</span>
          </div>
        </div>
      </div>

      {/* Prioritized Queue List */}
      <Card className="border-border shadow-sm">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-heading">
            Daftar Antrean Pasien Triase IGD (Urutan Medis)
          </CardTitle>
          <CardDescription className="text-xs">
            Pasien Merah otomatis berada di baris teratas, diikuti Kuning, lalu Hijau berdasarkan waktu kedatangan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 space-y-4">
          <div className="space-y-3">
            {sortedTickets.map((ticket) => {
              const isRed = ticket.level === "merah";
              const isYellow = ticket.level === "kuning";
              const isGreen = ticket.level === "hijau";

              return (
                <div
                  key={ticket.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isRed
                      ? "border-red-300 bg-red-50/40"
                      : isYellow
                      ? "border-amber-200 bg-amber-50/30"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black font-mono tracking-tight text-foreground">
                        {ticket.nomorTiket}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          isRed
                            ? "bg-red-600 text-white border-transparent text-[10px] font-bold"
                            : isYellow
                            ? "bg-amber-500 text-white border-transparent text-[10px] font-bold"
                            : "bg-emerald-600 text-white border-transparent text-[10px] font-bold"
                        }
                      >
                        {ticket.level.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1 border border-border/60 rounded px-1 py-0.5 bg-surface text-[10px]">
                        <span className="text-muted-foreground mr-0.5">Ubah:</span>
                        <button
                          type="button"
                          onClick={() => handleMoveTriage(ticket, "merah")}
                          className="px-1 font-bold text-red-700 hover:bg-red-100 rounded"
                          title="Ubah kondisi ke Merah (Gawat Darurat)"
                        >
                          M
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTriage(ticket, "kuning")}
                          className="px-1 font-bold text-amber-700 hover:bg-amber-100 rounded"
                          title="Ubah kondisi ke Kuning (Darurat Tidak Gawat)"
                        >
                          K
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveTriage(ticket, "hijau")}
                          className="px-1 font-bold text-emerald-700 hover:bg-emerald-100 rounded"
                          title="Ubah kondisi ke Hijau (Tidak Gawat Tidak Darurat)"
                        >
                          H
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground">• Masuk: {ticket.waktuMasuk}</span>
                    </div>

                    <Badge
                      className={
                        ticket.status === "dipanggil"
                          ? "bg-teal-700 text-white animate-pulse"
                          : ticket.status === "dilayani"
                          ? "bg-blue-600 text-white"
                          : ticket.status === "selesai"
                          ? "bg-emerald-700 text-white"
                          : "bg-surface text-foreground border border-border"
                      }
                    >
                      {ticket.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 my-3 items-center">
                    <div className="md:col-span-4 space-y-1">
                      <span className="font-heading font-bold text-sm text-foreground block">
                        {ticket.namaPasien} ({ticket.usia} Thn)
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Keluhan: &quot;{ticket.keluhan}&quot;
                      </p>
                    </div>

                    {/* Vital Signs */}
                    <div className="md:col-span-5 p-2.5 rounded-lg bg-surface border border-border grid grid-cols-5 gap-1 text-center text-[10px]">
                      <div>
                        <span className="text-muted-foreground block">TD</span>
                        <span className="font-mono font-bold text-foreground">{ticket.tandaVital.tensi}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Nadi</span>
                        <span className="font-mono font-bold text-foreground">{ticket.tandaVital.nadi}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">RR</span>
                        <span className="font-mono font-bold text-foreground">{ticket.tandaVital.rr}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">SpO2</span>
                        <span className="font-mono font-bold text-primary">{ticket.tandaVital.spo2}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Suhu</span>
                        <span className="font-mono font-bold text-foreground">{ticket.tandaVital.suhu}</span>
                      </div>
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="md:col-span-3 flex flex-wrap gap-1.5 justify-end">
                      {ticket.status === "menunggu" && (
                        <Button
                          size="sm"
                          onClick={() => handleCall(ticket)}
                          className="text-[11px] h-8 bg-teal-700 hover:bg-teal-800 text-white"
                        >
                          <PlayCircle className="h-3.5 w-3.5 mr-1" />
                          Panggil
                        </Button>
                      )}

                      {ticket.status === "dipanggil" && (
                        <Button
                          size="sm"
                          onClick={() => handleServe(ticket)}
                          className="text-[11px] h-8 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Layani Sekarang
                        </Button>
                      )}

                      {ticket.status === "dilayani" && (
                        <Button
                          size="sm"
                          onClick={() => handleComplete(ticket)}
                          className="text-[11px] h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Selesai Tindakan
                        </Button>
                      )}

                      {/* Rule: Pasien merah dilarang dilewati */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isRed}
                        onClick={() => handleSkip(ticket)}
                        className={`text-[11px] h-8 ${
                          isRed
                            ? "cursor-not-allowed opacity-50 text-muted-foreground"
                            : "text-amber-700 border-amber-200 hover:bg-amber-50"
                        }`}
                        title={isRed ? "Pasien merah dilarang dilewati sesuai PRD Bab 6.D" : "Lewati giliran"}
                      >
                        <Ban className="h-3 w-3 mr-1" />
                        Lewati
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground flex justify-between">
                    <span>Pemeriksa: {ticket.perawatPemeriksa}</span>
                    {isRed && (
                      <span className="text-red-700 font-bold">
                        DILARANG DILEWATI - Prioritas Tertinggi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modal Add New Triage */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Form Penerimaan & Klasifikasi Triase IGD</DialogTitle>
            <DialogDescription className="text-xs">
              Pemeriksaan fisik dan klasifikasi kegawatan oleh Perawat Triase di pintu masuk IGD.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTriage} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nama Lengkap Pasien *</Label>
                <Input
                  placeholder="Nama Pasien"
                  value={newPatient.namaPasien}
                  onChange={(e) => setNewPatient({ ...newPatient, namaPasien: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Usia Pasien (Tahun) *</Label>
                <Input
                  type="number"
                  placeholder="Contoh: 45"
                  value={newPatient.usia}
                  onChange={(e) => setNewPatient({ ...newPatient, usia: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Keluhan Utama / Alasan Masuk IGD *</Label>
              <textarea
                rows={2}
                className="flex w-full rounded-lg border border-border bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Contoh: Nyeri dada mendadak, sesak napas berat, trauma kepala..."
                value={newPatient.keluhan}
                onChange={(e) => setNewPatient({ ...newPatient, keluhan: e.target.value })}
                required
              />
            </div>

            {/* Vital Signs Grid */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tanda-Tanda Vital Awal:</Label>
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Tekanan Darah</Label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={newPatient.tensi}
                    onChange={(e) => setNewPatient({ ...newPatient, tensi: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Nadi (x/m)</Label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={newPatient.nadi}
                    onChange={(e) => setNewPatient({ ...newPatient, nadi: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">RR (x/m)</Label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={newPatient.rr}
                    onChange={(e) => setNewPatient({ ...newPatient, rr: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">SpO2 (%)</Label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={newPatient.spo2}
                    onChange={(e) => setNewPatient({ ...newPatient, spo2: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Suhu (°C)</Label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={newPatient.suhu}
                    onChange={(e) => setNewPatient({ ...newPatient, suhu: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Triage Level Radio */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Klasifikasi Tingkat Triase *</Label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setNewPatient({ ...newPatient, level: "merah" })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    newPatient.level === "merah"
                      ? "border-red-600 bg-red-600 text-white font-bold shadow-xs"
                      : "border-red-200 bg-red-50 text-red-900 hover:bg-red-100"
                  }`}
                >
                  <span className="text-xs block">MERAH</span>
                  <span className="text-[10px] opacity-90 block">Kritis Segera</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewPatient({ ...newPatient, level: "kuning" })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    newPatient.level === "kuning"
                      ? "border-amber-500 bg-amber-500 text-white font-bold shadow-xs"
                      : "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100"
                  }`}
                >
                  <span className="text-xs block">KUNING</span>
                  <span className="text-[10px] opacity-90 block">Gawat Cepat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewPatient({ ...newPatient, level: "hijau" })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    newPatient.level === "hijau"
                      ? "border-emerald-600 bg-emerald-600 text-white font-bold shadow-xs"
                      : "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                  }`}
                >
                  <span className="text-xs block">HIJAU</span>
                  <span className="text-[10px] opacity-90 block">Non-Urgent</span>
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full text-xs h-10 gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Simpan & Terbitkan Tiket Triase
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
