"use client";

import * as React from "react";
import Link from "next/link";
import { CreditCard, CheckCircle2, Clock, ArrowRight, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DUMMY_INVOICES, InvoiceItem } from "@/lib/dummy/pasien";
import { formatRupiah } from "@/lib/utils";

export default function PembayaranListPage() {
  const [invoices] = React.useState<InvoiceItem[]>(DUMMY_INVOICES);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-1 pb-2 border-b border-border/80">
        <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
          Kasir & Keuangan
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
          Tagihan & Riwayat Pembayaran
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Daftar seluruh invoice tindakan poliklinik, laboratorium, resep obat, dan administrasi rekam medis.
        </p>
      </div>

      <div className="space-y-4">
        {invoices.map((inv) => {
          const isPaid = inv.status === "settlement";
          return (
            <Card key={inv.id} className="border-border hover:shadow-xs transition-shadow">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-surface px-2.5 py-1 rounded-md border border-border">
                      {inv.invoiceNo}
                    </span>
                    <span className="text-xs text-muted-foreground">• {inv.tanggal}</span>
                  </div>
                  <Badge
                    className={
                      isPaid
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : "bg-amber-100 text-amber-800 border-amber-200"
                    }
                  >
                    {isPaid ? "LUNAS (SETTLEMENT)" : "MENUNGGU PEMBAYARAN"}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-4">
                  <div className="space-y-1">
                    <h3 className="font-heading font-semibold text-sm text-foreground">
                      {inv.unitNama}
                    </h3>
                    {inv.ticketNomor && (
                      <span className="text-xs text-muted-foreground block font-mono">
                        Tiket Terkait: {inv.ticketNomor}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground block">
                      Jumlah Item: {inv.items.length} tindakan / pemeriksaan
                    </span>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <span className="text-xs text-muted-foreground block">Total Tagihan:</span>
                    <div className="text-2xl font-black text-foreground font-mono">
                      {formatRupiah(inv.totalAmount)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {isPaid
                      ? `Dibayar via ${inv.metodeBayar?.toUpperCase()} pada ${inv.paidAt}`
                      : "Dapat dibayar online via Midtrans atau tunai di Loket Kasir Gedung A"}
                  </span>
                  <Button asChild size="sm" variant={isPaid ? "outline" : "default"} className="text-xs gap-1.5">
                    <Link href={`/pembayaran/${inv.id}`}>
                      {isPaid ? "Lihat Kuitansi Resmi" : "Bayar Sekarang (Midtrans / Kasir)"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
