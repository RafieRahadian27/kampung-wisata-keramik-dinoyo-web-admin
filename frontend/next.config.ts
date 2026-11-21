import type { NextConfig } from "next";
import { CACHE_PROFILES } from "./src/constants/cacheProfiles";
import { SITE_URL } from "./src/constants/site";
import { FOTO_MAX_BYTES } from "./src/lib/validation/upload";

const isDev = process.env.NODE_ENV === "development";
const isHttps = SITE_URL.startsWith("https://");

/**
 * Content Security Policy TANPA nonce — keputusan desain, bukan kelalaian:
 * - CSP + nonce memaksa SETIAP halaman dirender dinamis (nonce baru per request), sehingga
 *   Partial Prerendering/cangkang statis tidak bisa dipakai. Panel ini memilih tetap punya cangkang statis.
 * - Harganya: `script-src` memakai 'unsafe-inline' (skrip inline Next.js & skrip tema di <head>).
 *   Lapisan lain tetap ketat: hanya skrip dari origin sendiri, tidak ada <object>, <base>, atau
 *   form ke domain lain, dan panel tidak boleh dibingkai situs lain.
 * - 'unsafe-eval' hanya saat development (dipakai React untuk call stack di overlay error).
 * - upgrade-insecure-requests hanya bila situs memang dilayani lewat HTTPS; di `next start` lokal
 *   (http://localhost) direktif ini justru memaksa aset dimuat via https dan membuat halaman rusak.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // blob: = pratinjau foto sebelum diunggah. Foto dari Vercel Blob tetap lewat /_next/image ('self').
  // tile.openstreetmap.org = ubin peta sebaran lorong (Leaflet).
  "img-src 'self' blob: data: https://tile.openstreetmap.org",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

/**
 * Header keamanan untuk SEMUA halaman & aset panel.
 * - nosniff: browser tidak menebak tipe konten (berkas teks tidak dijalankan sebagai skrip)
 * - DENY: panel admin tidak boleh ditampilkan di <iframe> situs lain (clickjacking)
 * - Referrer-Policy: URL internal panel tidak bocor utuh ke situs luar
 * - Permissions-Policy: matikan fitur perangkat yang tidak dipakai panel; GPS hanya untuk origin
 *   sendiri (tombol "Lokasi saya" saat menandai lokasi studio di form toko)
 * - X-Robots-Tag: panel privat tidak boleh muncul di hasil pencarian. Berbeda dengan robots.txt
 *   (hanya "permintaan" agar tidak dijelajah), noindex benar-benar mengeluarkan URL dari indeks —
 *   dan lewat header ia juga berlaku untuk respons non-HTML (gambar, JSON).
 * - HSTS hanya di production (bermakna bila dilayani lewat HTTPS)
 */
const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=()" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  // Sembunyikan indikator dev Next.js agar tidak menutupi tombol Logout di sidebar.
  devIndicators: false,
  /**
   * Cache Components → Partial Prerendering: setiap halaman = cangkang statis (dibuat saat build)
   * + bagian yang butuh cookie sesi/data segar, dialirkan menyusul di balik <Suspense>.
   * Data dari Express di-cache dengan `'use cache'` + profil di bawah (lihat lib/api/server.ts).
   */
  cacheComponents: true,
  cacheLife: CACHE_PROFILES,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Foto sampul toko yang diunggah tersimpan di Vercel Blob. Hanya folder toko/ di host Blob
    // yang boleh dioptimasi next/image — URL eksternal lain ditolak 400.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/toko/**", search: "" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/produk/**", search: "" },
    ],
  },
  experimental: {
    // Mengaktifkan forbidden() → app/(admin)/forbidden.tsx dengan status 403.
    authInterrupts: true,
    serverActions: {
      // Default 1 MB; foto sampul boleh sampai 2 MB, ditambah ruang untuk overhead multipart/form-data.
      // `allowedOrigins` sengaja tidak diisi: panel tidak dilayani lewat proxy yang mengganti host.
      bodySizeLimit: FOTO_MAX_BYTES + 64 * 1024,
    },
  },
};

export default nextConfig;
