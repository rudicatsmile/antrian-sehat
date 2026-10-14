"use client";

import * as React from "react";
import Link from "next/link";
import { History, Calendar, Stethoscope, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_RIWAYAT_KUNJUNGAN } from "@/lib/dummy/pasien";
import { formatRupiah } from "@/lib/utils";

export default function RiwayatKunjunganPage() {
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
          Arsip kunjungan medis, konsultasi dokter poliklinik, dan pemeriksaan diagnostik yang telah selesai.
        </p>
      </div>

      <div className="space-y-4">
        {DUMMY_RIWAYAT_KUNJUNGAN.map((item) => (
          <Card key={item.id} className="border-border hover:shadow-xs transition-shadow">
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-xs text-foreground">{item.tanggal}</span>
                  <Badge variant="outline" className="text-[10px] font-mono bg-surface">
                    Tiket: {item.tiket}
                  </Badge>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs self-start sm:self-auto">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {item.statusLayanan}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-8 space-y-1">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    {item.unit}
                  </h3>
                  <p className="text-xs text-primary font-medium">{item.dokter}</p>
                  <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                    Catatan Klinis: &quot;{item.catatan}&quot;
                  </p>
                </div>

                <div className="md:col-span-4 text-left sm:text-right space-y-1">
                  <span className="text-[11px] text-muted-foreground block">Biaya Terlunasi:</span>
                  <span className="font-mono font-bold text-base text-foreground">
                    {formatRupiah(item.biaya)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
