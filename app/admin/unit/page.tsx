import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLayananList } from "@/lib/services/layanan";
import { AdminUnitClient } from "@/components/admin/admin-unit-client";

export default async function AdminUnitPage() {
  const units = await getLayananList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Master Unit Layanan & Loket
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Kelola Unit Layanan Medis & Loket
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Konfigurasi jam operasional buka/tutup, standar estimasi menit layanan, dan jumlah loket aktif langsung dari database Supabase.
          </p>
        </div>
      </div>

      <AdminUnitClient initialUnits={units} />
    </div>
  );
}
