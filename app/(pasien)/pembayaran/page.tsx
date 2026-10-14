"use client";

import * as React from "react";
import Link from "next/link";
import { CreditCard, CheckCircle2, Clock, ArrowRight, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { InvoiceItem } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";

export default function PembayaranListPage() {
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from("invoices")
        .select(`
          id,
          invoice_no,
          total_amount,
          status,
          created_at,
          paid_at,
          metode_bayar,
          queue_tickets (
            nomor_tiket,
            units (nama)
          ),
          invoice_items (
            id,
            nama_item,
            qty,
            harga_satuan
          )
        `)
        .order("created_at", { ascending: false });

      if (user) {
        query = query.eq("patient_id", user.id);
      }

      const { data } = await query;
      if (data) {
        setInvoices(
          data.map((inv: any) => ({
            id: inv.id,
            invoiceNo: inv.invoice_no,
            ticketNomor: inv.queue_tickets?.nomor_tiket,
            unitNama: inv.queue_tickets?.units?.nama || "Pelayanan RSUD",
            tanggal: new Date(inv.created_at).toLocaleDateString("id-ID"),
            totalAmount: inv.total_amount,
            status: inv.status,
            paidAt: inv.paid_at,
            metodeBayar: inv.metode_bayar,
            items: (inv.invoice_items || []).map((it: any) => ({
              id: it.id,
              namaItem: it.nama_item,
              qty: it.qty,
              hargaSatuan: it.harga_satuan,
              subtotal: it.qty * it.harga_satuan,
            })),
          }))
        );
      }
      setLoading(false);
    }
    load();
  }, []);

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
