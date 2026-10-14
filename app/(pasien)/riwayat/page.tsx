import * as React from "react";
import Link from "next/link";
import { History, Calendar, Stethoscope, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPatientHistory } from "@/lib/services/pasien";

export default async function RiwayatKunjunganPage() {
  const history = await getPatientHistory();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-1 pb-2 border-b border-border/80">
        <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
          Rekam Layanan
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
          Riwayat Kunjungan & Layanan
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Arsip kunjungan medis, konsultasi dokter poliklinik, dan pemeriksaan diagnostik yang tercatat di database RSUD.
        </p>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <Card className="border-border p-8 text-center text-muted-foreground">
            <History className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm font-medium">Belum ada riwayat kunjungan yang selesai tercatat di database.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Setelah sesi konsultasi selesai atau ditandai oleh dokter, riwayat akan otomatis muncul di sini.
            </p>
          </Card>
        ) : (
          history.map((item) => (
            <Card key={item.id} className="border-border hover:shadow-xs transition-shadow">
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-xs text-foreground">{item.tanggal}</span>
                    <Badge variant="outline" className="text-[10px] font-mono bg-surface">
                      Tiket: {item.nomorTiket}
                    </Badge>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs self-start sm:self-auto">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {item.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-8 space-y-1">
                    <h3 className="font-heading font-bold text-base text-foreground">
                      {item.unitNama}
                    </h3>
                    <p className="text-xs text-primary font-medium">{item.dokterNama}</p>
                    <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                      Catatan Layanan: &quot;{item.diagnosaUtama}&quot;
                    </p>
                  </div>

                  <div className="md:col-span-4 text-left sm:text-right space-y-1">
                    <span className="text-[11px] text-muted-foreground block">Tindakan Klinis:</span>
                    <span className="font-semibold text-xs text-foreground">
                      {item.tindakan}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
