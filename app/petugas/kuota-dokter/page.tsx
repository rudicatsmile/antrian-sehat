import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getDokterList } from "@/lib/services/dokter";
import { KuotaDokterClient } from "@/components/petugas/kuota-dokter-client";

export default async function PetugasKuotaDokterPage() {
  const doctors = await getDokterList();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Kapasitas Pelayanan
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Pengaturan Kuota Dokter per Sesi
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Kelola alokasi maksimal pasien per sesi dokter langsung dari database Supabase PostgreSQL.
          </p>
        </div>
      </div>

      <KuotaDokterClient initialDoctors={doctors} />
    </div>
  );
}
