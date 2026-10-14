"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarPlus,
  Ticket,
  CreditCard,
  History,
  User,
  LogOut,
  Activity,
  Menu,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { CURRENT_PATIENT } from "@/lib/dummy/pasien";
import { APP_NAME, HOSPITAL_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const PATIENT_NAV = [
  { href: "/dashboard", label: "Dasbor Pasien", icon: LayoutDashboard },
  { href: "/booking", label: "Booking Layanan", icon: CalendarPlus },
  { href: "/antrean/saya", label: "Antrean Saya", icon: Ticket },
  { href: "/pembayaran", label: "Tagihan & Pembayaran", icon: CreditCard },
  { href: "/riwayat", label: "Riwayat Kunjungan", icon: History },
  { href: "/profil", label: "Profil & Dokumen", icon: User },
];

export function PatientSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <span className="font-heading font-bold text-base block leading-none">{APP_NAME}</span>
          <span className="text-[11px] text-muted-foreground">Portal Pasien</span>
        </div>
      </div>

      {/* Patient Mini Card */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-surface border border-border">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-9 w-9 rounded-full bg-teal-100 text-teal-800 font-bold text-sm flex items-center justify-center border border-teal-200">
            {CURRENT_PATIENT.namaLengkap.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-heading font-semibold text-sm truncate text-foreground">
              {CURRENT_PATIENT.namaLengkap}
            </h4>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              {CURRENT_PATIENT.noRm}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs pt-2 border-t border-border/80">
          <span className="text-muted-foreground text-[11px]">Prioritas:</span>
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 py-0">
            Lansia (68 Thn)
          </Badge>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {PATIENT_NAV.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-secondary text-primary font-semibold shadow-2xs"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Action */}
      <div className="border-t border-border p-4">
        <Button variant="outline" asChild className="w-full justify-start text-xs text-muted-foreground hover:text-destructive">
          <Link href="/">
            <LogOut className="h-4 w-4 mr-2" />
            Keluar ke Beranda
          </Link>
        </Button>
      </div>
    </aside>
  );
}

export function PatientMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Activity className="h-4 w-4" />
        </div>
        <span className="font-heading font-bold text-sm">{APP_NAME}</span>
      </Link>

      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[11px] bg-blue-50 text-blue-700 border-blue-200">
          {CURRENT_PATIENT.namaLengkap.split(" ")[0]}
        </Badge>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Menu Pasien</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <SheetHeader className="border-b border-border pb-3 text-left">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <SheetTitle className="text-sm font-bold">{CURRENT_PATIENT.namaLengkap}</SheetTitle>
                  <p className="text-xs text-muted-foreground font-mono">{CURRENT_PATIENT.noRm}</p>
                </div>
              </div>
            </SheetHeader>
            <nav className="flex flex-col gap-1 py-4">
              {PATIENT_NAV.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium transition-colors",
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
            <div className="border-t border-border pt-4">
              <Button variant="outline" asChild className="w-full justify-center text-xs">
                <Link href="/" onClick={() => setOpen(false)}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar ke Beranda
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
