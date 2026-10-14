import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getRooms, getInpatientRequests } from "@/lib/services/petugas";
import { RawatInapClient } from "@/components/petugas/rawat-inap-client";

export default async function PetugasRawatInapPage() {
  const [rooms, requests] = await Promise.all([
    getRooms(),
    getInpatientRequests(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Admisi Rawat Inap (Gedung B)
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Ketersediaan Kamar & Waiting List Rawat Inap
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitoring kapasitas bed per kelas kamar, penempatan pasien, dan persiapan antrean pre-operasi langsung dari database Supabase.
          </p>
        </div>
      </div>

      <RawatInapClient initialRooms={rooms} initialRequests={requests} />
    </div>
  );
}
