import * as React from "react";
import { getLayananList } from "@/lib/services/layanan";
import { MonitoringClient } from "@/components/petugas/monitoring-client";

export default async function PetugasMonitoringPage() {
  const units = await getLayananList();
  return <MonitoringClient initialUnits={units} />;
}
