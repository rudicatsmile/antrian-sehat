"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Building, Clock, Users, ArrowRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { UnitLayanan } from "@/lib/types";
import { BUILDINGS } from "@/lib/constants";

export default function LayananPage() {
  const [units, setUnits] = React.useState<UnitLayanan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedBuilding, setSelectedBuilding] = React.useState<string>("all");

  React.useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("units")
        .select("*, buildings(*)")
        .eq("is_active", true)
        .order("kode", { ascending: true });

      if (data) {
        setUnits(
          data.map((u: any) => ({
            id: u.id,
            kode: u.kode,
            nama: u.nama,
            slug: u.slug,
            buildingId: u.building_id,
            buildingName: u.buildings?.nama ? `${u.buildings.nama} (${u.buildings.kode})` : "Gedung Utama",
            lantai: u.lantai || "Lantai 1",
            kind: u.kind,
            deskripsi: `Layanan pemeriksaan dan perawatan ${u.nama} RSUD Sejahtera Sehat.`,
            jamBuka: u.jam_buka ? u.jam_buka.slice(0, 5) : "08:00",
            jamTutup: u.jam_tutup ? u.jam_tutup.slice(0, 5) : "15:00",
            defaultServiceMinutes: u.default_service_minutes || 10,
            persyaratan: ["KTP asli / Kartu Keluarga", "Nomor WhatsApp aktif"],
            estimasiTungguMenit: u.default_service_minutes || 10,
            sisaKuotaHariIni: 75,
            totalKuotaHariIni: 100,
            loketAktif: 2,
            isActive: u.is_active,
          }))
        );
      }
      setLoading(false);
    }
    load();
  }, []);

  const filteredUnits = units.filter((unit) => {
    const matchSearch =
      unit.nama.toLowerCase().includes(search.toLowerCase()) ||
      unit.kode.toLowerCase().includes(search.toLowerCase()) ||
      unit.deskripsi.toLowerCase().includes(search.toLowerCase());
    const matchBuilding =
      selectedBuilding === "all" || unit.buildingId === selectedBuilding;
    return matchSearch && matchBuilding;
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-8">
      {/* Page Header */}
      <div className="max-w-2xl space-y-2">
        <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
          Katalog Unit Layanan
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading">
          Daftar Seluruh Unit Layanan RSUD
        </h1>
        <p className="text-sm text-muted-foreground">
          Pilih unit layanan medis yang Anda butuhkan untuk melihat persyaratan dokumen dan langsung melakukan booking antrean.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface p-4 rounded-xl border border-border">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari poli, lab, radiologi, atau kode..."
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Building Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <Button
            size="sm"
            variant={selectedBuilding === "all" ? "default" : "outline"}
            onClick={() => setSelectedBuilding("all")}
            className="text-xs h-8"
          >
            Semua Gedung
          </Button>
          {BUILDINGS.map((b) => (
            <Button
              key={b.id}
              size="sm"
              variant={selectedBuilding === b.id ? "default" : "outline"}
              onClick={() => setSelectedBuilding(b.id)}
              className="text-xs h-8"
            >
              {b.nama}
            </Button>
          ))}
        </div>
      </div>

      {/* Unit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUnits.length > 0 ? (
          filteredUnits.map((unit) => (
            <Card key={unit.id} className="flex flex-col justify-between hover:border-primary/50 transition-all hover:shadow-xs">
              <CardHeader className="p-6 pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="font-mono text-xs bg-surface font-bold text-teal-800">
                    {unit.kode}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    {unit.buildingName.split(" ")[0]} {unit.buildingName.split(" ")[1]} • {unit.lantai}
                  </span>
                </div>
                <CardTitle className="text-lg font-heading">
                  <Link href={`/layanan/${unit.slug}`} className="hover:text-primary transition-colors">
                    {unit.nama}
                  </Link>
                </CardTitle>
                <CardDescription className="text-xs line-clamp-3 mt-2 leading-relaxed">
                  {unit.deskripsi}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-border/60">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{unit.jamBuka} - {unit.jamTutup}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground justify-end">
                    <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>~{unit.estimasiTungguMenit} menit tunggu</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="flex-1 text-xs">
                    <Link href={`/booking/${unit.kind === "poliklinik" ? "poliklinik" : unit.kind}`}>
                      Booking Layanan
                    </Link>
                  </Button>
                  <Button variant="outline" asChild size="sm" className="text-xs">
                    <Link href={`/layanan/${unit.slug}`}>
                      Syarat
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground space-y-2">
            <p className="text-base font-semibold">Tidak ada unit layanan yang sesuai dengan pencarian Anda.</p>
            <p className="text-xs">Coba kata kunci lain atau pilih filter &quot;Semua Gedung&quot;.</p>
          </div>
        )}
      </div>
    </div>
  );
}
