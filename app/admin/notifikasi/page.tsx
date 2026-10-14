import * as React from "react";
import { getNotificationLogs } from "@/lib/services/admin";
import { AdminNotifikasiClient } from "@/components/admin/admin-notifikasi-client";

export default async function AdminNotifikasiPage() {
  const logs = await getNotificationLogs();
  return <AdminNotifikasiClient initialLogs={logs} />;
}
