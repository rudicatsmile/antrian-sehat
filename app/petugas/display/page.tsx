"use client";

import * as React from "react";
import Link from "next/link";
import { Tv, ExternalLink, Plus, RefreshCw, Key, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DUMMY_DISPLAY_SCREENS, DisplayScreen } from "@/lib/dummy/petugas";

export default function PetugasDisplayPage() {
  const [screens, setScreens] = React.useState<DisplayScreen[]>(DUMMY_DISPLAY_SCREENS);

  const handleModeChange = async (id: string, newMode: "antrean" | "info" | "bergantian") => {
    try {
      const { updateDisplayMode } = await import("@/app/actions/operasional");
      const res = await updateDisplayMode(id, newMode);
      if (res.success) {
        setScreens(
          screens.map((s) => (s.id === id ? { ...s, mode: newMode } : s))
        );
        toast.success(res.message || `Mode tampilan layar TV diubah menjadi: ${newMode.toUpperCase()}`);
      } else {
        toast.error(res.error || "Gagal mengubah mode.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah mode.");
    }
  };

  const handleRevokeToken = async (id: string) => {
    try {
      const { revokeDisplayToken } = await import("@/app/actions/operasional");
      const res = await revokeDisplayToken(id);
      if (res.success) {
        const newToken = res.newToken || `tv-${Math.random().toString(36).substring(2, 8)}`;
        setScreens(
          screens.map((s) => (s.id === id ? { ...s, token: newToken } : s))
        );
        toast.success(res.message || "Token display dicabut dan token akses baru diterbitkan!");
      } else {
        toast.error(res.error || "Gagal mencabut token.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mencabut token.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <Badge variant="outline" className="text-teal-800 bg-teal-50 border-teal-200">
            Perangkat Display & IoT
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading mt-0.5">
            Manajemen Layar Display TV Ruang Tunggu
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Pengaturan token URL akses monitor TV per gedung, mode rotasi pengumuman, dan pemantauan status online.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {screens.map((screen) => (
          <Card key={screen.id} className="border-border hover:shadow-xs transition-shadow">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">
                  Mode: {screen.mode}
                </Badge>
              </div>
              <CardTitle className="text-base font-heading">{screen.nama}</CardTitle>
              <CardDescription className="text-xs">
                {screen.gedungNama} • {screen.unitNama}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              <div className="p-3 rounded-lg bg-surface border border-border text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Token Akses TV:</span>
                  <button
                    onClick={() => handleRevokeToken(screen.id)}
                    className="text-[10px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-2.5 w-2.5" />
                    Reset Token
                  </button>
                </div>
                <div className="font-mono font-bold text-foreground text-xs bg-background p-1.5 rounded border border-border truncate">
                  {screen.token}
                </div>
              </div>

              {/* Mode switch */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground block">
                  Mode Penayangan Layar:
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  {(["antrean", "info", "bergantian"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleModeChange(screen.id, mode)}
                      className={`py-1.5 px-2 rounded-md border text-[11px] capitalize cursor-pointer transition-colors ${
                        screen.mode === mode
                          ? "bg-primary text-white border-primary font-bold shadow-2xs"
                          : "bg-surface border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <Button asChild size="sm" className="w-full text-xs gap-1.5">
                <Link href={`/display/${screen.token}`} target="_blank">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Buka Tampilan Layar Penuh TV
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
