/**
 * Alamat publik panel (tanpa garis miring di akhir). Dipakai sebagai `metadataBase` agar URL
 * gambar Open Graph menjadi absolut, dan untuk menentukan apakah CSP boleh memaksa HTTPS.
 * Atur NEXT_PUBLIC_SITE_URL di .env.local / environment server production.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const SITE_NAME = "Dinoyo Craft Admin";
export const SITE_TITLE = "Panel Pengelolaan • Kampung Wisata Keramik Dinoyo";
export const SITE_DESCRIPTION =
  "Panel admin paguyuban Kampung Wisata Keramik Dinoyo untuk mengelola toko, produk, akun pengrajin, dan laporan kunjungan.";
