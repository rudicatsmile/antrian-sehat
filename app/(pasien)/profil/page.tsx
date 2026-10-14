import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getCurrentPatientProfile } from "@/lib/services/pasien";
import { ProfilForm } from "@/components/pasien/profil-form";

export default async function ProfilPasienPage() {
  const profile = await getCurrentPatientProfile();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-1 pb-2 border-b border-border/80">
        <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
          Data Pribadi
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
          Profil Pasien & Dokumen Prioritas
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Kelola data kependudukan, alamat domisili, nomor kontak WhatsApp, dan dokumen verifikasi jalur prioritas yang terdaftar di database Supabase.
        </p>
      </div>

      <ProfilForm initialProfile={profile} />
    </div>
  );
}
