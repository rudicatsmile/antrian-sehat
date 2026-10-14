import * as React from "react";
import { notFound } from "next/navigation";
import { getLayananBySlug } from "@/lib/services/layanan";
import { getUnitQueue } from "@/lib/services/petugas";
import { UnitQueuePanelClient } from "@/components/petugas/unit-queue-panel-client";

interface UnitQueuePanelPageProps {
  params: Promise<{
    unitSlug: string;
  }>;
}

export default async function UnitQueuePanelPage({ params }: UnitQueuePanelPageProps) {
  const { unitSlug } = await params;
  const [unit, queueData] = await Promise.all([
    getLayananBySlug(unitSlug),
    getUnitQueue(unitSlug),
  ]);

  if (!unit) {
    notFound();
  }

  return <UnitQueuePanelClient unit={unit} initialQueue={queueData} />;
}
