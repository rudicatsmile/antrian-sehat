"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserCheck,
  AlertTriangle,
  PlayCircle,
  CalendarDays,
  Pill,
  Coins,
  Bed,
  Tv,
  Building2,
  Activity,
  LogOut,
  Radio,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, HOSPITAL_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STAFF_NAV = [
  { href: "/petugas/dashboard", label: "Dasbor Petugas", icon: LayoutDashboard },
  { href: "/petugas/pendaftaran", label: "Loket Pendaftaran", icon: UserCheck },
  { href: "/petugas/triase", label: "Panel Triase IGD", icon: AlertTriangle, badge: "Prioritas" },
  { href: "/petugas/panel/poliklinik-penyakit-dalam", label: "Panel Panggil Poli", icon: PlayCircle },
  { href: "/petugas/kuota-dokter", label: "Atur Kuota Dokter", icon: CalendarDays },
  { href: "/petugas/farmasi", label: "Antrean Farmasi", icon: Pill },
  { href: "/petugas/kasir", label: "Kasir & Kwitansi", icon: Coins },
  { href: "/petugas/rawat-inap", label: "Antrean Rawat Inap", icon: Bed },
  { href: "/petugas/display", label: "Manajemen TV", icon: Tv },
  { href: "/petugas/monitoring", label: "Monitor Multi-Gedung", icon: Building2 },
];

export function StaffSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card shrink-0 min-h-screen">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-white shadow-xs">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <span className="font-heading font-bold text-base block leading-none">{APP_NAME}</span>
          <span className="text-[11px] text-teal-700 font-semibold">Portal Petugas Medis</span>
        </div>
      </div>

      {/* Staff Profile Bar */}
      <div className="p-3.5 mx-3 my-3 rounded-xl bg-teal-50/60 border border-teal-100">
        <div className="flex items-center gap-2.5 mb-1.5">
          <div className="h-8 w-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
            MA
          </div>
          <div className="overflow-hidden">
            <h4 className="font-heading font-semibold text-xs truncate text-teal-950">
              Ns. Maya Astuti, S.Kep
            </h4>
            <p className="text-[11px] text-teal-700 truncate">
              Koordinator Loket & Rawat Jalan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
          <Radio className="h-3 w-3 animate-pulse text-emerald-600" />
          <span>Realtime Server Terhubung</span>
        </div>
      </div>

      {/* Staff Nav items */}
      <nav className="flex-1 space-y-0.5 px-3 py-1 overflow-y-auto">
        {STAFF_NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/petugas/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-secondary text-primary font-semibold shadow-2xs"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.2 bg-red-100 text-red-700 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-1">
        <Button variant="ghost" asChild className="w-full justify-start text-xs text-muted-foreground">
          <Link href="/admin/dashboard">
            Ke Portal Admin RS →
          </Link>
        </Button>
        <Button variant="outline" asChild className="w-full justify-start text-xs text-muted-foreground hover:text-destructive">
          <Link href="/">
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Keluar Sistem
          </Link>
        </Button>
      </div>
    </aside>
  );
}

export function StaffMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <Link href="/petugas/dashboard" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <span className="font-heading font-bold text-sm block leading-none">{APP_NAME}</span>
          <span className="text-[10px] text-teal-700">Portal Petugas</span>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </span>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Menu Petugas</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <SheetHeader className="border-b border-border pb-3 text-left">
              <SheetTitle className="text-sm font-bold">Menu Operasional Petugas</SheetTitle>
              <p className="text-xs text-muted-foreground">Ns. Maya Astuti, S.Kep</p>
            </SheetHeader>
            <nav className="flex flex-col gap-1 py-3 overflow-y-auto max-h-[75vh]">
              {STAFF_NAV.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/petugas/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors",
                      isActive
                        ? "bg-secondary text-primary font-semibold"
                        : "text-muted-foreground hover:bg-surface hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
