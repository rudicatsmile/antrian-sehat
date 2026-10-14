"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FAQItem {
  kategori: string;
  tanya: string;
  jawab: string;
}

const FAQS: FAQItem[] = [
  {
    kategori: "Pendaftaran & Booking",
    tanya: "Bagaimana cara melakukan booking antrean poliklinik secara online?",
    jawab: "Anda cukup masuk ke halaman Booking, memilih Poliklinik tujuan, dokter spesialis, tanggal kedatangan (H-7 hingga H-0), dan sesi jam praktik. Setelah konfirmasi, sistem akan menerbitkan nomor tiket digital beserta QR Code dan mengirimkan konfirmasi via WhatsApp.",
  },
  {
    kategori: "Pendaftaran & Booking",
    tanya: "Apakah saya harus memiliki akun terlebih dahulu sebelum booking?",
    jawab: "Ya, Anda cukup masuk menggunakan NIK 16 digit dan nomor WhatsApp aktif. Kode OTP 6 digit akan dikirimkan langsung ke nomor WhatsApp Anda untuk verifikasi tanpa perlu mengingat kata sandi rumit.",
  },
  {
    kategori: "Prioritas Pasien",
    tanya: "Siapa saja yang berhak mendapatkan jalur antrean prioritas?",
    jawab: "Jalur prioritas diberikan kepada pasien lanjut usia (usia 60 tahun ke atas), penyandang disabilitas fisik/sensorik, serta ibu hamil. Saat pendaftaran akun atau pembaruan profil, Anda dapat melampirkan foto KTP atau buku KIA untuk verifikasi otomatis oleh petugas.",
  },
  {
    kategori: "Prioritas Pasien",
    tanya: "Bagaimana sistem triase di IGD bekerja?",
    jawab: "Triase IGD tidak menggunakan nomor antrean biasa, melainkan klasifikasi kegawatan medis: Merah (resusitasi/kritis - langsung ditangani), Kuning (gawat segera), dan Hijau (stabil). Pasien kategori merah tidak dapat dilewati dalam kondisi apa pun.",
  },
  {
    kategori: "Pembatalan & Perubahan",
    tanya: "Apakah saya bisa membatalkan atau mengubah jadwal antrean?",
    jawab: "Pembatalan antrean dapat dilakukan mandiri melalui menu 'Antrean Saya' paling lambat 2 jam sebelum jam sesi dokter dimulai. Pembatalan tepat waktu akan membebaskan kuota bagi pasien lain yang membutuhkan.",
  },
  {
    kategori: "Pembayaran & Midtrans",
    tanya: "Metode pembayaran apa saja yang didukung oleh Antrean Sehat?",
    jawab: "Kami menyediakan pembayaran online mandiri melalui Midtrans Snap (Virtual Account BCA/Mandiri/BRI/BNI, QRIS GoPay/ShopeePay, dan Kartu Debit) serta pembayaran langsung secara tunai di Loket Kasir Gedung A Lantai 1.",
  },
  {
    kategori: "Notifikasi & Kedatangan",
    tanya: "Kapan saya harus tiba di rumah sakit?",
    jawab: "Sistem WhatsApp Gateway kami akan mengirimkan pengingat H-1 dan notifikasi langsung saat nomor giliran Anda tersisa 2 antrean lagi. Anda disarankan tiba di rumah sakit 15-20 menit sebelum estimasi giliran Anda untuk melakukan check-in.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = React.useState<string>("Semua");

  const categories = ["Semua", "Pendaftaran & Booking", "Prioritas Pasien", "Pembatalan & Perubahan", "Pembayaran & Midtrans", "Notifikasi & Kedatangan"];

  const filteredFaqs = FAQS.filter(
    (item) => selectedCategory === "Semua" || item.kategori === selectedCategory
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Badge variant="outline" className="text-primary border-teal-200 bg-secondary">
          Bantuan & Tanya Jawab
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
          Pertanyaan yang Sering Diajukan
        </h1>
        <p className="text-sm text-muted-foreground">
          Temukan jawaban cepat seputar tata cara pendaftaran, antrean prioritas, metode pembayaran, dan jadwal layanan.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            size="sm"
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className="text-xs rounded-full h-8 px-4"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <Card
              key={index}
              className={cn(
                "border transition-all cursor-pointer overflow-hidden",
                isOpen ? "border-primary/50 shadow-xs" : "border-border hover:border-border/80"
              )}
              onClick={() => setOpenIndex(isOpen ? null : index)}
            >
              <div className="p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                    {faq.kategori}
                  </span>
                  <h3 className="font-heading font-semibold text-sm sm:text-base text-foreground">
                    {faq.tanya}
                  </h3>
                </div>
                <div
                  className={cn(
                    "h-8 w-8 rounded-full bg-surface flex items-center justify-center shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180 bg-secondary text-primary"
                  )}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>

              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50 mt-1">
                  <p className="pt-3">{faq.jawab}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Contact box */}
      <div className="p-6 rounded-xl bg-surface border border-border text-center space-y-3">
        <p className="text-sm text-muted-foreground">
          Masih memiliki pertanyaan lain yang belum terjawab?
        </p>
        <Button variant="outline" asChild size="sm">
          <Link href="/kontak">
            <MessageSquare className="h-4 w-4 mr-2 text-primary" />
            Hubungi Layanan Informasi & Pengaduan
          </Link>
        </Button>
      </div>
    </div>
  );
}
