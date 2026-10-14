"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, MapPin, Printer, Share2, ShieldCheck, QrCode, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { QueueTicketItem, PatientProfile } from "@/lib/types";
import { HOSPITAL_NAME } from "@/lib/constants";

export default function DetailTiketPage() {
  const params = useParams();
  const ticketId = params?.ticketId as string;

  const [ticket, setTicket] = React.useState<QueueTicketItem | null>(null);
  const [patient, setPatient] = React.useState<PatientProfile>({
    id: "",
    nik: "",
    namaLengkap: "Pasien RSUD",
    noWhatsapp: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    alamat: "",
    noRm: "RM-PASIEN",
    kategoriPrioritas: "normal",
  });
  const [loading, setLoading] = React.useState(true);
  const [checkedIn, setCheckedIn] = React.useState(false);
  const [checkingIn, setCheckingIn] = React.useState(false);

  React.useEffect(() => {
    async function fetchTicket() {
      if (!ticketId) return;
      const supabase = createClient();

      const { data: rawT } = await supabase
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
          patient_id,
          profiles (
            id,
            nik,
            nama_lengkap,
            no_rm,
            no_whatsapp,
            kategori_prioritas
          ),
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
        .eq("id", ticketId)
        .maybeSingle();

      const t: any = rawT;
      if (t) {
        if (t.profiles) {
          const prof = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles;
          if (prof) {
            setPatient({
              id: prof.id,
              nik: prof.nik || "",
              namaLengkap: prof.nama_lengkap,
              noWhatsapp: prof.no_whatsapp,
              tanggalLahir: "",
              jenisKelamin: "L",
              alamat: "",
              noRm: prof.no_rm || "RM-BELUM-ADA",
              kategoriPrioritas: prof.kategori_prioritas || "normal",
            });
          }
        }

        const { data: events } = await supabase
          .from("queue_events")
          .select("created_at, aksi, catatan")
          .eq("ticket_id", t.id)
          .order("created_at", { ascending: true });

        const timeline = (events && events.length > 0)
          ? events.map((e) => ({
              waktu: new Date(e.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
              judul: e.aksi.toUpperCase(),
              keterangan: e.catatan || `Aksi ${e.aksi} tercatat pada tiket.`,
              selesai: true,
            }))
          : [
              {
                waktu: new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                judul: "Tiket Diterbitkan",
                keterangan: "Nomor antrean berhasil dibuat di sistem Antrean Sehat.",
                selesai: true,
              },
              {
                waktu: t.status === "dipanggil" || t.status === "dilayani" || t.status === "selesai" ? "Aktif" : "--:--",
                judul: "Panggilan Loket / Poli",
                keterangan: "Pasien dipanggil menuju ruang atau loket pelayanan.",
                selesai: t.status === "dipanggil" || t.status === "dilayani" || t.status === "selesai",
              },
              {
                waktu: t.status === "dilayani" || t.status === "selesai" ? "Sedang berjalan" : "--:--",
                judul: "Sedang Dilayani",
                keterangan: "Pemeriksaan medis atau proses administrasi berlangsung.",
                selesai: t.status === "dilayani" || t.status === "selesai",
              },
              {
                waktu: t.status === "selesai" ? "Selesai" : "--:--",
                judul: "Pelayanan Selesai",
                keterangan: "Pelayanan tuntas dan resep/instruksi diberikan.",
                selesai: t.status === "selesai",
              },
            ];

        const unit = Array.isArray(t.units) ? t.units[0] : t.units;
        const building = unit?.buildings ? (Array.isArray(unit.buildings) ? unit.buildings[0] : unit.buildings) : null;
        const session = Array.isArray(t.doctor_sessions) ? t.doctor_sessions[0] : t.doctor_sessions;
        const doctor = session?.doctors ? (Array.isArray(session.doctors) ? session.doctors[0] : session.doctors) : null;

        setTicket({
          id: t.id,
          nomorTiket: t.nomor_tiket,
          unitSlug: unit?.slug || "poliklinik",
          unitNama: unit?.nama || "Poliklinik",
          buildingNama: building?.nama || "Gedung Utama",
          ruangLokasi: unit?.lantai || "Lantai 1",
          dokterNama: doctor?.nama,
          sesiNama: session?.sesi ? `Sesi ${session.sesi}` : undefined,
          tanggal: t.tanggal,
          waktuBooking: new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          status: t.status,
          urutan: t.urutan,
          sisaAntreanDiDepan: Math.max(0, t.urutan - 1),
          estimasiMenit: t.estimasi_menit || 15,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(t.nomor_tiket)}`,
          prioritas: t.prioritas,
          triageLevel: t.triage,
          timeline,
        });
      }
      setLoading(false);
    }
    fetchTicket();
  }, [ticketId]);

  const handleCheckIn = async () => {
    if (!ticket) return;
    setCheckingIn(true);
    try {
      const { checkInTicket } = await import("@/app/actions/booking");
      const res = await checkInTicket(ticket.id, patient.id || "demo");
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

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground text-sm">Memuat data tiket dari Supabase...</div>;
  }

  if (!ticket) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-lg font-bold">Tiket antrean tidak ditemukan</h2>
        <Button asChild size="sm">
          <Link href="/antrean/saya">Kembali ke Antrean Saya</Link>
        </Button>
      </div>
    );
  }

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

          <div className="mt-6 flex flex-col items-center">
            <span className="text-xs text-teal-200 uppercase font-mono">Nomor Antrean Anda</span>
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-wider mt-1 text-white">
              {ticket.nomorTiket}
            </div>
            <Badge className="mt-3 bg-white text-teal-900 hover:bg-teal-50 font-semibold text-xs uppercase px-3 py-1">
              STATUS: {ticket.status}
            </Badge>
          </div>
        </div>

        {/* Mid Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* QR Code Container */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl bg-surface border border-border text-center space-y-2">
              <img
                src={ticket.qrCodeUrl}
                alt={`QR Code ${ticket.nomorTiket}`}
                className="h-36 w-36 rounded-lg border border-border shadow-2xs"
              />
              <span className="text-[11px] text-muted-foreground font-mono">
                Scan di Kios Mandiri / Loket
              </span>
            </div>

            {/* Patient & Ticket Details */}
            <div className="sm:col-span-7 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Nama Pasien:</span>
                <span className="font-semibold text-foreground">{patient.namaLengkap}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">No. Rekam Medis:</span>
                <span className="font-mono font-bold text-foreground">{patient.noRm}</span>
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
                    <p className="text-xs text-muted-foreground">{step.keterangan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-border justify-between">
            <Button
              onClick={handleCheckIn}
              disabled={checkedIn || checkingIn}
              className="gap-2 text-xs shadow-xs"
            >
              {checkedIn ? (
                <>
                  <Check className="h-4 w-4" /> Check-in Berhasil
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Konfirmasi Check-in Kedatangan
                </>
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-1.5 text-xs"
              >
                <Printer className="h-4 w-4" /> Cetak Tiket
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
