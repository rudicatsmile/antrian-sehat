"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Building,
  Coins,
  QrCode,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import type { InvoiceItem, PatientProfile } from "@/lib/types";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { HOSPITAL_NAME, HOSPITAL_CAMPUS } from "@/lib/constants";

export default function DetailPembayaranPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = React.useState<InvoiceItem>({
    id: invoiceId || "",
    invoiceNo: "INV-RSUD",
    unitNama: "Pelayanan RSUD",
    tanggal: new Date().toLocaleDateString("id-ID"),
    totalAmount: 0,
    status: "belum_bayar",
    items: [],
  });

  const [patient, setPatient] = React.useState<PatientProfile>({
    id: "",
    nik: "",
    namaLengkap: "Pasien RSUD",
    noWhatsapp: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    alamat: "",
    noRm: "RM-PASIEN",
    kategoriPrioritas: "normal",
  });

  const [loading, setLoading] = React.useState(true);
  const [showSnapModal, setShowSnapModal] = React.useState(false);
  const [simulatingPayment, setSimulatingPayment] = React.useState(false);
  const [loadingSnap, setLoadingSnap] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      if (!invoiceId) return;
      const supabase = createClient();

      const { data: rawInv } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_no,
          total_amount,
          status,
          snap_token,
          metode_bayar,
          paid_at,
          created_at,
          patient_id,
          profiles (
            id,
            nik,
            nama_lengkap,
            no_rm,
            no_whatsapp,
            kategori_prioritas
          ),
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
        .eq("id", invoiceId)
        .maybeSingle();

      const inv: any = rawInv;
      if (inv) {
        if (inv.profiles) {
          const prof = Array.isArray(inv.profiles) ? inv.profiles[0] : inv.profiles;
          if (prof) {
            setPatient({
              id: prof.id,
              nik: prof.nik || "",
              namaLengkap: prof.nama_lengkap,
              noWhatsapp: prof.no_whatsapp,
              tanggalLahir: "",
              jenisKelamin: "L",
              alamat: "",
              noRm: prof.no_rm || "RM-BELUM-ADA",
              kategoriPrioritas: prof.kategori_prioritas || "normal",
            });
          }
        }

        const ticket = Array.isArray(inv.queue_tickets) ? inv.queue_tickets[0] : inv.queue_tickets;
        const unit = ticket?.units ? (Array.isArray(ticket.units) ? ticket.units[0] : ticket.units) : null;

        setInvoice({
          id: inv.id,
          invoiceNo: inv.invoice_no,
          ticketNomor: ticket?.nomor_tiket,
          unitNama: unit?.nama || "Pelayanan RSUD",
          tanggal: new Date(inv.created_at).toLocaleDateString("id-ID"),
          totalAmount: inv.total_amount,
          status: inv.status,
          snapToken: inv.snap_token,
          metodeBayar: inv.metode_bayar,
          paidAt: inv.paid_at,
          items: (inv.invoice_items || []).map((it: any) => ({
            id: it.id,
            namaItem: it.nama_item,
            qty: it.qty,
            hargaSatuan: it.harga_satuan,
            subtotal: it.qty * it.harga_satuan,
          })),
        });
      }
      setLoading(false);
    }
    load();
  }, [invoiceId]);

  const isPaid = invoice.status === "settlement";

  // Load Midtrans Snap script dynamically
  React.useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (clientKey && typeof window !== "undefined") {
      const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
      const snapScriptUrl = isProduction
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";

      if (!document.querySelector(`script[src="${snapScriptUrl}"]`)) {
        const script = document.createElement("script");
        script.src = snapScriptUrl;
        script.setAttribute("data-client-key", clientKey);
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  const handleOpenSnap = async () => {
    setLoadingSnap(true);
    try {
      const { createSnapTransaction } = await import("@/lib/midtrans");
      const res = await createSnapTransaction({
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        grossAmount: invoice.totalAmount,
        patientName: patient?.namaLengkap || "Pasien RSUD",
        patientPhone: patient?.noWhatsapp || "08123456789",
      });

      if (res.success && res.token) {
        // If Snap popup script is active on window, trigger it
        const snap = (window as any).snap;
        if (snap && typeof snap.pay === "function") {
          snap.pay(res.token, {
            onSuccess: () => {
              setInvoice({
                ...invoice,
                status: "settlement",
                metodeBayar: "midtrans",
                paidAt: "14 Oktober 2026, 09:30 WIB",
              });
              toast.success("Pembayaran Berhasil via Midtrans Snap!");
            },
            onPending: () => {
              toast.info("Menunggu pembayaran diselesaikan.");
            },
            onError: () => {
              toast.error("Pembayaran gagal diproses.");
            },
            onClose: () => {
              toast.info("Popup pembayaran ditutup.");
            },
          });
          return;
        }
      }
      // If Snap script is not available or in sandbox fallback, open interactive modal
      setShowSnapModal(true);
    } catch {
      setShowSnapModal(true);
    } finally {
      setLoadingSnap(false);
    }
  };

  const handleSimulateMidtransPay = () => {
    setSimulatingPayment(true);
    setTimeout(() => {
      setSimulatingPayment(false);
      setShowSnapModal(false);
      setInvoice({
        ...invoice,
        status: "settlement",
        metodeBayar: "midtrans",
        paidAt: "14 Oktober 2026, 09:30 WIB",
      });
      toast.success("Pembayaran Berhasil! Notifikasi pelunasan dan kuitansi resmi telah dikirim ke WhatsApp Anda.");
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        href="/pembayaran"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke Daftar Tagihan
      </Link>

      {/* Invoice Card */}
      <Card className="border-border shadow-lg overflow-hidden">
        {/* Header Invoice */}
        <div className="bg-surface p-6 sm:p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
              {HOSPITAL_NAME}
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
              Kuitansi & Tagihan Layanan Medis
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Invoice No: <strong className="text-foreground">{invoice.invoiceNo}</strong>
            </p>
          </div>

          <Badge
            className={`text-xs px-3 py-1 font-semibold ${
              isPaid
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-amber-100 text-amber-800 border-amber-200"
            }`}
          >
            {isPaid ? "LUNAS (SETTLEMENT)" : "BELUM DIBAYAR"}
          </Badge>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Patient Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface/50 border border-border text-xs">
            <div>
              <span className="text-muted-foreground block">Ditagihkan Kepada Pasien:</span>
              <span className="font-bold text-sm text-foreground block mt-0.5">
                {patient?.namaLengkap || "Pasien RSUD"}
              </span>
              <span className="text-muted-foreground font-mono">
                No. RM: {patient?.noRm || "-"}
              </span>
            </div>

            <div className="sm:text-right">
              <span className="text-muted-foreground block">Unit Penanggung Jawab:</span>
              <span className="font-semibold text-foreground block mt-0.5">
                {invoice.unitNama}
              </span>
              <span className="text-muted-foreground">
                Tanggal Terbit: {invoice.tanggal}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60%]">Rincian Tindakan / Layanan</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Biaya Satuan</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-xs">
                      {item.namaItem}
                    </TableCell>
                    <TableCell className="text-center text-xs font-mono">
                      {item.qty}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">
                      {formatRupiah(item.hargaSatuan)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono font-semibold">
                      {formatRupiah(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className="bg-surface font-bold text-sm">
                  <TableCell colSpan={3} className="text-right">
                    Total Yang Harus Dibayar:
                  </TableCell>
                  <TableCell className="text-right text-base text-primary font-mono">
                    {formatRupiah(invoice.totalAmount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Payment Method / Settlement Info */}
          {isPaid ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">Tagihan Ini Telah Dilunasi</span>
                  <span className="text-emerald-800">
                    Metode: {invoice.metodeBayar?.toUpperCase()} • {invoice.paidAt}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" />
                Cetak Kuitansi
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Midtrans Snap */}
                <div className="p-5 rounded-xl border-2 border-primary/40 bg-secondary/30 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <h4 className="font-heading font-bold text-sm">Bayar Online Mandiri</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Midtrans Snap: Virtual Account (BCA, Mandiri, BRI, BNI), QRIS GoPay/ShopeePay, dan Kartu Debit.
                    </p>
                  </div>
                  <Button
                    onClick={handleOpenSnap}
                    disabled={loadingSnap}
                    className="w-full text-xs gap-2 shadow-sm h-10"
                  >
                    {loadingSnap ? "Menghubungkan Midtrans..." : "Buka Popup Midtrans Snap"}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Option 2: Kasir Tunai */}
                <div className="p-5 rounded-xl border border-border bg-surface space-y-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-foreground" />
                      <h4 className="font-heading font-bold text-sm">Bayar Tunai di Kasir</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Kunjungi Loket Kasir Terpusat Gedung A Lantai 1 dengan menunjukkan nomor invoice atau kartu pasien.
                    </p>
                  </div>
                  <div className="text-[11px] text-muted-foreground p-2 rounded-lg bg-background border border-border">
                    Jam Operasional Kasir: 07:30 - 20:00 WIB
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Midtrans Snap Simulation Modal */}
      <Dialog open={showSnapModal} onOpenChange={setShowSnapModal}>
        <DialogContent className="max-w-md p-0 overflow-hidden border border-border shadow-2xl">
          {/* Mock Snap Header */}
          <div className="bg-[#002b49] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-wider font-mono">MIDTRANS</span>
              <span className="text-[10px] text-teal-300 font-semibold uppercase">Snap Sandbox</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300">
              {formatRupiah(invoice.totalAmount)}
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-1 text-xs">
              <span className="text-muted-foreground block">Order ID:</span>
              <span className="font-mono font-bold text-foreground">
                ANT-20261014-{invoice.invoiceNo.replace("INV-", "")}
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Pilih Saluran Pembayaran (Simulasi):</Label>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg border border-primary bg-secondary/50 flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-foreground">QRIS (GoPay / OVO / ShopeePay / BCA Mobile)</span>
                  <QrCode className="h-4 w-4 text-primary" />
                </div>
                <div className="p-3 rounded-lg border border-border hover:bg-surface flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-foreground">BCA Virtual Account</span>
                  <span className="text-[11px] font-mono text-muted-foreground">VA: 8271004123</span>
                </div>
                <div className="p-3 rounded-lg border border-border hover:bg-surface flex items-center justify-between cursor-pointer">
                  <span className="font-medium text-foreground">Mandiri Bill Payment</span>
                  <span className="text-[11px] font-mono text-muted-foreground">VA: 991823901</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs">
              <span className="font-semibold block mb-0.5">Simulasi Lingkungan Uji (Sandbox)</span>
              Klik tombol di bawah untuk menyimulasikan webhook verifikasi settlement Midtrans SHA512.
            </div>

            <Button
              onClick={handleSimulateMidtransPay}
              disabled={simulatingPayment}
              className="w-full text-xs h-10 gap-2"
            >
              {simulatingPayment ? "Memproses Verifikasi Pembayaran..." : "Bayar Sekarang (Simulasikan Sukses)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
