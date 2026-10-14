import * as React from "react";
import { getTriageTickets } from "@/lib/services/petugas";
import { TriaseIGDClient } from "@/components/petugas/triase-client";

export default async function TriaseIGDPage() {
  const tickets = await getTriageTickets();
  return <TriaseIGDClient initialTickets={tickets} />;
}
