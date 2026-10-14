"use client";

import * as React from "react";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Doctor } from "@/lib/types";

interface AdminDokterClientProps {
  initialDoctors: Doctor[];
}

export function AdminDokterClient({ initialDoctors }: AdminDokterClientProps) {
  const [doctors] = React.useState<Doctor[]>(initialDoctors);

  return (
    <Card className="border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
              <tr>
                <th className="p-4">Dokter & SIP</th>
                <th className="p-4">Spesialisasi</th>
                <th className="p-4">Penugasan Poliklinik</th>
                <th className="p-4">Jadwal Sesi</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {doctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    Belum ada dokter terdaftar di database Supabase.
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
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
                          <span className="text-[11px] text-teal-800 font-mono">
                            SIP: {doc.sip || "-"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{doc.spesialisasi}</td>
                    <td className="p-4 font-medium text-foreground">{doc.unit}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {doc.sessions.length > 0 ? (
                          doc.sessions.map((s) => (
                            <span
                              key={s.id}
                              className="px-1.5 py-0.5 rounded bg-secondary text-primary text-[10px] font-semibold"
                            >
                              {s.hari}: {s.sesi}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-[10px]">Belum diatur</span>
                        )}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
