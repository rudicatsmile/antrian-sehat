"use client";

import * as React from "react";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserManagementRecord } from "@/lib/types";

interface AdminPenggunaClientProps {
  initialUsers: UserManagementRecord[];
}

export function AdminPenggunaClient({ initialUsers }: AdminPenggunaClientProps) {
  const [users] = React.useState<UserManagementRecord[]>(initialUsers);

  return (
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    Belum ada data staf/pengguna terdaftar di database Supabase.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
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
                        {u.assignedUnits.length > 0 ? (
                          u.assignedUnits.map((unit) => (
                            <span
                              key={unit}
                              className="text-[10px] bg-surface px-2 py-0.5 rounded border border-border"
                            >
                              {unit}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-[10px]">-</span>
                        )}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
