"use client";

import * as React from "react";
import { useParams } from "next/navigation";
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
import { DUMMY_UNIT_QUEUES, UnitQueueItem } from "@/lib/dummy/petugas";
import { DUMMY_LAYANAN } from "@/lib/dummy/layanan";

export default function UnitQueuePanelPage() {
  const params = useParams();
  const unitSlug = (params.unitSlug as string) || "poliklinik-penyakit-dalam";

  const unit =
    DUMMY_LAYANAN.find((u) => u.slug === unitSlug) || DUMMY_LAYANAN[1];
  const queueData =
    DUMMY_UNIT_QUEUES[unitSlug] || DUMMY_UNIT_QUEUES["poliklinik-penyakit-dalam"];

  const [activeTicket, setActiveTicket] = React.useState<UnitQueueItem | null>(
    queueData.sedangDilayani
  );
  const [waitingList, setWaitingList] = React.useState<UnitQueueItem[]>(
    queueData.antreanBerikutnya
  );
  const [skippedList, setSkippedList] = React.useState<UnitQueueItem[]>(
    queueData.antreanDilewati
  );

  const [recallCount, setRecallCount] = React.useState(activeTicket?.panggilanKe || 1);
  const [loadingAction, setLoadingAction] = React.useState(false);

  // Polling fallback every 5 seconds for live queue updates
  React.useEffect(() => {
    const timer = setInterval(() => {
      // In production/Supabase, sync queue state or listen to Supabase Realtime channel
    }, 5000);
    return () => clearInterval(timer);
  }, [unitSlug]);

  // Call Next Ticket
  const handleCallNext = async () => {
    if (waitingList.length === 0) {
      toast.info("Tidak ada pasien menunggu dalam antrean unit ini.");
      return;
    }
    setLoadingAction(true);
    try {
      const { callNextTicket } = await import("@/app/actions/petugas");
      const res = await callNextTicket(unit.id || "unit-demo-id", "Loket 1", "staff-demo-id");
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
        toast.success(`Nomor ${newActive.nomorTiket} (${newActive.namaPasien}) dipanggil! Disiarkan ke TV ruang tunggu.`);
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
      const res = await recallTicket(activeTicket.id, "staff-demo-id");
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
      const res = await serveTicket(activeTicket.id, "staff-demo-id");
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
      const res = await completeTicket(activeTicket.id, "staff-demo-id");
      if (res.success) {
        toast.success(`Pelayanan untuk tiket ${activeTicket.nomorTiket} telah SELESAI. Durasi dan unit_stats diperbarui.`);
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
      const res = await skipTicket(activeTicket.id, "staff-demo-id", "Pasien belum hadir");
      if (res.success) {
        const skippedItem: UnitQueueItem = {
          ...activeTicket,
          status: "dilewati",
          estimasiTunggu: "Batas 15 menit",
        };
        setSkippedList([...skippedList, skippedItem]);
        toast.warning(res.message || `Tiket ${activeTicket.nomorTiket} dilewati.`);
        setActiveTicket(null);
      } else {
        toast.error(res.error || "Gagal melewati tiket.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal melewati tiket.");
    } finally {
      setLoadingAction(false);
    }
  };

  // Recall from Skipped list
  const handleRecallSkipped = async (item: UnitQueueItem) => {
    setLoadingAction(true);
    try {
      const { callNextTicket } = await import("@/app/actions/petugas");
      setSkippedList(skippedList.filter((s) => s.id !== item.id));
      setActiveTicket({ ...item, status: "dipanggil", panggilanKe: 1 });
      setRecallCount(1);
      toast.success(`Tiket yang dilewati ${item.nomorTiket} dipanggil kembali.`);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
              Panel Pemanggilan Unit
            </Badge>
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
              <Radio className="h-3 w-3 animate-pulse text-emerald-600" />
              Display Real-time Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            {unit.nama} ({unit.kode})
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {unit.buildingName} • {unit.lantai} • Estimasi Rata-rata: ~{unit.defaultServiceMinutes} Menit
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/display/tv-poli-lt2-a8f9" target="_blank" className="text-xs gap-1.5">
            <Volume2 className="h-4 w-4 text-primary" />
            Layar Monitor TV Pasien
          </Link>
        </Button>
      </div>

      {/* Main Calling Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Ticket Big Calling Station */}
        <div className="lg:col-span-7">
          <Card className="border-teal-300 bg-gradient-to-br from-teal-50/60 via-background to-background shadow-md">
            <CardHeader className="p-6 pb-2 border-b border-teal-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-heading font-semibold text-teal-950 uppercase tracking-wider">
                  Sedang Dipanggil / Dilayani
                </CardTitle>
                <CardDescription className="text-xs">
                  Kontrol loket pemanggilan suara TV dan notifikasi WhatsApp pasien.
                </CardDescription>
              </div>
              {activeTicket && (
                <Badge className="bg-teal-700 text-white font-mono">
                  PANGGILAN KE-{recallCount} / 3
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {activeTicket ? (
                <div className="space-y-6">
                  <div className="text-center py-4 space-y-2">
                    <span className="text-xs text-muted-foreground block uppercase tracking-wider">
                      Nomor Tiket Pasien
                    </span>
                    <div className="text-5xl sm:text-6xl font-black font-mono text-teal-950 tracking-tight">
                      {activeTicket.nomorTiket}
                    </div>
                    <div className="font-heading font-bold text-lg text-foreground">
                      {activeTicket.namaPasien}
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <Badge variant="outline" className="text-xs capitalize bg-surface">
                        Prioritas: {activeTicket.kategoriPrioritas}
                      </Badge>
                      <Badge
                        className={
                          activeTicket.status === "dipanggil"
                            ? "bg-amber-500 text-white animate-pulse"
                            : "bg-blue-600 text-white"
                        }
                      >
                        {activeTicket.status === "dipanggil" ? "SEDANG DIPANGGIL" : "SEDANG DILAYANI"}
                      </Badge>
                    </div>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-teal-100">
                    <Button
                      onClick={handleRecall}
                      disabled={recallCount >= 3 || activeTicket.status === "dilayani"}
                      variant="outline"
                      className="text-xs border-amber-300 hover:bg-amber-50 text-amber-900 h-10 gap-1.5"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Panggil Ulang ({recallCount}/3)
                    </Button>

                    <Button
                      onClick={handleSkip}
                      variant="outline"
                      className="text-xs border-red-200 hover:bg-red-50 text-red-700 h-10 gap-1.5"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Lewati Pasien
                    </Button>

                    <Button
                      onClick={handleServe}
                      disabled={activeTicket.status === "dilayani"}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white h-10 gap-1.5"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      Layani Sekarang
                    </Button>

                    <Button
                      onClick={handleComplete}
                      className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-10 gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Selesai Layanan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="h-16 w-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto text-primary">
                    <PlayCircle className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-base text-foreground">
                      Loket Siap Memanggil Pasien Berikutnya
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Terdapat {waitingList.length} pasien menunggu dalam daftar antrean unit ini.
                    </p>
                  </div>
                  <Button onClick={handleCallNext} size="lg" className="text-xs gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Panggil Tiket Berikutnya Sekarang
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Waiting List & Skipped List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Waiting List */}
          <Card className="border-border">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-heading font-bold uppercase tracking-wider">
                  Daftar Antrean Menunggu ({waitingList.length})
                </CardTitle>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCallNext}
                disabled={waitingList.length === 0}
                className="text-[11px] h-7 text-primary hover:text-primary"
              >
                Panggil Berikutnya →
              </Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 max-h-72 overflow-y-auto">
              {waitingList.length > 0 ? (
                waitingList.map((item, idx) => (
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
