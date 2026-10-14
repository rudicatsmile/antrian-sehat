"use client";

import * as React from "react";
import { Stethoscope, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_DOKTER, Doctor } from "@/lib/dummy/dokter";

export default function AdminDokterPage() {
  const [doctors, setDoctors] = React.useState<Doctor[]>(DUMMY_DOKTER);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Tenaga Medis Spesialis
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Kelola Master Dokter Spesialis
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Data profil dokter spesialis, penugasan poliklinik, gelar medis, dan jadwal hari praktik.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => toast.info("Membuka modal pendaftaran dokter spesialis baru.")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          + Tambah Dokter Baru
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Dokter & Gelar</th>
                  <th className="p-4">Spesialisasi</th>
                  <th className="p-4">Penugasan Poliklinik</th>
                  <th className="p-4">Ruangan Praktik</th>
                  <th className="p-4">Jadwal Praktik</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                          {doc.nama.replace("dr. ", "").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-heading font-bold text-sm text-foreground block">
                            {doc.nama}
                          </span>
                          <span className="text-[11px] text-teal-800 font-medium">
                            {doc.gelar}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{doc.spesialisasi}</td>
                    <td className="p-4 font-medium text-foreground">{doc.unitNama}</td>
                    <td className="p-4 text-muted-foreground">{doc.ruangPraktek}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {doc.jadwalHari.map((h) => (
                          <span
                            key={h}
                            className="px-1.5 py-0.5 rounded bg-secondary text-primary text-[10px] font-semibold"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                        Aktif Praktik
                      </Badge>
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] h-7"
                        onClick={() => toast.info(`Mengedit profil ${doc.nama}`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </td>
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
