"use client";

import * as React from "react";
import Link from "next/link";
import { UserPlus, Search, UserCheck, Printer, Edit3, ArrowRight, ShieldCheck, Ticket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DUMMY_STAFF_PATIENTS, StaffPatientRecord } from "@/lib/dummy/petugas";

export default function PetugasPendaftaranPage() {
  const [patients, setPatients] = React.useState<StaffPatientRecord[]>(DUMMY_STAFF_PATIENTS);
  const [searchTerm, setSearchTerm] = React.useState("");

  const filtered = patients.filter(
    (p) =>
      p.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nik.includes(searchTerm) ||
      (p.noRm && p.noRm.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePrintTicket = (patient: StaffPatientRecord) => {
    toast.success(`Tiket Antrean Loket POL-D-025 untuk ${patient.namaLengkap} sedang dicetak ke printer thermal.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Loket Pendaftaran & Admisi
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Pelayanan Pendaftaran Pasien (Loket)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pendaftaran pasien baru, penerbitan RM digital untuk pasien lama, pembaruan data, dan pencetakan tiket.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/petugas/pendaftaran/pasien-baru">
              <UserPlus className="h-4 w-4" />
              + Form Pasien Baru
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/petugas/pendaftaran/pasien-lama">
              <Search className="h-4 w-4" />
              Cari Pasien Lama
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="update" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="update">Daftar & Edit Pasien</TabsTrigger>
          <TabsTrigger value="baru">Pasien Baru</TabsTrigger>
          <TabsTrigger value="lama">Pasien Lama Tanpa RM</TabsTrigger>
        </TabsList>

        {/* Tab 1: Daftar & Edit Pasien */}
        <TabsContent value="update" className="space-y-4">
          <div className="flex items-center gap-3 bg-surface p-3.5 rounded-xl border border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Cari berdasarkan Nama Pasien, NIK 16 digit, atau No RM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background text-xs"
            />
          </div>

          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Nama Lengkap Pasien</th>
                  <th className="p-3">NIK</th>
                  <th className="p-3">No. Rekam Medis</th>
                  <th className="p-3">Nomor WhatsApp</th>
                  <th className="p-3">Prioritas</th>
                  <th className="p-3 text-right">Aksi Loket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((patient) => (
                  <tr key={patient.id} className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-foreground">
                      {patient.namaLengkap}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{patient.nik}</td>
                    <td className="p-3 font-mono font-bold text-teal-800">
                      {patient.noRm || "Belum Ada"}
                    </td>
                    <td className="p-3 font-mono text-muted-foreground">{patient.noWhatsapp}</td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {patient.kategoriPrioritas}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] h-7 px-2"
                        onClick={() => handlePrintTicket(patient)}
                      >
                        <Printer className="h-3 w-3 mr-1" />
                        Cetak Tiket
                      </Button>
                      <Button asChild size="sm" variant="ghost" className="text-[11px] h-7 px-2 text-primary">
                        <Link href={`/petugas/pendaftaran/update/${patient.id}`}>
                          <Edit3 className="h-3 w-3 mr-1" />
                          Update Data
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Tab 2: Shortcut Form Pasien Baru */}
        <TabsContent value="baru">
          <Card className="p-6 text-center space-y-3">
            <UserPlus className="h-10 w-10 text-primary mx-auto" />
            <h3 className="font-heading font-bold text-base">Registrasi Pasien Baru di Loket</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Gunakan formulir registrasi lengkap loket untuk membuat rekam medis baru berformat <strong>RM-YYYY-XXXXXX</strong> dan langsung menerbitkan tiket antrean cetak.
            </p>
            <Button asChild size="sm">
              <Link href="/petugas/pendaftaran/pasien-baru">
                Buka Formulir Pasien Baru →
              </Link>
            </Button>
          </Card>
        </TabsContent>

        {/* Tab 3: Shortcut Pasien Lama Tanpa RM */}
        <TabsContent value="lama">
          <Card className="p-6 text-center space-y-3">
            <Search className="h-10 w-10 text-teal-700 mx-auto" />
            <h3 className="font-heading font-bold text-base">Pencarian Pasien Arsip Lama</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Pasien lama yang belum memiliki rekam medis digital dapat dicari berdasarkan NIK atau data kependudukan manual sebelum diterbitkan RM digital resmi.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/petugas/pendaftaran/pasien-lama">
                Buka Form Pencarian Pasien Lama →
              </Link>
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
