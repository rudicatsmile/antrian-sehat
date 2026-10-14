"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, History, FileText, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_STAFF_PATIENTS, DUMMY_PATIENT_CHANGE_LOGS, PatientChangeLog } from "@/lib/dummy/petugas";

export default function UpdatePasienPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;

  const patient =
    DUMMY_STAFF_PATIENTS.find((p) => p.id === patientId) || DUMMY_STAFF_PATIENTS[0];

  const [formData, setFormData] = React.useState({
    namaLengkap: patient.namaLengkap,
    noWhatsapp: patient.noWhatsapp,
    alamat: patient.alamat,
    kategoriPrioritas: patient.kategoriPrioritas,
  });

  const [changeLogs, setChangeLogs] = React.useState<PatientChangeLog[]>(DUMMY_PATIENT_CHANGE_LOGS);
  const [loading, setLoading] = React.useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { updatePatient } = await import("@/app/actions/pasien");
      const res = await updatePatient(patient.id, {
        nama_lengkap: formData.namaLengkap,
        no_whatsapp: formData.noWhatsapp,
        alamat: formData.alamat,
        kategori_prioritas: formData.kategoriPrioritas as "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency",
        changedById: "staff-loket-1",
      });

      if (res.success) {
        const newLog: PatientChangeLog = {
          id: `cl-${Date.now()}`,
          patientId: patient.id,
          fieldName: "Pembaruan Profil Pasien",
          oldValue: patient.alamat,
          newValue: formData.alamat,
          changedBy: "Ns. Maya Astuti (Petugas Loket)",
          createdAt: "Baru Saja",
        };
        setChangeLogs([newLog, ...changeLogs]);
        toast.success(res.message || "Perubahan data pasien berhasil disimpan dan dicatat ke log audit sistem!");
      } else {
        toast.error(res.error || "Gagal memperbarui data pasien.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui data pasien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/petugas/pendaftaran"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Loket Pendaftaran
      </Link>

      <div className="space-y-1">
        <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
          Audit & Update
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
          Pembaruan Data: {patient.namaLengkap}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          No. RM: <strong className="font-mono text-teal-800">{patient.noRm}</strong> • NIK: <span className="font-mono">{patient.nik}</span>
        </p>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        <Card className="border-border">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-base">Formulir Perubahan Data Pasien</CardTitle>
            <CardDescription className="text-xs">
              Setiap perubahan pada form ini otomatis tercatat di tabel audit log perubahan.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="nama" className="text-xs">Nama Lengkap Pasien *</Label>
              <Input
                id="nama"
                value={formData.namaLengkap}
                onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="wa" className="text-xs">Nomor WhatsApp Aktif *</Label>
                <Input
                  id="wa"
                  value={formData.noWhatsapp}
                  onChange={(e) => setFormData({ ...formData, noWhatsapp: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="prio" className="text-xs">Kategori Prioritas</Label>
                <select
                  id="prio"
                  className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  value={formData.kategoriPrioritas}
                  onChange={(e) => setFormData({ ...formData, kategoriPrioritas: e.target.value as "normal" | "lansia" | "disabilitas" | "ibu_hamil" | "emergency" })}
                >
                  <option value="normal">Normal</option>
                  <option value="lansia">Lansia</option>
                  <option value="disabilitas">Disabilitas</option>
                  <option value="ibu_hamil">Ibu Hamil</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="alamat" className="text-xs">Alamat Domisili Terkini *</Label>
              <textarea
                id="alamat"
                rows={3}
                className="flex w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full text-xs gap-2 h-10">
              <Save className="h-4 w-4" />
              {loading ? "Menyimpan Catatan Audit..." : "Simpan Perubahan & Rekam Log"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Audit Log Table (patient_change_logs) */}
      <Card className="border-border">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Riwayat Perubahan Data (Audit Log)</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Daftar jejak perubahan data pasien yang tersimpan di tabel <code className="font-mono text-teal-800">patient_change_logs</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="p-3">Field Diubah</th>
                  <th className="p-3">Nilai Lama</th>
                  <th className="p-3">Nilai Baru</th>
                  <th className="p-3">Petugas Pengubah</th>
                  <th className="p-3">Waktu Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {changeLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-foreground">{log.fieldName}</td>
                    <td className="p-3 font-mono text-muted-foreground">{log.oldValue || "-"}</td>
                    <td className="p-3 font-mono text-teal-800 font-medium">{log.newValue}</td>
                    <td className="p-3 text-muted-foreground">{log.changedBy}</td>
                    <td className="p-3 text-muted-foreground">{log.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
