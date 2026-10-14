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
import { createClient } from "@/lib/supabase/client";
import type { Doctor, DoctorSession, UnitLayanan, PatientProfile } from "@/lib/types";

export default function BookingPoliklinikPage() {
  const router = useRouter();

  const [poliUnits, setPoliUnits] = React.useState<UnitLayanan[]>([]);
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);
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

  const [selectedPoliSlug, setSelectedPoliSlug] = React.useState<string>("");
  const [selectedDocId, setSelectedDocId] = React.useState<string>("");
  const [selectedDate, setSelectedDate] = React.useState<string>(() => new Date().toISOString().split("T")[0]);
  const [selectedSessionId, setSelectedSessionId] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function loadData() {
      const supabase = createClient();

      // 1. Fetch user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (p) {
          setPatient({
            id: p.id,
            nik: p.nik || "",
            namaLengkap: p.nama_lengkap,
            noWhatsapp: p.no_whatsapp,
            tanggalLahir: p.tanggal_lahir || "",
            jenisKelamin: (p.jenis_kelamin as "L" | "P") || "L",
            alamat: p.alamat || "",
            noRm: p.no_rm || "RM-BELUM-ADA",
            kategoriPrioritas: p.kategori_prioritas || "normal",
          });
        }
      } else {
        const { data: firstP } = await supabase.from("profiles").select("*").limit(1).maybeSingle();
        if (firstP) {
          setPatient({
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
      }

      // 2. Fetch poliklinik units
      const { data: units } = await supabase
        .from("units")
        .select("*, buildings(*)")
        .eq("kind", "poliklinik")
        .eq("is_active", true)
        .order("kode", { ascending: true });

      if (units && units.length > 0) {
        const mappedUnits: UnitLayanan[] = units.map((u: any) => ({
          id: u.id,
          kode: u.kode,
          nama: u.nama,
          slug: u.slug,
          buildingId: u.building_id,
          buildingName: u.buildings?.nama || "Gedung A",
          lantai: u.lantai || "Lantai 1",
          kind: "poliklinik",
          deskripsi: u.nama,
          jamBuka: u.jam_buka?.slice(0, 5) || "08:00",
          jamTutup: u.jam_tutup?.slice(0, 5) || "15:00",
          defaultServiceMinutes: u.default_service_minutes || 12,
          persyaratan: [],
          estimasiTungguMenit: 10,
          sisaKuotaHariIni: 50,
          totalKuotaHariIni: 100,
          loketAktif: 1,
          isActive: true,
        }));
        setPoliUnits(mappedUnits);
        setSelectedPoliSlug(mappedUnits[0].slug);
      }

      // 3. Fetch doctors and their sessions
      const { data: docs } = await supabase
        .from("doctors")
        .select("*, units(nama, slug)")
        .eq("is_active", true);

      if (docs && docs.length > 0) {
        const docIds = docs.map((d: any) => d.id);
        const { data: sessions } = await supabase
          .from("doctor_sessions")
          .select("*")
          .in("doctor_id", docIds)
          .eq("tanggal", selectedDate)
          .order("jam_mulai", { ascending: true });

        const mappedDocs: Doctor[] = docs.map((d: any) => {
          const docSessions: DoctorSession[] = (sessions || [])
            .filter((s: any) => s.doctor_id === d.id)
            .map((s: any) => ({
              id: s.id,
              sesi: s.sesi,
              jamMulai: s.jam_mulai.slice(0, 5),
              jamSelesai: s.jam_selesai.slice(0, 5),
              kuota: s.kuota,
              terpakai: s.terpakai,
              isAktif: s.is_aktif,
            }));

          return {
            id: d.id,
            nama: d.nama,
            gelar: "Spesialis",
            spesialisasi: d.spesialisasi,
            unitSlug: d.units?.slug || "poliklinik",
            unitNama: d.units?.nama || "Poliklinik",
            fotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
            jadwalHari: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
            ruangPraktek: "Ruang Konsultasi Dokter",
            sessions: docSessions.length > 0 ? docSessions : [
              { id: "ses-def-1", sesi: "pagi", jamMulai: "08:00", jamSelesai: "11:30", kuota: 30, terpakai: 0, isAktif: true },
              { id: "ses-def-2", sesi: "siang", jamMulai: "13:00", jamSelesai: "15:30", kuota: 25, terpakai: 0, isAktif: true }
            ],
          };
        });

        setDoctors(mappedDocs);
        if (mappedDocs.length > 0) {
          setSelectedDocId(mappedDocs[0].id);
        }
      }
    }

    loadData();
  }, [selectedDate]);

  // Doctors belonging to the selected poli
  const availableDoctors = doctors.filter((d) => d.unitSlug === selectedPoliSlug);
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

    const unit = poliUnits.find((u) => u.slug === selectedPoliSlug) || poliUnits[0];
    if (!unit) {
      toast.error("Unit pelayanan tidak ditemukan.");
      return;
    }

    setLoading(true);
    try {
      const { createBooking } = await import("@/app/actions/booking");

      const res = await createBooking({
        patientId: patient.id || "demo-patient",
        unitId: unit.id,
        unitKind: "poliklinik",
        bookingDate: selectedDate,
        sessionId: selectedSessionId || undefined,
        doctorId: currentDoctor.id,
        priorityCategory: patient.kategoriPrioritas as any,
      });

      if (res.success) {
        toast.success(res.message || `Booking Berhasil! Nomor Antrean Anda: ${res.ticket?.nomor_tiket}.`);
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
        <h1 className="text-2xl sm:text-3xl font-bold font-heading">
          Booking Poliklinik Spesialis
        </h1>
        <p className="text-xs text-muted-foreground">
          Pilih unit poliklinik, dokter spesialis, tanggal kedatangan, dan sesi konsultasi yang tersedia.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Pilih Poliklinik */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                1
              </span>
              Pilih Poliklinik Spesialis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {poliUnits.map((poli) => {
                const isSelected = selectedPoliSlug === poli.slug;
                return (
                  <button
                    type="button"
                    key={poli.id}
                    onClick={() => setSelectedPoliSlug(poli.slug)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "border-primary bg-secondary/60 text-primary ring-2 ring-primary/20 shadow-xs"
                        : "border-border bg-card text-foreground hover:bg-surface"
                    }`}
                  >
                    <span className="font-heading font-semibold text-xs leading-tight">
                      {poli.nama}
                    </span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {poli.lantai}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Pilih Dokter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                2
              </span>
              Pilih Dokter Spesialis
            </CardTitle>
            <CardDescription className="text-xs">
              Menampilkan dokter spesialis yang bertugas pada unit ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableDoctors.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground">
                Belum ada dokter terdaftar di unit ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableDoctors.map((doc) => {
                  const isSelected = selectedDocId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                        isSelected
                          ? "border-primary bg-secondary/40 ring-2 ring-primary/20 shadow-xs"
                          : "border-border bg-card hover:bg-surface"
                      }`}
                    >
                      <div className="h-11 w-11 rounded-full bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center shrink-0 border border-teal-200">
                        {doc.nama.replace("dr. ", "").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-heading font-bold text-xs text-foreground leading-tight">
                          {doc.nama}
                        </h4>
                        <p className="text-[11px] text-teal-800 font-medium">{doc.gelar}</p>
                        <p className="text-[10px] text-muted-foreground">{doc.ruangPraktek}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Pilih Tanggal & Sesi */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                3
              </span>
              Pilih Tanggal & Sesi Jam Praktik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-xs space-y-1.5">
              <Label htmlFor="date-input" className="text-xs font-semibold">
                Tanggal Kunjungan (H-0 s.d H-7):
              </Label>
              <input
                id="date-input"
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs font-mono"
              />
            </div>

            {currentDoctor && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold block">Pilih Sesi Konsultasi:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentDoctor.sessions.map((ses) => {
                    const isSelected = selectedSessionId === ses.id;
                    const sisa = ses.kuota - ses.terpakai;
                    const isFull = sisa <= 0;

                    return (
                      <button
                        type="button"
                        key={ses.id}
                        disabled={isFull}
                        onClick={() => setSelectedSessionId(ses.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? "border-primary bg-secondary/60 text-primary ring-2 ring-primary/20"
                            : isFull
                            ? "border-border bg-surface/50 opacity-60 cursor-not-allowed"
                            : "border-border bg-card hover:bg-surface"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-heading font-semibold text-xs capitalize block">
                            Sesi {ses.sesi}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground block">
                            {ses.jamMulai} - {ses.jamSelesai} WIB
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            isFull
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-emerald-50 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {isFull ? "Kuota Penuh" : `${sisa} Sisa Kuota`}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Action */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border">
          <div className="text-xs space-y-0.5">
            <span className="font-semibold text-foreground block">
              Konfirmasi Booking Pasien:
            </span>
            <span className="text-muted-foreground block">
              {patient.namaLengkap} • No. RM: {patient.noRm}
            </span>
          </div>
          <Button type="submit" disabled={loading} className="gap-2 text-xs shadow-xs">
            {loading ? "Memproses..." : "Konfirmasi & Ambil Tiket"}
          </Button>
        </div>
      </form>
    </div>
  );
}
