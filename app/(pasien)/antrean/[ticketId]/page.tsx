"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, MapPin, Printer, Share2, ShieldCheck, QrCode, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_ACTIVE_TICKETS, CURRENT_PATIENT } from "@/lib/dummy/pasien";
import { HOSPITAL_NAME } from "@/lib/constants";

export default function DetailTiketPage() {
  const params = useParams();
  const ticketId = params?.ticketId as string;
  const ticket = DUMMY_ACTIVE_TICKETS.find((t) => t.id === ticketId) || DUMMY_ACTIVE_TICKETS[0];
  const [checkedIn, setCheckedIn] = React.useState(false);
  const [checkingIn, setCheckingIn] = React.useState(false);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const { checkInTicket } = await import("@/app/actions/booking");
      const res = await checkInTicket(ticket.id, "pasien-demo-id");
      if (res.success) {
        setCheckedIn(true);
        toast.success(res.message || "Check-in berhasil dikonfirmasi.");
      } else {
        toast.error(res.error || "Gagal check-in.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal check-in.");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/antrean/saya"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Daftar Antrean Saya
      </Link>

      {/* Ticket Pass Container */}
      <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
        {/* Top Header */}
        <div className="bg-teal-800 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <span className="text-[11px] uppercase tracking-widest text-teal-200 font-semibold block mb-1">
            {HOSPITAL_NAME}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold font-heading">
            Tiket Antrean Pelayanan Rawat Jalan
          </h1>
          <p className="text-xs text-teal-100 mt-1">
            {ticket.unitNama} • {ticket.buildingNama}
          </p>

          <div className="mt-6 inline-block bg-white text-teal-950 px-8 py-3 rounded-2xl shadow-md border border-teal-100">
            <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider block">
              NOMOR ANTREAN
            </span>
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight block">
              {ticket.nomorTiket}
            </span>
          </div>
        </div>

        {/* QR Code and Patient Info */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* QR Section */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 bg-surface rounded-xl border border-border text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ticket.qrCodeUrl}
                alt={`QR Code ${ticket.nomorTiket}`}
                className="w-36 h-36 rounded-lg shadow-2xs border border-border bg-white p-2"
              />
              <span className="text-[11px] text-muted-foreground mt-2 block font-mono">
                Pindai di Kiosk / Loket
              </span>
            </div>

            {/* Patient & Service Details */}
            <div className="sm:col-span-7 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Nama Pasien:</span>
                <span className="font-semibold text-foreground">{CURRENT_PATIENT.namaLengkap}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">No. Rekam Medis:</span>
                <span className="font-mono font-bold text-foreground">{CURRENT_PATIENT.noRm}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Tanggal Kunjungan:</span>
                <span className="font-medium text-foreground">{ticket.tanggal}</span>
              </div>
              {ticket.dokterNama && (
                <div className="flex justify-between py-1.5 border-b border-border">
                  <span className="text-muted-foreground">Dokter DPJP:</span>
                  <span className="font-medium text-foreground">{ticket.dokterNama}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Lokasi Periksa:</span>
                <span className="font-medium text-foreground">{ticket.ruangLokasi}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Kategori Prioritas:</span>
                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 capitalize">
                  {ticket.prioritas}
                </Badge>
              </div>
            </div>
          </div>

          {/* Timeline Steps */}
          <div className="pt-6 border-t border-border space-y-4">
            <h3 className="font-heading font-bold text-sm">Status Langkah Demi Langkah</h3>
            <div className="space-y-4">
              {ticket.timeline.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {step.selesai || (checkedIn && idx <= 1) ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">{step.judul}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">({step.waktu})</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {step.keterangan}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-border flex flex-wrap gap-2 justify-end">
            {!checkedIn ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="text-xs gap-1.5 border-teal-300 text-teal-800 hover:bg-teal-50"
              >
                <Check className="h-3.5 w-3.5" />
                {checkingIn ? "Mengonfirmasi..." : "Simulasi Konfirmasi Check-In Kiosk"}
              </Button>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 py-1.5 px-3">
                ✓ Pasien Sudah Check-In
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
            >
              <Printer className="h-3.5 w-3.5" />
              Cetak Tiket
            </Button>
            <Button size="sm" asChild className="text-xs">
              <Link href="/pembayaran">
                Lihat Rincian Tagihan
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
