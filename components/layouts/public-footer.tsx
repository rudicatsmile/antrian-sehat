import Link from "next/link";
import { Activity, Phone, Mail, MapPin, ShieldCheck, HeartHandshake } from "lucide-react";
import { APP_NAME, HOSPITAL_NAME, HOSPITAL_CAMPUS } from "@/lib/constants";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-surface text-foreground mt-auto">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Profil */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="h-5 w-5" />
              </div>
              <span className="font-heading font-bold text-lg">{APP_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sistem booking dan manajemen antrean terintegrasi {HOSPITAL_NAME}.
              Dirancang untuk menghadirkan kenyamanan, kepastian waktu, dan keadilan layanan.
            </p>
            <div className="flex items-center gap-2 text-xs text-primary font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>Privasi data kependudukan terlindungi</span>
            </div>
          </div>

          {/* Col 2: Layanan Cepat */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3">Layanan Populer</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/layanan/poliklinik-penyakit-dalam" className="hover:text-primary transition-colors">
                  Poliklinik Penyakit Dalam
                </Link>
              </li>
              <li>
                <Link href="/layanan/poliklinik-anak" className="hover:text-primary transition-colors">
                  Poliklinik Spesialis Anak
                </Link>
              </li>
              <li>
                <Link href="/layanan/triase-igd" className="hover:text-primary transition-colors">
                  Triase Gawat Darurat (IGD 24 Jam)
                </Link>
              </li>
              <li>
                <Link href="/layanan/laboratorium" className="hover:text-primary transition-colors">
                  Laboratorium Patologi Klinik
                </Link>
              </li>
              <li>
                <Link href="/layanan/radiologi" className="hover:text-primary transition-colors">
                  Radiologi (USG, CT-Scan, X-Ray)
                </Link>
              </li>
              <li>
                <Link href="/layanan/farmasi" className="hover:text-primary transition-colors">
                  Farmasi & Resep Obat Racik
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Informasi Pasien */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3">Panduan Pasien</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/jadwal-dokter" className="hover:text-primary transition-colors">
                  Jadwal & Kuota Dokter Hari Ini
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  Pertanyaan Umum (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/tentang" className="hover:text-primary transition-colors">
                  Alur Prioritas Lansia & Disabilitas
                </Link>
              </li>
              <li>
                <Link href="/masuk" className="hover:text-primary transition-colors">
                  Cek Status Tiket & Pembayaran
                </Link>
              </li>
              <li>
                <Link href="/display/tv-poli-lt2-a8f9" target="_blank" className="hover:text-primary transition-colors">
                  Display Monitor TV Ruang Tunggu
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak & Darurat */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3">Kontak & Lokasi</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span>{HOSPITAL_CAMPUS}, Jl. Pemuda Sehat No. 108, Kota Depok</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>Call Center: (021) 7788-9900</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>pengaduan@rsud-sejahtera.go.id</span>
              </div>
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs mt-3 flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 shrink-0 text-red-600" />
                <div>
                  <span className="font-semibold block">Darurat Medis 24 Jam:</span>
                  <span>Hubungi Hotline IGD (021) 7788-9911</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} {HOSPITAL_NAME}. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="hover:underline">Kebijakan Privasi</Link>
            <span>•</span>
            <Link href="/faq" className="hover:underline">Syarat & Ketentuan</Link>
            <span>•</span>
            <Link href="/petugas/dashboard" className="text-primary hover:underline font-medium">Portal Petugas & Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
