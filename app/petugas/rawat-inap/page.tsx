"use client";

import * as React from "react";
import { Bed, Users, CheckCircle2, Clock, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_ROOMS, DUMMY_INPATIENT_REQUESTS, InpatientRequest, RoomBed } from "@/lib/dummy/petugas";

export default function PetugasRawatInapPage() {
  const [rooms, setRooms] = React.useState<RoomBed[]>(DUMMY_ROOMS);
  const [requests, setRequests] = React.useState<InpatientRequest[]>(DUMMY_INPATIENT_REQUESTS);

  const handleAssignRoom = async (reqId: string, roomName: string) => {
    try {
      const { assignRoom } = await import("@/app/actions/operasional");
      const res = await assignRoom(reqId, "room-melati-201-id", "staff-admisi-id");
      if (res.success) {
        setRequests(
          requests.map((r) =>
            r.id === reqId ? { ...r, status: "dirawat" } : r
          )
        );
        toast.success(res.message || `Pasien berhasil ditempatkan di kamar ${roomName}!`);
      } else {
        toast.error(res.error || "Gagal menempatkan pasien.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menempatkan pasien.");
    }
  };

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
            Monitoring kapasitas bed per kelas kamar, penempatan pasien, dan persiapan antrean pre-operasi.
          </p>
        </div>
      </div>

      {/* Room Bed Capacity Overview Cards */}
      <div className="space-y-3">
        <h3 className="font-heading font-bold text-sm text-foreground">
          Kapasitas Tempat Tidur per Ruangan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {rooms.map((room) => {
            const sisa = room.kapasitas - room.terisi;
            const isFull = sisa <= 0;
            return (
              <Card key={room.id} className="p-3.5 border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-heading font-bold text-xs text-foreground">
                    {room.namaKamar}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {room.kelas}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Terisi: {room.terisi} / {room.kapasitas}</span>
                    <span className={isFull ? "text-destructive font-bold" : "text-emerald-700 font-semibold"}>
                      {isFull ? "PENUH" : `${sisa} Kosong`}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isFull ? "bg-destructive" : "bg-teal-600"}`}
                      style={{ width: `${(room.terisi / room.kapasitas) * 100}%` }}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Waiting List Requests */}
      <Card className="border-border">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-heading">
            Daftar Permintaan Masuk Rawat Inap (Waiting List)
          </CardTitle>
          <CardDescription className="text-xs">
            Urutan berdasarkan kelas kamar, prioritas kegawatan klinis, dan waktu pengajuan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3">Nama Pasien</th>
                  <th className="p-3">No. RM</th>
                  <th className="p-3">Kelas Diminta</th>
                  <th className="p-3">Indikasi Medis</th>
                  <th className="p-3">Pre-Op</th>
                  <th className="p-3">Prioritas</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi Admisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface/50">
                    <td className="p-3 font-semibold text-foreground">{req.namaPasien}</td>
                    <td className="p-3 font-mono font-bold text-teal-800">{req.noRm}</td>
                    <td className="p-3 font-medium">{req.kelasDiminta}</td>
                    <td className="p-3 max-w-[200px] truncate text-muted-foreground">
                      {req.indikasi}
                    </td>
                    <td className="p-3">
                      {req.isPreOp ? (
                        <Badge className="bg-amber-100 text-amber-900 border-amber-200 text-[10px]">
                          {req.jenisTindakan || "Pre-Operasi"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-3 capitalize">
                      <Badge variant="outline" className="text-[10px]">
                        {req.prioritas}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        className={
                          req.status === "dirawat"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-50 text-amber-800"
                        }
                      >
                        {req.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      {req.status === "menunggu_kamar" ? (
                        <Button
                          size="sm"
                          onClick={() => handleAssignRoom(req.id, "Melati 201")}
                          className="text-[11px] h-7 bg-teal-700 hover:bg-teal-800 text-white"
                        >
                          Tempatkan Kamar
                        </Button>
                      ) : (
                        <span className="text-emerald-700 text-xs font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Terdaftar Kamar
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
