import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getDisplayScreens } from "@/lib/services/petugas";
import { PetugasDisplayClient } from "@/components/petugas/display-client";

export default async function PetugasDisplayPage() {
  const screens = await getDisplayScreens();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Perangkat Display & IoT
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Manajemen Layar Display TV Ruang Tunggu
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pengaturan token URL akses monitor TV per gedung, mode rotasi pengumuman, dan pemantauan status online dari database Supabase.
          </p>
        </div>
      </div>

      <PetugasDisplayClient initialScreens={screens} />
    </div>
  );
}
