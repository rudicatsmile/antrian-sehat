import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { getUsersManagement } from "@/lib/services/admin";
import { AdminPenggunaClient } from "@/components/admin/admin-pengguna-client";

export default async function AdminPenggunaPage() {
  const users = await getUsersManagement();

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
            Daftar akun admin, perawat, koordinator poli, dan penugasan staf langsung dari database Supabase PostgreSQL.
          </p>
        </div>
      </div>

      <AdminPenggunaClient initialUsers={users} />
    </div>
  );
}
