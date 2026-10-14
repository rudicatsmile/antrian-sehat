"use client";

import * as React from "react";
import { Search, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationLogRecord } from "@/lib/types";

interface AdminNotifikasiClientProps {
  initialLogs: NotificationLogRecord[];
}

export function AdminNotifikasiClient({ initialLogs }: AdminNotifikasiClientProps) {
  const [logs] = React.useState<NotificationLogRecord[]>(initialLogs);
  const [search, setSearch] = React.useState("");

  const filtered = logs.filter(
    (l) =>
      l.namaPasien.toLowerCase().includes(search.toLowerCase()) ||
      l.nomorTujuan.includes(search) ||
      l.isiPesan.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Audit Notifikasi WhatsApp
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Log Pengiriman Pesan WhatsApp Gateway
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pencatatan riwayat pesan konfirmasi booking, giliran hampir tiba, pemanggilan loket, dan resi tagihan dari database Supabase.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.success("Log notifikasi sinkron dengan database.")}
          className="gap-2 text-xs"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Segarkan Data
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-surface p-3.5 rounded-xl border border-border">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          placeholder="Cari berdasarkan Nama Pasien, Nomor WhatsApp, atau Konten Pesan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background text-xs"
        />
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Tujuan / Pasien</th>
                  <th className="p-4">Jenis Template</th>
                  <th className="p-4">Isi Pesan WhatsApp</th>
                  <th className="p-4">Status Pengiriman</th>
                  <th className="p-4">Waktu Kirim</th>
                  <th className="p-4">Gateway Provider</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      Belum ada log notifikasi WhatsApp yang tersimpan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-surface/50">
                      <td className="p-4">
                        <span className="font-heading font-semibold text-foreground block">
                          {log.namaPasien}
                        </span>
                        <span className="font-mono text-muted-foreground text-[11px]">
                          {log.nomorTujuan}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-[10px]">
                          {log.jenisPesan}
                        </Badge>
                      </td>
                      <td className="p-4 max-w-sm text-muted-foreground leading-relaxed">
                        &quot;{log.isiPesan}&quot;
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Terkirim
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-[11px] whitespace-nowrap">
                        {log.waktuKirim}
                      </td>
                      <td className="p-4 text-muted-foreground text-[11px] whitespace-nowrap">
                        {log.gatewayProvider}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
