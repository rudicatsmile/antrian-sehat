"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Stethoscope, CheckCircle2, QrCode, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DUMMY_DOKTER, Doctor } from "@/lib/dummy/dokter";
import { DUMMY_LAYANAN } from "@/lib/dummy/layanan";
import { CURRENT_PATIENT } from "@/lib/dummy/pasien";

export default function BookingPoliklinikPage() {
  const router = useRouter();
  const poliUnits = DUMMY_LAYANAN.filter((u) => u.kind === "poliklinik");

  const [selectedPoliSlug, setSelectedPoliSlug] = React.useState<string>(poliUnits[0].slug);
  const [selectedDocId, setSelectedDocId] = React.useState<string>(DUMMY_DOKTER[0].id);
  const [selectedDate, setSelectedDate] = React.useState<string>("2026-10-15");
  const [selectedSessionId, setSelectedSessionId] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  // Doctors belonging to the selected poli
  const availableDoctors = DUMMY_DOKTER.filter((d) => d.unitSlug === selectedPoliSlug);
  const currentDoctor = availableDoctors.find((d) => d.id === selectedDocId) || availableDoctors[0];

  React.useEffect(() => {
    if (availableDoctors.length > 0 && !availableDoctors.some((d) => d.id === selectedDocId)) {
      setSelectedDocId(availableDoctors[0].id);
    }
  }, [selectedPoliSlug, availableDoctors, selectedDocId]);

  React.useEffect(() => {
    if (currentDoctor?.sessions?.length > 0) {
      setSelectedSessionId(currentDoctor.sessions[0].id);
    }
  }, [currentDoctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDoctor) {
      toast.error("Mohon pilih dokter spesialis terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const { createBooking } = await import("@/app/actions/booking");
      const unit = poliUnits.find((u) => u.slug === selectedPoliSlug) || poliUnits[0];

      const res = await createBooking({
        patientId: CURRENT_PATIENT.id,
        unitId: unit.id,
        unitKind: "poliklinik",
        bookingDate: selectedDate,
        sessionId: selectedSessionId || undefined,
        doctorId: currentDoctor.id,
        priorityCategory: CURRENT_PATIENT.kategoriPrioritas as any,
      });

      if (res.success) {
        toast.success(res.message || `Booking Berhasil! Nomor Antrean Anda: ${res.ticket?.nomor_antrean}.`);
        router.push("/antrean/saya");
      } else {
        toast.error(res.error || "Gagal melakukan booking antrean.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal melakukan booking antrean.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Link
        href="/booking"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Pilihan Unit
      </Link>

      <div className="space-y-1">
        <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
          Rawat Jalan
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
          Booking Poliklinik Spesialis
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Pilih poliklinik, dokter spesialis, tanggal berobat (H-7 s/d H-0), dan sesi jam praktik.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Pilih Poliklinik */}
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold font-heading flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">
                1
              </span>
              Pilih Poliklinik Tujuan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {poliUnits.map((poli) => {
                const isSelected = selectedPoliSlug === poli.slug;
                return (
                  <button
                    key={poli.id}
                    type="button"
                    onClick={() => setSelectedPoliSlug(poli.slug)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-secondary/60 text-foreground ring-1 ring-primary shadow-xs"
                        : "border-border hover:bg-surface text-muted-foreground"
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold text-teal-800 uppercase block">
                      {poli.kode}
                    </span>
                    <span className="font-heading font-semibold text-xs text-foreground block mt-0.5">
                      {poli.nama.replace("Poliklinik ", "")}
                    </span>
                    <span className="text-[10px] text-muted-foreground block mt-1">
                      {poli.lantai.split(" - ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Pilih Dokter */}
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold font-heading flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">
                2
              </span>
              Pilih Dokter Spesialis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            {availableDoctors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableDoctors.map((doc) => {
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? "border-primary bg-secondary/60 ring-1 ring-primary shadow-xs"
                          : "border-border hover:bg-surface"
                      }`}
                    >
                      <div className="h-11 w-11 rounded-full bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center shrink-0 border border-teal-200">
                        {doc.nama.replace("dr. ", "").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <div className="font-heading font-semibold text-xs text-foreground">
                          {doc.nama}
                        </div>
                        <div className="text-[11px] text-teal-800 font-medium">{doc.gelar}</div>
                        <div className="text-[11px] text-muted-foreground">{doc.ruangPraktek}</div>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {doc.jadwalHari.map((h) => (
                            <span key={h} className="text-[9px] px-1.5 py-0.5 bg-background rounded border border-border">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Tidak ada dokter spesialis yang terdaftar pada poli ini saat ini.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Tanggal & Sesi Kuota */}
        {currentDoctor && (
          <Card className="border-border">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-semibold font-heading flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-teal-100 text-teal-800 text-xs flex items-center justify-center font-bold">
                  3
                </span>
                Pilih Tanggal & Sesi Praktik
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="tgl" className="text-xs">Tanggal Kunjungan Berobat *</Label>
                <input
                  id="tgl"
                  type="date"
                  className="flex h-10 w-full sm:w-64 rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min="2026-10-14"
                  max="2026-10-21"
                  required
                />
                <span className="text-[11px] text-muted-foreground block">
                  Ketentuan sistem: Booking poliklinik dibuka H-7 sampai H-0 sebelum jam layanan ditutup.
                </span>
              </div>

              {/* Sesi List with Quota */}
              <div className="space-y-2 pt-2">
                <Label className="text-xs">Pilihan Sesi & Kapasitas Kuota Tersedia *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentDoctor.sessions.map((ses) => {
                    const isSelected = selectedSessionId === ses.id;
                    const sisa = ses.kuota - ses.terpakai;
                    const isFull = sisa <= 0;
                    return (
                      <div
                        key={ses.id}
                        onClick={() => !isFull && setSelectedSessionId(ses.id)}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isFull
                            ? "opacity-50 cursor-not-allowed bg-muted/40 border-border"
                            : isSelected
                            ? "border-primary bg-secondary/60 ring-1 ring-primary cursor-pointer shadow-xs"
                            : "border-border hover:bg-surface cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-heading font-bold text-xs uppercase text-foreground">
                            Sesi {ses.sesi}
                          </span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {ses.jamMulai} - {ses.jamSelesai}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                          <span className="text-muted-foreground text-[11px]">Sisa Kuota:</span>
                          <span className={`font-bold font-mono ${isFull ? "text-destructive" : "text-primary"}`}>
                            {isFull ? "KUOTA PENUH" : `${sisa} dari ${ses.kuota} kursi`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Priority reminder */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Status Prioritas Pasien Aktif: Lansia (68 Tahun)</span>
            <span className="text-blue-800">
              Tiket Anda akan secara otomatis mendapatkan nomor urut prioritas sesuai regulasi RSUD Sejahtera Sehat.
            </span>
          </div>
        </div>

        <Button type="submit" disabled={loading} size="lg" className="w-full gap-2 text-sm h-11">
          <CheckCircle2 className="h-4 w-4" />
          {loading ? "Menerbitkan Tiket Antrean..." : "Konfirmasi & Terbitkan Tiket Antrean Poli"}
        </Button>
      </form>
    </div>
  );
}
