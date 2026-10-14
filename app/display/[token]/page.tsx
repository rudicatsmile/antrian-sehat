import * as React from "react";
import { notFound } from "next/navigation";
import { getDisplayScreenByToken } from "@/lib/services/petugas";
import { DisplayTVMonitorClient } from "@/components/display/tv-monitor-client";

interface DisplayTVMonitorPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function DisplayTVMonitorPage({ params }: DisplayTVMonitorPageProps) {
  const { token } = await params;
  const screenConfig = await getDisplayScreenByToken(token);

  if (!screenConfig) {
    notFound();
  }

  return <DisplayTVMonitorClient screenConfig={screenConfig} token={token} />;
}
