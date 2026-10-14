"use client";

import * as React from "react";
import Link from "next/link";
import {
  PlayCircle,
  RotateCcw,
  Ban,
  CheckCircle2,
  Volume2,
  Radio,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnitQueueItem, UnitLayanan } from "@/lib/types";

interface UnitQueuePanelClientProps {
  unit: UnitLayanan;
  initialQueue: {
    sedangDilayani: UnitQueueItem | null;
    antreanBerikutnya: UnitQueueItem[];
    antreanDilewati: UnitQueueItem[];
  };
}

export function UnitQueuePanelClient({ unit, initialQueue }: UnitQueuePanelClientProps) {
  const [activeTicket, setActiveTicket] = React.useState<UnitQueueItem | null>(
    initialQueue.sedangDilayani
  );
  const [waitingList, setWaitingList] = React.useState<UnitQueueItem[]>(
    initialQueue.antreanBerikutnya
  );
  const [skippedList, setSkippedList] = React.useState<UnitQueueItem[]>(
    initialQueue.antreanDilewati
  );

  const [recallCount, setRecallCount] = React.useState(activeTicket?.panggilanKe || 1);
  const [loadingAction, setLoadingAction] = React.useState(false);

  // Call Next Ticket
  const handleCallNext = async () => {
    if (waitingList.length === 0) {
      toast.info("Tidak ada pasien menunggu dalam antrean unit ini.");
      return;
    }
    setLoadingAction(true);
    try {
      const { callNextTicket } = await import("@/app/actions/petugas");
      const res = await callNextTicket(unit.id, "Loket 1", "staff-current-id");
      if (res.success) {
        const [next, ...remaining] = waitingList;
        const newActive: UnitQueueItem = {
          ...next,
          status: "dipanggil",
          panggilanKe: 1,
        };
        setActiveTicket(newActive);
        setWaitingList(remaining);
        setRecallCount(1);
        toast.success(`Nomor ${newActive.nomorTiket} (${newActive.namaPasien}) dipanggil! Disiarkan ke TV display ruang tunggu.`);
      } else {
        toast.error(res.error || "Gagal memanggil antrean.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memanggil antrean.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Recall (Panggil Ulang - Maks 3 Kali)
  const handleRecall = async () => {
    if (!activeTicket) return;
    if (recallCount >= 3) {
      toast.error("Batas maksimal 3 kali pemanggilan tercapai. Silakan lewati nomor ini bila pasien belum hadir.");
      return;
    }
    setLoadingAction(true);
    try {
      const { recallTicket } = await import("@/app/actions/petugas");
      const res = await recallTicket(activeTicket.id, "staff-current-id");
      if (res.success) {
        const newCount = res.recallCount || recallCount + 1;
        setRecallCount(newCount);
        setActiveTicket({ ...activeTicket, panggilanKe: newCount });
        toast.info(res.message || `Pemanggilan Ulang ke-${newCount} disiarkan.`);
      } else {
        toast.error(res.error || "Gagal memanggil ulang.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memanggil ulang.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Serve (Mulai Layani)
  const handleServe = async () => {
    if (!activeTicket) return;
    setLoadingAction(true);
    try {
      const { serveTicket } = await import("@/app/actions/petugas");
      const res = await serveTicket(activeTicket.id, "staff-current-id");
      if (res.success) {
        setActiveTicket({ ...activeTicket, status: "dilayani" });
        toast.success(`Pasien ${activeTicket.nomorTiket} telah hadir dan sedang DILAYANI di ruang periksa.`);
      } else {
        toast.error(res.error || "Gagal memulai layanan.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memulai layanan.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Complete (Selesai)
  const handleComplete = async () => {
    if (!activeTicket) return;
    setLoadingAction(true);
    try {
      const { completeTicket } = await import("@/app/actions/petugas");
      const res = await completeTicket(activeTicket.id, "staff-current-id");
      if (res.success) {
        toast.success(`Pelayanan untuk tiket ${activeTicket.nomorTiket} telah SELESAI di database Supabase.`);
        setActiveTicket(null);
      } else {
        toast.error(res.error || "Gagal menyelesaikan layanan.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menyelesaikan layanan.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Skip (Lewati)
  const handleSkip = async () => {
    if (!activeTicket) return;
    setLoadingAction(true);
    try {
      const { skipTicket } = await import("@/app/actions/petugas");
      const res = await skipTicket(activeTicket.id, "staff-current-id", "Pasien belum hadir");
      if (res.success) {
        const skippedItem: UnitQueueItem = {
          ...activeTicket,
          status: "dilewati",
          estimasiTunggu: "Batas 15 menit",
        };
        setSkippedList([...skippedList, skippedItem]);
        setActiveTicket(null);
        toast.warning(`Nomor antrean ${activeTicket.nomorTiket} DILEWATI dan dipindah ke daftar cadangan.`);
      } else {
        toast.error(res.error || "Gagal melewati antrean.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal melewati antrean.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Recall Skipped Ticket
  const handleRecallSkipped = async (item: UnitQueueItem) => {
    setLoadingAction(true);
    try {
      const { recallTicket } = await import("@/app/actions/petugas");
      const res = await recallTicket(item.id, "staff-current-id");
      if (res.success) {
        setSkippedList(skippedList.filter((s) => s.id !== item.id));
        setActiveTicket({ ...item, status: "dipanggil", panggilanKe: 1 });
        toast.success(`Tiket dilewati ${item.nomorTiket} berhasil diaktifkan kembali.`);
      } else {
        toast.error(res.error || "Gagal mengaktifkan kembali.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengaktifkan kembali.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Unit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
              {unit.kode} • {unit.kategori}
            </Badge>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Radio className="h-3 w-3 animate-pulse" /> Live Supabase
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-1">
            {unit.nama}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Lokasi: <strong className="text-foreground">{unit.gedung} ({unit.lantai})</strong> • Jam Operasional: {unit.jamBuka} - {unit.jamTutup} WIB
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/petugas/dashboard">← Kembali ke Dasbor</Link>
          </Button>
          <Button asChild size="sm" className="text-xs gap-1.5">
            <Link href="/display/gedung-a-lobby" target="_blank">
              <Volume2 className="h-4 w-4" /> Buka Layar Display TV
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Calling Box (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border shadow-md overflow-hidden">
            <div className="bg-primary/5 p-4 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                Status Pemanggilan Loket / Poli
              </span>
              <Badge
                className={
                  activeTicket
                    ? activeTicket.status === "dipanggil"
                      ? "bg-amber-500 text-white animate-pulse"
                      : "bg-emerald-600 text-white"
                    : "bg-muted text-muted-foreground"
                }
              >
                {activeTicket ? activeTicket.status.toUpperCase() : "STANDBY / KOSONG"}
              </Badge>
            </div>

            <CardContent className="p-8 text-center space-y-6">
              {activeTicket ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                      Nomor Antrean Pasien
                    </span>
                    <div className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-primary">
                      {activeTicket.nomorTiket}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-border inline-block min-w-64 max-w-md mx-auto">
                    <h3 className="font-heading font-bold text-lg text-foreground">
                      {activeTicket.namaPasien}
                    </h3>
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mt-1">
                      <span>RM: <strong className="font-mono text-teal-800">{activeTicket.noRm}</strong></span>
                      <span>•</span>
                      <span className="capitalize">Prioritas: <Badge variant="outline" className="text-[10px]">{activeTicket.kategoriPrioritas}</Badge></span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <span>Status Suara: Dipanggil ke-{recallCount} dari maks 3 kali</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 space-y-3">
                  <PlayCircle className="h-16 w-16 text-muted-foreground/40 mx-auto" />
                  <h3 className="font-heading font-bold text-lg text-foreground">
                    Tidak Ada Pasien Sedang Dipanggil
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Tekan tombol &quot;Panggil Antrean Berikutnya&quot; di bawah untuk memanggil pasien urutan pertama dari daftar tunggu.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  onClick={handleCallNext}
                  disabled={loadingAction || waitingList.length === 0}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-11 flex-col gap-0.5"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Panggil Berikutnya</span>
                </Button>

                <Button
                  onClick={handleRecall}
                  disabled={loadingAction || !activeTicket || recallCount >= 3}
                  variant="outline"
                  className="text-xs h-11 flex-col gap-0.5 border-border"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Panggil Ulang ({recallCount}/3)</span>
                </Button>

                <Button
                  onClick={handleServe}
                  disabled={loadingAction || !activeTicket || activeTicket.status === "dilayani"}
                  variant="outline"
                  className="text-xs h-11 flex-col gap-0.5 text-blue-700 border-blue-200 hover:bg-blue-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mulai Layani</span>
                </Button>

                <Button
                  onClick={handleComplete}
                  disabled={loadingAction || !activeTicket}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-11 flex-col gap-0.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Selesai Tindakan</span>
                </Button>
              </div>

              {activeTicket && (
                <div className="pt-2 text-right">
                  <Button
                    onClick={handleSkip}
                    disabled={loadingAction}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-amber-700 hover:text-amber-800 hover:bg-amber-50 gap-1.5"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Lewati Pasien (Belum Hadir Setelah 3x Panggil)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Queue Sidebars (Right 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Waiting List */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-heading">
                  Antrean Menunggu ({waitingList.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Urutan antrean langsung dari database Supabase.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {waitingList.length} Pasien
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 max-h-72 overflow-y-auto">
              {waitingList.length > 0 ? (
                waitingList.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-border bg-surface/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary text-sm">
                        {item.nomorTiket}
                      </span>
                      <div>
                        <span className="font-semibold text-foreground block">
                          {item.namaPasien}
                        </span>
                        <span className="text-[10px] text-muted-foreground capitalize">
                          Prioritas: {item.kategoriPrioritas}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ~{item.estimasiTunggu}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-muted-foreground">
                  Tidak ada pasien menunggu dalam antrean.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skipped List */}
          <Card className="border-border bg-amber-50/20">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-heading font-bold text-amber-900 uppercase tracking-wider">
                Daftar Tiket Dilewati ({skippedList.length})
              </CardTitle>
              <CardDescription className="text-[11px]">
                Tiket yang tidak hadir saat 3x pemanggilan. Dapat dipanggil kembali dalam 15 menit.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {skippedList.length > 0 ? (
                skippedList.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-amber-900 block">
                        {item.nomorTiket} - {item.namaPasien}
                      </span>
                      <span className="text-[10px] text-amber-700">
                        {item.estimasiTunggu}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRecallSkipped(item)}
                      className="text-[10px] h-7 px-2 bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Panggil Ulang
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-muted-foreground">
                  Tidak ada tiket yang dilewati saat ini.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
