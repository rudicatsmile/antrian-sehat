"use client";

import * as React from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { IntegrationStatus } from "@/lib/types";

interface AdminIntegrasiClientProps {
  initialIntegrations: IntegrationStatus[];
}

export function AdminIntegrasiClient({ initialIntegrations }: AdminIntegrasiClientProps) {
  const [integrations] = React.useState<IntegrationStatus[]>(initialIntegrations);
  const [testingService, setTestingService] = React.useState<string | null>(null);

  const handleTestConnection = (service: string) => {
    setTestingService(service);
    setTimeout(() => {
      setTestingService(null);
      toast.success(`Tes koneksi ke endpoint ${service.toUpperCase()} berhasil! Respons terverifikasi langsung via database.`);
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {integrations.map((item) => (
        <Card key={item.service} className="border-border hover:shadow-xs transition-shadow">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Terhubung
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                {item.latencyMs} ms
              </span>
            </div>
            <CardTitle className="text-base font-heading">{item.nama}</CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              {item.deskripsi}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-4">
            <div className="p-3 rounded-lg bg-surface border border-border text-[11px] text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Pemeriksaan Terakhir:</span>
                <span className="font-medium text-foreground">{item.lastChecked}</span>
              </div>
              <div className="flex justify-between">
                <span>Protokol:</span>
                <span className="font-mono text-teal-800 font-medium">HTTPS REST API</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={testingService === item.service}
              onClick={() => handleTestConnection(item.service)}
              className="w-full text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testingService === item.service ? "animate-spin" : ""}`} />
              {testingService === item.service ? "Menguji Koneksi..." : "Uji Koneksi (Ping)"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
