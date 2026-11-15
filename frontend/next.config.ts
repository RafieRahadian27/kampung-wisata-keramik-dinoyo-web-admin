import type { NextConfig } from "next";
import { FOTO_MAX_BYTES } from "./src/lib/validation/upload";

/**
 * Header keamanan untuk SEMUA halaman & aset panel.
 * - nosniff: browser tidak menebak tipe konten (berkas teks tidak dijalankan sebagai skrip)
 * - DENY: panel admin tidak boleh ditampilkan di <iframe> situs lain (clickjacking)
 * - Referrer-Policy: URL internal panel tidak bocor utuh ke situs luar
 * - Permissions-Policy: matikan fitur perangkat yang tidak dipakai panel
 * - HSTS hanya di production (bermakna bila dilayani lewat HTTPS)
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  // Sembunyikan indikator dev Next.js agar tidak menutupi tombol Logout di sidebar.
  devIndicators: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    // Foto sampul toko yang diunggah tersimpan di Vercel Blob. Hanya folder toko/ di host Blob
    // yang boleh dioptimasi next/image — URL eksternal lain ditolak 400.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/toko/**", search: "" }],
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
