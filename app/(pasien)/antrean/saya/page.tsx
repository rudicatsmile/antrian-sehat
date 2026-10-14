"use client";

import * as React from "react";
import Link from "next/link";
import { Ticket, Clock, MapPin, QrCode, XCircle, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DUMMY_ACTIVE_TICKETS, QueueTicketItem } from "@/lib/dummy/pasien";

export default function AntreanSayaPage() {
  const [tickets, setTickets] = React.useState<QueueTicketItem[]>(DUMMY_ACTIVE_TICKETS);
  const [cancelModalTicket, setCancelModalTicket] = React.useState<QueueTicketItem | null>(null);
  const [canceling, setCanceling] = React.useState(false);

  // Polling fallback every 5 seconds for live status updates
  React.useEffect(() => {
    const timer = setInterval(() => {
      // In production/Supabase, fetch latest ticket status or listen to Supabase realtime
      setTickets((prev) => [...prev]);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleCancelTicket = async () => {
    if (!cancelModalTicket) return;
    setCanceling(true);
    try {
      const { cancelBooking } = await import("@/app/actions/booking");
      const res = await cancelBooking(cancelModalTicket.id, "pasien-demo-id");
      if (res.success) {
        setTickets(tickets.filter((t) => t.id !== cancelModalTicket.id));
        toast.success(`Tiket ${cancelModalTicket.nomorTiket} berhasil dibatalkan. Kuota telah dikembalikan.`);
        setCancelModalTicket(null);
      } else {
        toast.error(res.error || "Gagal membatalkan tiket.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membatalkan tiket.");
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
            Tiket Aktif
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Daftar Antrean Saya
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pantau status pemanggilan dan estimasi waktu giliran Anda secara real-time.
          </p>
        </div>

        <Button asChild size="sm">
          <Link href="/booking">
            + Tambah Booking Baru
          </Link>
        </Button>
      </div>

      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="border-border hover:shadow-xs transition-shadow overflow-hidden">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-surface px-2.5 py-1 rounded-md border border-border">
                      {ticket.tanggal}
                    </span>
                    <Badge variant="outline" className="text-xs bg-secondary text-primary border-teal-200">
                      {ticket.unitNama}
                    </Badge>
                  </div>
                  <Badge
                    className={
                      ticket.status === "dipanggil"
                        ? "bg-teal-700 text-white animate-pulse"
                        : "bg-slate-100 text-slate-800"
                    }
                  >
                    {ticket.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-4 items-center">
                  <div className="md:col-span-5 space-y-1">
                    <span className="text-xs text-muted-foreground">Nomor Antrean:</span>
                    <div className="text-3xl sm:text-4xl font-black text-teal-950 font-mono">
                      {ticket.nomorTiket}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{ticket.buildingNama} • {ticket.ruangLokasi}</span>
                    </div>
                    {ticket.dokterNama && (
                      <p className="text-xs text-muted-foreground">
                        Dokter: <strong className="text-foreground">{ticket.dokterNama}</strong>
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-4 p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>Estimasi Giliran:</span>
                    </div>
                    <div className="text-base font-bold text-primary font-mono">
                      {ticket.status === "dipanggil" ? "SEDANG DIPANGGIL!" : `~${ticket.estimasiMenit} Menit`}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {ticket.status === "dipanggil"
                        ? "Silakan segera menuju ruang periksa."
                        : `Tersisa ${ticket.sisaAntreanDiDepan} antrean di depan Anda.`}
                    </p>
                  </div>

                  <div className="md:col-span-3 flex flex-col gap-2">
                    <Button asChild size="sm" className="w-full text-xs gap-1.5">
                      <Link href={`/antrean/${ticket.id}`}>
                        <QrCode className="h-3.5 w-3.5" />
                        Detail & QR Code
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCancelModalTicket(ticket)}
                      className="w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-red-200"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Batalkan Tiket
                    </Button>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Waktu Booking: {ticket.waktuBooking}</span>
                  <span className="text-blue-700 font-medium">Jalur Prioritas {ticket.prioritas.toUpperCase()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 border-dashed">
          <div className="max-w-sm mx-auto space-y-3">
            <Ticket className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="font-heading font-semibold text-base">Belum Ada Tiket Antrean Aktif</h3>
            <p className="text-xs text-muted-foreground">
              Anda tidak memiliki tiket antrean yang sedang berjalan hari ini. Silakan melakukan booking terlebih dahulu.
            </p>
            <Button asChild size="sm" className="mt-2">
              <Link href="/booking">Booking Antrean Sekarang</Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelModalTicket} onOpenChange={(open) => !open && setCancelModalTicket(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembatalan Antrean</DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin membatalkan tiket antrean <strong className="text-foreground">{cancelModalTicket?.nomorTiket}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Pembatalan H-0 yang dilakukan lebih awal akan membebaskan kuota bagi pasien lain yang sedang membutuhkan penanganan dokter.
            </span>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setCancelModalTicket(null)}>
              Tidak, Simpan Tiket
            </Button>
            <Button variant="destructive" size="sm" onClick={handleCancelTicket}>
              Ya, Batalkan Tiket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
