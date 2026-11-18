import type { MetadataRoute } from "next";

/**
 * robots.txt BUKAN pagar.
 *
 * robots.txt hanya *meminta* crawler tidak menjelajah suatu URL. URL yang di-Disallow tetap bisa
 * terindeks lewat tautan dari situs lain — dan karena crawler dilarang membuka halamannya, ia
 * justru tidak pernah melihat tag `noindex` di dalamnya.
 *
 * Karena itu panel ini sengaja TIDAK memakai `Disallow: /`. Yang menjaga panel keluar dari
 * hasil pencarian adalah:
 *   1. `noindex, nofollow` — meta robots (app/layout.tsx) + header X-Robots-Tag (next.config.ts)
 *   2. login — semua halaman selain /login & /daftar dialihkan ke /login tanpa sesi (proxy.ts)
 *
 * Yang tetap di-Disallow hanyalah endpoint yang memang tak berguna dijelajah. Sitemap sengaja
 * tidak dibuat: sitemap adalah daftar halaman yang INGIN ditemukan, dan panel privat tidak punya.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
  };
}
