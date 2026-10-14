"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Menu, CalendarCheck, PhoneCall, LogIn, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { APP_NAME, HOSPITAL_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Beranda" },
  { href: "/layanan", label: "Layanan" },
  { href: "/jadwal-dokter", label: "Jadwal Dokter" },
  { href: "/tentang", label: "Tentang RSUD" },
  { href: "/faq", label: "FAQ" },
  { href: "/kontak", label: "Kontak" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs group-hover:bg-primary/90 transition-colors">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold leading-none tracking-tight text-foreground font-heading">
              {APP_NAME}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {HOSPITAL_NAME}
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-secondary text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild size="sm">
            <Link href="/display/tv-poli-lt2-a8f9" target="_blank" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Display TV Antrean
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/masuk">
              <LogIn className="h-4 w-4" />
              Masuk / Daftar
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Sheet */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Buka Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader className="border-b border-border pb-4 text-left">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <SheetTitle className="text-base font-bold">{APP_NAME}</SheetTitle>
                    <p className="text-xs text-muted-foreground">{HOSPITAL_NAME}</p>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex flex-col gap-1 py-4">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 text-sm rounded-lg font-medium transition-colors",
                        isActive
                          ? "bg-secondary text-primary font-semibold"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground"
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4 flex flex-col gap-2">
                <Button asChild className="w-full justify-center">
                  <Link href="/masuk" onClick={() => setIsOpen(false)}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Masuk Pasien (NIK + OTP)
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-center">
                  <Link href="/display/tv-poli-lt2-a8f9" target="_blank" onClick={() => setIsOpen(false)}>
                    Lihat Layar Display Antrean
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
