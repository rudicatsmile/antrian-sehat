"use client";

import * as React from "react";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnitLayanan } from "@/lib/types";

interface AdminUnitClientProps {
  initialUnits: UnitLayanan[];
}

export function AdminUnitClient({ initialUnits }: AdminUnitClientProps) {
  const [units] = React.useState<UnitLayanan[]>(initialUnits);

  return (
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
              {units.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    Belum ada unit layanan terdaftar di database Supabase.
                  </td>
                </tr>
              ) : (
                units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-surface/50">
                    <td className="p-4 font-mono font-bold text-teal-800">
                      {unit.kode}
                    </td>
                    <td className="p-4 font-heading font-semibold text-foreground">
                      {unit.nama}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {unit.gedung} • {unit.lantai}
                    </td>
                    <td className="p-4 capitalize">
                      <Badge variant="outline" className="text-[10px]">
                        {unit.kategori}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">
                      {unit.jamBuka} - {unit.jamTutup} WIB
                    </td>
                    <td className="p-4 text-center font-mono">
                      ~{unit.estimasiTungguMenit} mnt
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
