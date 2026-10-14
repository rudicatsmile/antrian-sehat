"use client";

import * as React from "react";
import { Coins, Search, Printer, CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_INVOICES, InvoiceItem } from "@/lib/dummy/pasien";
import { formatRupiah } from "@/lib/utils";

export default function PetugasKasirPage() {
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>(DUMMY_INVOICES);
  const [search, setSearch] = React.useState("");

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.unitNama.toLowerCase().includes(search.toLowerCase())
  );

  const handleCashPayment = async (invoiceId: string) => {
    try {
      const { recordCashPayment } = await import("@/app/actions/operasional");
      const res = await recordCashPayment({
        invoiceId,
        cashierStaffId: "kasir-staff-1",
        jumlahBayar: 200000,
      });

      if (res.success) {
        setInvoices(
          invoices.map((inv) =>
            inv.id === invoiceId
              ? {
                  ...inv,
                  status: "settlement",
                  metodeBayar: "tunai",
                  paidAt: "14 Okt 2026, 09:35 WIB (Kasir Loket 1)",
                }
              : inv
          )
        );
        toast.success(res.message || "Pembayaran TUNAI berhasil dicatat di kasir! Kuitansi fisik dapat dicetak.");
      } else {
        toast.error(res.error || "Gagal mencatat pembayaran.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mencatat pembayaran.");
    }
  };

  const handlePrintReceipt = (inv: InvoiceItem) => {
    toast.success(`Mencetak kuitansi resmi untuk tagihan ${inv.invoiceNo}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Kasir Terpusat (Gedung A)
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Manajemen Kasir & Pelunasan Tagihan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pencatatan pembayaran tunai loket, monitoring status online Midtrans, dan cetak kuitansi resmi.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-surface p-3.5 rounded-xl border border-border">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          placeholder="Cari berdasarkan No. Invoice atau Unit Layanan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background text-xs"
        />
      </div>

      {/* Invoices Table */}
      <Card className="border-border">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-heading">
            Daftar Tagihan Pasien
          </CardTitle>
          <CardDescription className="text-xs">
            Kasir hanya dapat memproses pelunasan tunai untuk tagihan yang berstatus &quot;Belum Bayar&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">No. Invoice</th>
                  <th className="p-3">Unit Pelayanan</th>
                  <th className="p-3">Tanggal Terbit</th>
                  <th className="p-3 text-right">Total Tagihan</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi Kasir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((inv) => {
                  const isPaid = inv.status === "settlement";
                  return (
                    <tr key={inv.id} className="hover:bg-surface/50">
                      <td className="p-3 font-mono font-bold text-foreground">{inv.invoiceNo}</td>
                      <td className="p-3 font-medium text-foreground">{inv.unitNama}</td>
                      <td className="p-3 text-muted-foreground">{inv.tanggal}</td>
                      <td className="p-3 text-right font-mono font-bold text-foreground">
                        {formatRupiah(inv.totalAmount)}
                      </td>
                      <td className="p-3">
                        <Badge
                          className={
                            isPaid
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-amber-100 text-amber-800 border-amber-200"
                          }
                        >
                          {isPaid ? "LUNAS" : "BELUM BAYAR"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        {!isPaid && (
                          <Button
                            size="sm"
                            onClick={() => handleCashPayment(inv.id)}
                            className="text-[11px] h-7 bg-teal-700 hover:bg-teal-800 text-white"
                          >
                            <Coins className="h-3 w-3 mr-1" />
                            Catat Tunai
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintReceipt(inv)}
                          className="text-[11px] h-7"
                        >
                          <Printer className="h-3 w-3 mr-1" />
                          Cetak Kwitansi
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
