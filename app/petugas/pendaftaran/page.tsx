import * as React from "react";
import Link from "next/link";
import { UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStaffPatients } from "@/lib/services/petugas";
import { PetugasPendaftaranClient } from "@/components/petugas/pendaftaran-client";

export default async function PetugasPendaftaranPage() {
  const patients = await getStaffPatients();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Loket Pendaftaran & Admisi
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Pelayanan Pendaftaran Pasien (Loket)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pendaftaran pasien baru, penerbitan RM digital untuk pasien lama, pembaruan data, dan pencetakan tiket dari database Supabase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/petugas/pendaftaran/pasien-baru">
              <UserPlus className="h-4 w-4" />
              + Form Pasien Baru
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/petugas/pendaftaran/pasien-lama">
              <Search className="h-4 w-4" />
              Cari Pasien Lama
            </Link>
          </Button>
        </div>
      </div>

      <PetugasPendaftaranClient initialPatients={patients} />
    </div>
  );
}
