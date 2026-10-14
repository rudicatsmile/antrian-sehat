"use client";

import * as React from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Doctor } from "@/lib/types";

interface KuotaDokterClientProps {
  initialDoctors: Doctor[];
}

export function KuotaDokterClient({ initialDoctors }: KuotaDokterClientProps) {
  const [doctors] = React.useState<Doctor[]>(initialDoctors);
  const [selectedDoctorId, setSelectedDoctorId] = React.useState(doctors[0]?.id || "");
  const [selectedDate, setSelectedDate] = React.useState("2026-10-15");

  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];
  const [sessionQuotas, setSessionQuotas] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (currentDoctor && currentDoctor.sessions) {
      const quotas: Record<string, number> = {};
      currentDoctor.sessions.forEach((s) => {
        quotas[s.sesi] = s.kuota;
      });
      setSessionQuotas(quotas);
    }
  }, [selectedDoctorId, currentDoctor]);

  const handleUpdateQuota = (sesi: string, newQuota: number) => {
    const sessionData = currentDoctor?.sessions.find((s) => s.sesi === sesi);
    const terpakai = sessionData?.terpakai || 0;

    if (newQuota < terpakai) {
      toast.error(`Gagal: Kuota (${newQuota}) tidak boleh lebih kecil dari jumlah pasien yang sudah terdaftar (${terpakai} pasien).`);
      return;
    }

    setSessionQuotas({
      ...sessionQuotas,
      [sesi]: newQuota,
    });
  };

  const [saving, setSaving] = React.useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDoctor) return;
    setSaving(true);
    try {
      const { setDoctorQuota } = await import("@/app/actions/petugas");
      for (const [sesi, quota] of Object.entries(sessionQuotas)) {
        const session = currentDoctor.sessions.find((s) => s.sesi === sesi);
        if (session) {
          await setDoctorQuota(session.id, quota);
        }
      }
      toast.success(`Pengaturan kuota dokter ${currentDoctor.nama} untuk tanggal ${selectedDate} berhasil disimpan ke database!`);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan kuota dokter.");
    } finally {
      setSaving(false);
    }
  };

  if (!currentDoctor) {
    return (
      <Card className="p-8 text-center text-muted-foreground text-sm">
        Belum ada dokter terdaftar di database Supabase.
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* Left Column: Select Doctor and Date */}
      <div className="md:col-span-5 space-y-4">
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-sm font-semibold font-heading">
              Pilih Dokter & Tanggal
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Tanggal Praktik *</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium">Pilih Dokter Spesialis *</label>
              <div className="space-y-2">
                {doctors.map((doc) => {
                  const isSelected = selectedDoctorId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctorId(doc.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-secondary/50 font-semibold ring-1 ring-primary shadow-xs"
                          : "border-border hover:bg-surface"
                      }`}
                    >
                      <div className="text-foreground">{doc.nama}</div>
                      <div className="text-[11px] text-muted-foreground font-normal">{doc.unit}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Quota Configuration by Session */}
      <div className="md:col-span-7">
        <Card className="border-border">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold font-heading">
                  {currentDoctor.nama}
                </CardTitle>
                <CardDescription className="text-xs">
                  {currentDoctor.spesialisasi} • {currentDoctor.unit}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs bg-surface font-mono">
                {selectedDate}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-5 pt-0">
            <form onSubmit={handleSave} className="space-y-4">
              {/* Session Slots */}
              {currentDoctor.sessions.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Belum ada jadwal sesi praktek aktif untuk dokter ini di database.
                </div>
              ) : (
                currentDoctor.sessions.map((ses) => {
                  const quotaVal = sessionQuotas[ses.sesi] ?? ses.kuota;
                  return (
                    <div
                      key={ses.id}
                      className="p-4 rounded-xl border border-border bg-surface/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-xs uppercase text-foreground">
                            Sesi {ses.sesi}
                          </span>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            ({ses.jamMulai} - {ses.jamSelesai} WIB)
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono bg-background"
                        >
                          Terpakai: {ses.terpakai} Pasien
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 items-center pt-1">
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-1">
                            Batas Maksimal Kuota Pasien:
                          </label>
                          <Input
                            type="number"
                            min={ses.terpakai}
                            max={200}
                            value={quotaVal}
                            onChange={(e) =>
                              handleUpdateQuota(
                                ses.sesi,
                                parseInt(e.target.value) || ses.terpakai
                              )
                            }
                            className="h-9 font-mono font-bold"
                          />
                        </div>

                        <div className="text-[11px] text-muted-foreground space-y-0.5">
                          <div>
                            Sisa Terbuka:{" "}
                            <strong className="text-primary font-mono">
                              {Math.max(0, quotaVal - ses.terpakai)}
                            </strong>{" "}
                            kursi
                          </div>
                          <div>Min: {ses.terpakai} | Maks: 200</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Perubahan kuota disimpan secara atomik ke database Supabase untuk mencegah overbooking saat banyak pasien mendaftar serentak.
                </span>
              </div>

              <Button type="submit" disabled={saving || currentDoctor.sessions.length === 0} className="w-full text-xs gap-2 h-10">
                <Save className="h-4 w-4" />
                {saving ? "Menyimpan ke Database..." : "Simpan Perubahan Kuota Sesi"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
