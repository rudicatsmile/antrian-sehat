"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  Layers,
  Stethoscope,
  Users,
  FileSpreadsheet,
  Cpu,
  MessageSquare,
  Activity,
  LogOut,
  ChevronDown,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Statistik Dasbor", icon: LayoutDashboard },
  { href: "/admin/lokasi", label: "Lokasi & Gedung", icon: Building },
  { href: "/admin/unit", label: "Unit & Loket", icon: Layers },
  { href: "/admin/dokter", label: "Master Dokter", icon: Stethoscope },
  { href: "/admin/pengguna", label: "Pengguna & Peran", icon: Users },
  { href: "/admin/laporan", label: "Laporan & Ekspor", icon: FileSpreadsheet },
  { href: "/admin/integrasi", label: "Status Integrasi", icon: Cpu },
  { href: "/admin/notifikasi", label: "Log Notifikasi WA", icon: MessageSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-slate-900 text-slate-100 shrink-0 min-h-screen">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-800 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 text-slate-950 font-bold shadow-xs">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <span className="font-heading font-bold text-base block leading-none text-white">{APP_NAME}</span>
          <span className="text-[11px] text-teal-400 font-medium">Administrator RS</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {ADMIN_NAV.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-teal-500 text-slate-950 font-bold shadow-xs"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4 space-y-1">
        <Button variant="ghost" asChild className="w-full justify-start text-xs text-slate-400 hover:text-white hover:bg-slate-800">
          <Link href="/petugas/dashboard">
            ← Ke Portal Petugas
          </Link>
        </Button>
        <Button variant="ghost" asChild className="w-full justify-start text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300">
          <Link href="/">
            <LogOut className="h-3.5 w-3.5 mr-2" />
            Keluar Administrator
          </Link>
        </Button>
      </div>
    </aside>
  );
}

export function AdminHeader() {
  const [selectedBuilding, setSelectedBuilding] = React.useState("Semua Gedung (Kampus Utama)");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      {/* Mobile menu button */}
      <div className="lg:hidden flex items-center gap-2">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] bg-slate-900 text-white border-slate-800">
            <SheetHeader className="border-b border-slate-800 pb-3 text-left">
              <SheetTitle className="text-white text-base font-bold">Admin Antrean Sehat</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 py-4">
              {ADMIN_NAV.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-xs rounded-lg font-medium transition-colors",
                      isActive ? "bg-teal-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
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
        <span className="font-heading font-bold text-sm">Admin RS</span>
      </div>

      {/* Building Filter Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground hidden sm:inline">Lokasi Operasional:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs h-9 gap-2">
              <Building className="h-3.5 w-3.5 text-primary" />
              <span>{selectedBuilding}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuItem onClick={() => setSelectedBuilding("Semua Gedung (Kampus Utama)")}>
              Semua Gedung (Kampus Utama)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedBuilding("Gedung A - Rawat Jalan & Pendaftaran")}>
              Gedung A - Rawat Jalan & Pendaftaran
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedBuilding("Gedung B - IGD & Rawat Inap")}>
              Gedung B - IGD & Rawat Inap
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedBuilding("Gedung C - Penunjang Medis (Lab/Rad/Far)")}>
              Gedung C - Penunjang Medis (Lab/Rad/Far)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Admin User Profile */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-xs font-semibold text-foreground">Ahmad Zulkarnain, S.Kom</div>
          <div className="text-[11px] text-muted-foreground">Super Administrator RSUD</div>
        </div>
        <div className="h-9 w-9 rounded-full bg-slate-800 text-teal-400 font-bold text-xs flex items-center justify-center border border-slate-700">
          AZ
        </div>
      </div>
    </header>
  );
}
