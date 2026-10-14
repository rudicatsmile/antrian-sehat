"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Activity, Users, Clock, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUILDINGS } from "@/lib/constants";
import { DUMMY_LAYANAN } from "@/lib/dummy/layanan";

export default function PetugasMonitoringPage() {
  const [selectedBuilding, setSelectedBuilding] = React.useState<string>("all");

  const getLoadIndicator = (waiting: number) => {
    if (waiting >= 25) {
      return {
        label: "Padat (Tinggi)",
        color: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
      };
    }
    if (waiting >= 10) {
      return {
        label: "Sedang",
        color: "bg-amber-50 text-amber-800 border-amber-200",
        dot: "bg-amber-500",
      };
    }
    return {
      label: "Lancar (Normal)",
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dot: "bg-emerald-500",
    };
  };

  const filteredUnits = DUMMY_LAYANAN.filter(
    (u) => selectedBuilding === "all" || u.buildingId === selectedBuilding
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Pusat Komando (Command Center)
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Monitoring Antrean Multi-Gedung RSUD
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pengawasan beban antrean seluruh unit layanan secara menyeluruh di Gedung A, B, dan C.
          </p>
        </div>

        {/* Building Selector Filter */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-lg border border-border">
          <Button
            size="sm"
            variant={selectedBuilding === "all" ? "default" : "ghost"}
            onClick={() => setSelectedBuilding("all")}
            className="text-xs h-8"
          >
            Semua Gedung
          </Button>
          {BUILDINGS.map((b) => (
            <Button
              key={b.id}
              size="sm"
              variant={selectedBuilding === b.id ? "default" : "ghost"}
              onClick={() => setSelectedBuilding(b.id)}
              className="text-xs h-8"
            >
              {b.nama}
            </Button>
          ))}
        </div>
      </div>

      {/* Buildings Floor Map Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BUILDINGS.map((building) => {
          const unitsInBuilding = DUMMY_LAYANAN.filter((u) => u.buildingId === building.id);
          const totalWaiting = unitsInBuilding.reduce((acc, curr) => acc + (curr.totalKuotaHariIni - curr.sisaKuotaHariIni), 0);
          const totalCounters = unitsInBuilding.reduce((acc, curr) => acc + curr.loketAktif, 0);

          return (
            <Card
              key={building.id}
              onClick={() => setSelectedBuilding(building.id)}
              className={`p-5 border cursor-pointer transition-all ${
                selectedBuilding === building.id
                  ? "border-primary ring-1 ring-primary bg-secondary/30"
                  : "border-border hover:bg-surface"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-teal-700 text-white font-bold flex items-center justify-center text-xs">
                    {building.kode}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-foreground">{building.nama}</h3>
                    <p className="text-[11px] text-muted-foreground">{building.deskripsi}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground text-[11px] block">Total Antrean Aktif:</span>
                  <span className="font-mono font-bold text-foreground text-base">{totalWaiting} Pasien</span>
                </div>
                <div className="text-right">
                  <span className="text-muted-foreground text-[11px] block">Loket / Poli Aktif:</span>
                  <span className="font-mono font-bold text-primary text-base">{totalCounters} Loket</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Realtime Unit Load Cards */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-base text-foreground">
          Indikator Beban & Kapasitas per Unit Layanan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => {
            const waitingCount = unit.totalKuotaHariIni - unit.sisaKuotaHariIni;
            const load = getLoadIndicator(waitingCount);

            return (
              <Card key={unit.id} className="border-border hover:shadow-xs transition-shadow">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="font-mono text-[10px] bg-surface">
                      {unit.kode}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] font-semibold gap-1 ${load.color}`}>
                      <span className={`size-1.5 rounded-full ${load.dot}`} />
                      {load.label}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-heading">{unit.nama}</CardTitle>
                  <CardDescription className="text-[11px]">
                    {unit.buildingName.split(" ")[0]} {unit.buildingName.split(" ")[1]} • {unit.lantai}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/60">
                    <div>
                      <span className="text-muted-foreground text-[10px] block">Antrean Sedang Menunggu:</span>
                      <span className="font-mono font-bold text-base text-foreground">
                        {waitingCount} Pasien
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground text-[10px] block">Estimasi Layanan:</span>
                      <span className="font-mono font-bold text-primary text-base">
                        ~{unit.estimasiTungguMenit} Mnt
                      </span>
                    </div>
                  </div>

                  <Button asChild size="sm" variant="outline" className="w-full text-xs h-8">
                    <Link href={`/petugas/panel/${unit.slug}`}>
                      Buka Panel Pemanggilan →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
