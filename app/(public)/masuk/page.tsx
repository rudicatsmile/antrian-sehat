"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Activity, ShieldCheck, ArrowRight, MessageSquare, KeyRound, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_NAME, HOSPITAL_NAME } from "@/lib/constants";

export default function MasukPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<"input" | "otp">("input");
  const [nik, setNik] = React.useState("");
  const [noWhatsapp, setNoWhatsapp] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [timer, setTimer] = React.useState(60);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      toast.error("NIK harus terdiri dari tepat 16 digit angka kependudukan.");
      return;
    }

    if (!noWhatsapp.startsWith("08") && !noWhatsapp.startsWith("62")) {
      toast.error("Nomor WhatsApp harus diawali dengan 08 atau 62.");
      return;
    }

    setLoading(true);
    try {
      const { signInWithOtp } = await import("@/app/actions/auth");
      const res = await signInWithOtp({ nik, phone: noWhatsapp });
      if (res.success) {
        setStep("otp");
        setTimer(60);
        toast.success(res.message || "Kode OTP 6 digit telah dikirimkan ke WhatsApp Anda.");
      } else {
        toast.error(res.error || "Gagal mengirimkan OTP.");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Kode OTP harus terdiri dari 6 digit.");
      return;
    }

    setLoading(true);
    try {
      const { verifyOtp } = await import("@/app/actions/auth");
      const res = await verifyOtp({
        phone: noWhatsapp,
        token: otp,
        nik,
      });

      if (res.success) {
        toast.success("Verifikasi berhasil! Selamat datang di Antrean Sehat.");
        router.push(res.redirectUrl || "/dashboard");
      } else {
        toast.error(res.error || "Kode OTP tidak valid.");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan verifikasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      const { signInWithOtp } = await import("@/app/actions/auth");
      const res = await signInWithOtp({ nik, phone: noWhatsapp });
      if (res.success) {
        setTimer(60);
        toast.success("Kode OTP baru telah dikirimkan ke nomor WhatsApp Anda.");
      } else {
        toast.error(res.error || "Gagal mengirim ulang OTP.");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim ulang OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-14rem)] max-w-lg items-center justify-center px-4 py-12">
      <Card className="w-full border-border shadow-lg">
        <CardHeader className="text-center p-6 pb-4">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
            <Activity className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold font-heading">
            {step === "input" ? "Masuk ke Antrean Sehat" : "Verifikasi OTP WhatsApp"}
          </CardTitle>
          <CardDescription className="text-xs">
            {step === "input"
              ? "Masukkan NIK dan nomor WhatsApp Anda untuk masuk tanpa password."
              : `Masukkan 6 digit kode OTP yang telah dikirim ke nomor WhatsApp ${noWhatsapp}.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {step === "input" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nik" className="text-xs">Nomor Induk Kependudukan (NIK 16 Digit) *</Label>
                <Input
                  id="nik"
                  maxLength={16}
                  placeholder="3271xxxxxxxxxxxx"
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ""))}
                  required
                />
                <span className="text-[11px] text-muted-foreground block">
                  Data NIK digunakan untuk pencocokan rekam medis digital.
                </span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="noWa" className="text-xs">Nomor WhatsApp Aktif *</Label>
                <div className="relative">
                  <Input
                    id="noWa"
                    placeholder="Contoh: 081298765432"
                    value={noWhatsapp}
                    onChange={(e) => setNoWhatsapp(e.target.value.replace(/\D/g, ""))}
                    required
                  />
                  <MessageSquare className="absolute right-3 top-3 h-4 w-4 text-emerald-600" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>
                  Otentikasi aman berbasis OTP WhatsApp terhubung langsung ke layanan Supabase Auth & PostgreSQL.
                </span>
              </div>

              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading ? "Mengirim OTP..." : "Kirim Kode OTP WhatsApp"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-xs">Kode Verifikasi 6 Digit *</Label>
                <Input
                  id="otp"
                  maxLength={6}
                  placeholder="123456"
                  className="text-center font-mono text-2xl tracking-widest font-bold h-12"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  required
                />
                <span className="text-[11px] text-muted-foreground text-center block">
                  Gunakan kode simulasi: <strong className="text-foreground">123456</strong>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Belum menerima pesan?</span>
                {timer > 0 ? (
                  <span className="font-mono text-primary font-medium">Kirim ulang ({timer}s)</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Kirim Ulang OTP
                  </button>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <Button type="submit" disabled={loading} className="w-full gap-2">
                  {loading ? "Memverifikasi..." : "Verifikasi & Buka Dasbor"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("input")}
                  className="w-full text-xs text-muted-foreground"
                >
                  Ubah Nomor WhatsApp / NIK
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0 border-t border-border mt-4 flex flex-col gap-2 text-center text-xs text-muted-foreground">
          <p>
            Belum pernah mendaftar di {HOSPITAL_NAME}?{" "}
            <Link href="/daftar" className="text-primary font-semibold hover:underline">
              Daftar Pasien Baru
            </Link>
          </p>
          <div className="pt-2">
            <Link href="/petugas/dashboard" className="text-[11px] text-teal-800 hover:underline">
              Masuk sebagai Petugas Medis / Loket →
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
