"use client";

import * as React from "react";
import { Cpu, RefreshCw, CheckCircle2, ShieldCheck, Activity, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_INTEGRATIONS } from "@/lib/dummy/admin";

export default function AdminIntegrasiPage() {
  const [integrations, setIntegrations] = React.useState(DUMMY_INTEGRATIONS);
  const [testingService, setTestingService] = React.useState<string | null>(null);

  const handleTestConnection = (service: string) => {
    setTestingService(service);
    setTimeout(() => {
      setTestingService(null);
      toast.success(`Tes koneksi ke endpoint ${service.toUpperCase()} berhasil! Latensi: 135 ms.`);
    }, 700);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Konektivitas Eksternal
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Status Integrasi Layanan Pihak Ketiga
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitoring kesehatan API WhatsApp Gateway, payment gateway Midtrans, dan Rekam Medis Elektronik (FHIR-lite).
          </p>
        </div>
      </div>

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

      {/* Security Note on Private Keys */}
      <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-950 text-xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Keamanan Kunci Rahasia Server-Side</span>
          <p className="leading-relaxed text-teal-900">
            Sesuai kepatuhan arsitektur, seluruh kunci rahasia (<code className="font-mono font-semibold">MIDTRANS_SERVER_KEY</code>, <code className="font-mono font-semibold">WA_GATEWAY_API_KEY</code>, dan <code className="font-mono font-semibold">SUPABASE_SERVICE_ROLE_KEY</code>) tersimpan aman di variabel lingkungan server Next.js dan tidak pernah diekspos ke browser klien.
          </p>
        </div>
      </div>
    </div>
  );
}
