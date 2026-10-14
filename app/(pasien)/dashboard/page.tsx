"use client";

import * as React from "react";
import Link from "next/link";
import {
  Ticket,
  CalendarPlus,
  CreditCard,
  Clock,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  QrCode,
  CheckCircle2,
  Stethoscope,
  FlaskConical,
  Pill,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CURRENT_PATIENT, DUMMY_ACTIVE_TICKETS, DUMMY_INVOICES } from "@/lib/dummy/pasien";
import { formatRupiah } from "@/lib/utils";

export default function PatientDashboardPage() {
  const activeTicket = DUMMY_ACTIVE_TICKETS[0]; // e.g. POL-D-014 (dipanggil)
  const unpaidInvoice = DUMMY_INVOICES.find((inv) => inv.status === "belum_bayar");

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Portal Layanan Pasien
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Selamat Datang, {CURRENT_PATIENT.namaLengkap}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            No. Rekam Medis: <strong className="text-foreground font-mono">{CURRENT_PATIENT.noRm}</strong> • Jalur Prioritas: <span className="text-blue-700 font-semibold capitalize">{CURRENT_PATIENT.kategoriPrioritas}</span>
          </p>
        </div>

        <Button asChild size="sm" className="gap-2 self-start sm:self-auto shadow-xs">
          <Link href="/booking">
            <CalendarPlus className="h-4 w-4" />
            Booking Layanan Baru
          </Link>
        </Button>
      </div>

      {/* Hero Active Ticket Card */}
      {activeTicket && (
        <Card className="border-teal-200 bg-gradient-to-r from-teal-50/70 via-background to-background shadow-md overflow-hidden relative">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-teal-100">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <Badge variant="outline" className="bg-secondary text-primary border-teal-200 text-xs font-semibold">
                  TIKET AKTIF HARI INI
                </Badge>
                <span className="text-xs text-muted-foreground">• {activeTicket.tanggal}</span>
              </div>
              <Badge className="bg-teal-700 text-white font-semibold text-xs self-start sm:self-auto">
                Status: {activeTicket.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
              {/* Ticket Big Call Number */}
              <div className="md:col-span-5 text-center sm:text-left space-y-1">
                <span className="text-xs text-muted-foreground block">Nomor Antrean Anda:</span>
                <div className="text-4xl sm:text-5xl font-black text-teal-950 font-mono tracking-tight">
                  {activeTicket.nomorTiket}
                </div>
                <p className="text-xs text-teal-800 font-medium">
                  {activeTicket.unitNama} • {activeTicket.ruangLokasi}
                </p>
                {activeTicket.dokterNama && (
                  <p className="text-xs text-muted-foreground">
                    Dokter: <strong className="text-foreground">{activeTicket.dokterNama}</strong>
                  </p>
                )}
              </div>

              {/* Status Indicator */}
              <div className="md:col-span-4 p-4 rounded-xl bg-background border border-border space-y-2 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start text-xs font-semibold text-teal-900">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Posisi Antrean Sekarang</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {activeTicket.status === "dipanggil" ? "Nomor Anda Sedang Dipanggil!" : `${activeTicket.sisaAntreanDiDepan} antrean di depan`}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {activeTicket.status === "dipanggil"
                    ? "Segera menuju Ruang Periksa 201 Gedung A Lantai 2."
                    : `Estimasi giliran Anda sekitar ${activeTicket.estimasiMenit} menit lagi.`}
                </p>
              </div>

              {/* Action QR */}
              <div className="md:col-span-3 flex flex-col gap-2 items-center sm:items-end justify-center">
                <Button asChild className="w-full sm:w-auto text-xs gap-1.5 h-10 shadow-xs">
                  <Link href={`/antrean/${activeTicket.id}`}>
                    <QrCode className="h-4 w-4" />
                    Lihat Tiket & QR Code
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto text-xs">
                  <Link href="/antrean/saya">
                    Semua Antrean ({DUMMY_ACTIVE_TICKETS.length})
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Steps Bar */}
            <div className="pt-4 border-t border-teal-100 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
              <span className="flex items-center gap-1.5 text-teal-900 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Check-in Kedatangan Terverifikasi
              </span>
              <span>Sesi: {activeTicket.sesiNama}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Unpaid Invoice Alert Banner */}
      {unpaidInvoice && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Tagihan Menunggu Pembayaran</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Invoice <strong className="font-mono">{unpaidInvoice.invoiceNo}</strong> sebesar{" "}
                <strong className="text-amber-950">{formatRupiah(unpaidInvoice.totalAmount)}</strong> belum dilunasi.
              </p>
            </div>
          </div>
          <Button size="sm" asChild className="bg-amber-600 hover:bg-amber-700 text-white self-start sm:self-auto text-xs">
            <Link href={`/pembayaran/${unpaidInvoice.id}`}>
              Bayar Online (Midtrans) →
            </Link>
          </Button>
        </div>
      )}

      {/* Quick Booking Shortcuts */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold font-heading">Pintasan Booking Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="p-5 pb-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center mb-2 border border-teal-100">
                <Stethoscope className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Poliklinik Rawat Jalan</CardTitle>
              <CardDescription className="text-xs">
                Dokter Penyakit Dalam, Anak, Bedah, Kandungan.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link href="/booking/poliklinik">
                  Pilih Poli & Dokter
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="p-5 pb-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center mb-2 border border-teal-100">
                <FlaskConical className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Laboratorium Patologi</CardTitle>
              <CardDescription className="text-xs">
                Uji darah lengkap, profil lipid, urine, serologi.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link href="/booking/laboratorium">
                  Booking Cek Lab
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="p-5 pb-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center mb-2 border border-teal-100">
                <Ticket className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Radiologi & Imejing</CardTitle>
              <CardDescription className="text-xs">
                Rontgen X-Ray, USG 4D, CT-Scan, dan MRI.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link href="/booking/radiologi">
                  Booking Radiologi
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="p-5 pb-3">
              <div className="h-10 w-10 rounded-xl bg-teal-50 text-primary flex items-center justify-center mb-2 border border-teal-100">
                <Pill className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Farmasi / Obat Racik</CardTitle>
              <CardDescription className="text-xs">
                Pengambilan obat rawat jalan & konseling apoteker.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link href="/booking/farmasi">
                  Antrean Obat
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
