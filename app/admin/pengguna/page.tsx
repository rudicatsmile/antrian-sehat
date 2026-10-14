"use client";

import * as React from "react";
import { Users, UserPlus, Edit, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_USERS_MANAGEMENT, UserManagementRecord } from "@/lib/dummy/admin";

export default function AdminPenggunaPage() {
  const [users, setUsers] = React.useState<UserManagementRecord[]>(DUMMY_USERS_MANAGEMENT);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Hak Akses & Pengguna
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Kelola Pengguna & Peran Sistem
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Daftar akun admin, perawat, koordinator poli, dan penugasan unit petugas (`staff_assignments`).
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => toast.info("Membuka modal pendaftaran akun petugas baru.")}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          + Tambah Akun Petugas
        </Button>
      </div>

      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="p-4">Nama Petugas / User</th>
                  <th className="p-4">Email Akun</th>
                  <th className="p-4">Nomor WhatsApp</th>
                  <th className="p-4">Peran (Role)</th>
                  <th className="p-4">Penugasan Unit Layanan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Login Terakhir</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface/50">
                    <td className="p-4 font-heading font-semibold text-foreground">
                      {u.nama}
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">{u.email}</td>
                    <td className="p-4 font-mono text-muted-foreground">{u.noWhatsapp}</td>
                    <td className="p-4">
                      <Badge
                        className={
                          u.role === "admin"
                            ? "bg-slate-900 text-teal-400"
                            : "bg-teal-50 text-teal-800 border-teal-200"
                        }
                      >
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {u.assignedUnits.map((unit) => (
                          <span
                            key={unit}
                            className="text-[10px] bg-surface px-2 py-0.5 rounded border border-border"
                          >
                            {unit}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                        {u.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground text-[11px]">{u.lastLogin}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] h-7"
                        onClick={() => toast.info(`Mengubah hak akses ${u.nama}`)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit Akses
                      </Button>
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
