"use client";

import * as React from "react";
import { Layers, Plus, Edit, Clock, Building, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_LAYANAN, UnitLayanan } from "@/lib/dummy/layanan";

export default function AdminUnitPage() {
  const [units, setUnits] = React.useState<UnitLayanan[]>(DUMMY_LAYANAN);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Master Unit Layanan & Loket
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Kelola Unit Layanan Medis & Loket
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Konfigurasi jam operasional buka/tutup, standar estimasi menit layanan, dan jumlah loket aktif.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => toast.info("Membuka modal konfigurasi unit layanan baru.")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          + Tambah Unit Layanan
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Kode</th>
                  <th className="p-4">Nama Unit</th>
                  <th className="p-4">Gedung & Lantai</th>
                  <th className="p-4">Kategori Layanan</th>
                  <th className="p-4">Jam Operasional</th>
                  <th className="p-4 text-center">Standar Waktu</th>
                  <th className="p-4 text-center">Loket</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-surface/50">
                    <td className="p-4 font-mono font-bold text-teal-800">
                      {unit.kode}
                    </td>
                    <td className="p-4 font-heading font-semibold text-foreground">
                      {unit.nama}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {unit.buildingName.split(" ")[0]} {unit.buildingName.split(" ")[1]} • {unit.lantai}
                    </td>
                    <td className="p-4 capitalize">
                      <Badge variant="outline" className="text-[10px]">
                        {unit.kind.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">
                      {unit.jamBuka} - {unit.jamTutup} WIB
                    </td>
                    <td className="p-4 text-center font-mono">
                      ~{unit.defaultServiceMinutes} mnt
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-teal-800">
                      {unit.loketAktif}
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] h-7"
                        onClick={() => toast.info(`Mengubah konfigurasi unit ${unit.nama}`)}
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
