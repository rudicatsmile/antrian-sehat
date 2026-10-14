import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getDokterList } from "@/lib/services/dokter";
import { AdminDokterClient } from "@/components/admin/admin-dokter-client";

export default async function AdminDokterPage() {
  const doctors = await getDokterList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Tenaga Medis Spesialis
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Kelola Master Dokter Spesialis
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Data profil dokter spesialis, penugasan poliklinik, dan jadwal sesi praktik langsung dari database Supabase.
          </p>
        </div>
      </div>

      <AdminDokterClient initialDoctors={doctors} />
    </div>
  );
}
