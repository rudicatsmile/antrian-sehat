import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://antreansehat.rsud.go.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/layanan",
          "/layanan/*",
          "/jadwal-dokter",
          "/tentang",
          "/faq",
          "/kontak",
          "/masuk",
          "/daftar",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/petugas",
          "/petugas/*",
          "/dashboard",
          "/booking",
          "/booking/*",
          "/antrean",
          "/antrean/*",
          "/pembayaran",
          "/pembayaran/*",
          "/profil",
          "/riwayat",
          "/display",
          "/display/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
