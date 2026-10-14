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
import { createClient } from "@/lib/supabase/client";
import type { PatientProfile, QueueTicketItem, InvoiceItem } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

export default function PatientDashboardPage() {
  const [profile, setProfile] = React.useState<PatientProfile>({
    id: "",
    nik: "3271041508560002",
    namaLengkap: "Pasien RSUD",
    noWhatsapp: "628123456789",
    tanggalLahir: "1980-01-01",
    jenisKelamin: "L",
    alamat: "Jl. Rumah Sakit Sejahtera",
    noRm: "RM-PASIEN",
    kategoriPrioritas: "normal",
  });
  const [activeTickets, setActiveTickets] = React.useState<QueueTicketItem[]>([]);
  const [unpaidInvoice, setUnpaidInvoice] = React.useState<InvoiceItem | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let patientId = user?.id;

      if (!patientId) {
        // Fallback to first profile in database if demo/unauthenticated
        const { data: firstP } = await supabase.from("profiles").select("*").limit(1).maybeSingle();
        if (firstP) {
          patientId = firstP.id;
          setProfile({
            id: firstP.id,
            nik: firstP.nik || "",
            namaLengkap: firstP.nama_lengkap,
            noWhatsapp: firstP.no_whatsapp,
            tanggalLahir: firstP.tanggal_lahir || "",
            jenisKelamin: (firstP.jenis_kelamin as "L" | "P") || "L",
            alamat: firstP.alamat || "",
            noRm: firstP.no_rm || "RM-BELUM-ADA",
            kategoriPrioritas: firstP.kategori_prioritas || "normal",
          });
        }
      } else {
        const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", patientId).maybeSingle();
        if (userProfile) {
          setProfile({
            id: userProfile.id,
            nik: userProfile.nik || "",
            namaLengkap: userProfile.nama_lengkap,
            noWhatsapp: userProfile.no_whatsapp,
            tanggalLahir: userProfile.tanggal_lahir || "",
            jenisKelamin: (userProfile.jenis_kelamin as "L" | "P") || "L",
            alamat: userProfile.alamat || "",
            noRm: userProfile.no_rm || "RM-BELUM-ADA",
            kategoriPrioritas: userProfile.kategori_prioritas || "normal",
          });
        }
      }

      if (patientId) {
        // Fetch tickets from database
        const { data: tickets } = await supabase
          .from("queue_tickets")
          .select(`
            id,
            nomor_tiket,
            tanggal,
            status,
            urutan,
            prioritas,
            triage,
            estimasi_menit,
            created_at,
            units (
              nama,
              slug,
              lantai,
              buildings (nama)
            ),
            doctor_sessions (
              sesi,
              doctors (nama)
            )
          `)
          .eq("patient_id", patientId)
          .in("status", ["menunggu", "dipanggil", "dilayani"])
          .order("created_at", { ascending: false });

        if (tickets) {
          setActiveTickets(
            tickets.map((t: any) => ({
              id: t.id,
              nomorTiket: t.nomor_tiket,
              unitSlug: t.units?.slug || "poliklinik",
              unitNama: t.units?.nama || "Poliklinik",
              buildingNama: t.units?.buildings?.nama || "Gedung Utama",
              ruangLokasi: t.units?.lantai || "Lantai 1",
              dokterNama: t.doctor_sessions?.doctors?.nama,
              sesiNama: t.doctor_sessions?.sesi ? `Sesi ${t.doctor_sessions.sesi}` : undefined,
              tanggal: t.tanggal,
              waktuBooking: new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              status: t.status,
              urutan: t.urutan,
              sisaAntreanDiDepan: Math.max(0, t.urutan - 1),
              estimasiMenit: t.estimasi_menit || 15,
              qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(t.nomor_tiket)}`,
              prioritas: t.prioritas,
              triageLevel: t.triage,
              timeline: [],
            }))
          );
        }

        // Fetch unpaid invoice from database
        const { data: inv } = await supabase
          .from("invoices")
          .select("*, queue_tickets(nomor_tiket, units(nama))")
          .eq("patient_id", patientId)
          .eq("status", "belum_bayar")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (inv) {
          setUnpaidInvoice({
            id: inv.id,
            invoiceNo: inv.invoice_no,
            ticketNomor: inv.queue_tickets?.nomor_tiket,
            unitNama: inv.queue_tickets?.units?.nama || "Pelayanan RSUD",
            tanggal: new Date(inv.created_at).toLocaleDateString("id-ID"),
            totalAmount: inv.total_amount,
            status: inv.status,
            items: [],
          });
        }
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const activeTicket = activeTickets[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Portal Layanan Pasien
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Selamat Datang, {profile.namaLengkap}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            No. Rekam Medis: <strong className="text-foreground font-mono">{profile.noRm}</strong> • Jalur Prioritas: <span className="text-blue-700 font-semibold capitalize">{profile.kategoriPrioritas}</span>
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
                    ? "Segera menuju ruang pemeriksaan sesuai nomor tiket Anda."
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
                    Semua Antrean ({activeTickets.length})
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Steps Bar */}
            <div className="pt-4 border-t border-teal-100 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
              <span className="flex items-center gap-1.5 text-teal-900 font-medium">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Tiket Tersimpan di Database
              </span>
              <span>{activeTicket.sesiNama || "Pelayanan Aktif"}</span>
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
          <Button asChild size="sm" className="bg-amber-800 hover:bg-amber-900 text-white shrink-0 text-xs">
            <Link href={`/pembayaran/${unpaidInvoice.id}`}>
              Bayar Sekarang
            </Link>
          </Button>
        </div>
      )}

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="p-5 pb-3">
            <div className="size-10 rounded-xl bg-secondary text-primary flex items-center justify-center mb-3">
              <Stethoscope className="size-5" />
            </div>
            <CardTitle className="text-base font-heading">Poliklinik Spesialis</CardTitle>
            <CardDescription className="text-xs">
              Pilih dokter spesialis, jadwal hari praktik, dan reservasi kuota konsultasi.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Button variant="outline" size="sm" asChild className="w-full text-xs gap-1">
              <Link href="/booking/poliklinik">
                Booking Poli <ChevronRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="p-5 pb-3">
            <div className="size-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center mb-3">
              <FlaskConical className="size-5" />
            </div>
            <CardTitle className="text-base font-heading">Laboratorium & Radiologi</CardTitle>
            <CardDescription className="text-xs">
              Daftar antrean pengambilan sampel darah atau pemeriksaan rontgen & CT-Scan.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Button variant="outline" size="sm" asChild className="w-full text-xs gap-1">
              <Link href="/booking/laboratorium">
                Booking Penunjang <ChevronRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="p-5 pb-3">
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-3">
              <Pill className="size-5" />
            </div>
            <CardTitle className="text-base font-heading">Farmasi & Obat</CardTitle>
            <CardDescription className="text-xs">
              Antrean pengambilan obat racik dan non-racik dengan estimasi durasi penyiapan.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <Button variant="outline" size="sm" asChild className="w-full text-xs gap-1">
              <Link href="/booking/farmasi">
                Antrean Farmasi <ChevronRight className="size-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
