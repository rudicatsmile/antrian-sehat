"use client";

import * as React from "react";
import Link from "next/link";
import { Stethoscope, Calendar, Clock, Search, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DUMMY_DOKTER, Doctor } from "@/lib/dummy/dokter";

export default function JadwalDokterPage() {
  const [search, setSearch] = React.useState("");
  const [selectedDay, setSelectedDay] = React.useState<string>("all");

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const filteredDoctors = DUMMY_DOKTER.filter((doc) => {
    const matchSearch =
      doc.nama.toLowerCase().includes(search.toLowerCase()) ||
      doc.spesialisasi.toLowerCase().includes(search.toLowerCase()) ||
      doc.unitNama.toLowerCase().includes(search.toLowerCase());
    const matchDay =
      selectedDay === "all" || doc.jadwalHari.includes(selectedDay);
    return matchSearch && matchDay;
  });

  const getQuotaBadge = (terpakai: number, kuota: number) => {
    const sisa = kuota - terpakai;
    const ratio = terpakai / kuota;
    if (sisa <= 0) {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[11px] font-semibold">
          Penuh (0 Sisa)
        </Badge>
      );
    }
    if (ratio >= 0.8) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[11px] font-semibold">
          Hampir Penuh ({sisa} Sisa)
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] font-semibold">
        Tersedia ({sisa} Sisa)
      </Badge>
    );
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 space-y-8">
      {/* Header */}
      <div className="max-w-2xl space-y-2">
        <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
          Jadwal Praktik Dokter
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-heading">
          Jadwal & Kuota Dokter Poliklinik
        </h1>
        <p className="text-sm text-muted-foreground">
          Informasi real-time ketersediaan jadwal dokter spesialis dan kapasitas sisa kuota konsultasi setiap sesi.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-surface p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari dokter, spesialisasi, atau poli..."
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <Button
            size="sm"
            variant={selectedDay === "all" ? "default" : "outline"}
            onClick={() => setSelectedDay("all")}
            className="text-xs h-8"
          >
            Semua Hari
          </Button>
          {days.map((d) => (
            <Button
              key={d}
              size="sm"
              variant={selectedDay === d ? "default" : "outline"}
              onClick={() => setSelectedDay(d)}
              className="text-xs h-8"
            >
              {d}
            </Button>
          ))}
        </div>
      </div>

      {/* Table Schedule View */}
      <Card className="border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Dokter Spesialis</TableHead>
              <TableHead>Poliklinik & Ruangan</TableHead>
              <TableHead>Hari Praktik</TableHead>
              <TableHead>Sesi & Jam</TableHead>
              <TableHead>Kapasitas Kuota</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-surface/60">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {doc.nama.replace("dr. ", "").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{doc.nama}</div>
                        <div className="text-xs text-primary font-medium">{doc.gelar}</div>
                        <div className="text-xs text-muted-foreground">{doc.spesialisasi}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs font-medium text-foreground">{doc.unitNama}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{doc.ruangPraktek}</div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {doc.jadwalHari.map((h) => (
                        <span
                          key={h}
                          className="px-2 py-0.5 rounded-md bg-secondary text-primary text-[10px] font-semibold"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {doc.sessions.map((ses) => (
                        <div key={ses.id} className="text-xs flex items-center gap-1.5 font-mono">
                          <span className="capitalize font-semibold text-foreground">Sesi {ses.sesi}:</span>
                          <span className="text-muted-foreground">{ses.jamMulai} - {ses.jamSelesai}</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {doc.sessions.map((ses) => (
                        <div key={ses.id}>
                          {getQuotaBadge(ses.terpakai, ses.kuota)}
                        </div>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button asChild size="sm" className="text-xs">
                      <Link href={`/booking/poliklinik?doc=${doc.id}`}>
                        Booking
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Tidak ditemukan jadwal dokter yang sesuai dengan kriteria filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
