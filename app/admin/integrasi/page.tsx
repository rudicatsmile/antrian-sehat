import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";
import { getIntegrationStatus } from "@/lib/services/admin";
import { AdminIntegrasiClient } from "@/components/admin/admin-integrasi-client";

export default async function AdminIntegrasiPage() {
  const integrations = await getIntegrationStatus();

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
            Monitoring kesehatan API WhatsApp Gateway, payment gateway Midtrans, dan konektivitas Supabase PostgreSQL.
          </p>
        </div>
      </div>

      <AdminIntegrasiClient initialIntegrations={integrations} />

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
