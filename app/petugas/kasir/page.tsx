import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getPatientInvoices } from "@/lib/services/pasien";
import { PetugasKasirClient } from "@/components/petugas/kasir-client";

export default async function PetugasKasirPage() {
  const invoices = await getPatientInvoices();

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
            Pencatatan pembayaran tunai loket, monitoring status online Midtrans, dan cetak kuitansi resmi dari database Supabase.
          </p>
        </div>
      </div>

      <PetugasKasirClient initialInvoices={invoices} />
    </div>
  );
}
