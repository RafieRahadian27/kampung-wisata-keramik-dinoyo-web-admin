/**
 * Nilai `sizes` untuk next/image — memberi tahu browser LEBAR NYATA gambar di tiap breakpoint
 * sehingga ia memilih berkas yang pas dari `srcset` (tidak mengunduh 1920px untuk kotak 260px).
 *
 * Patokan lebar kolom konten area admin (AdminShell):
 *   < 640px    : 100vw − 32px               (px-4)
 *   640–1023px : 100vw − 48px               (sm:px-6)
 *   ≥ 1024px   : 100vw − 288px − 48px       (sidebar w-72 + padding) = 100vw − 336px
 *   ≥ 1488px   : tetap 1152px               (main max-w-[1200px] − padding; 1200 + 288 = 1488)
 *
 * Kesalahan umum yang diperbaiki di sini: memakai `100vw`/`50vw`/`25vw` seolah gambar selebar
 * layar, padahal sidebar memakan 288px — browser jadi mengunduh gambar 30–40% lebih besar.
 */
export const IMAGE_SIZES = {
  /** Banner selebar kolom konten (BerandaHero). */
  kolomPenuh: "(min-width: 1488px) 1152px, (min-width: 1024px) calc(100vw - 336px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)",

  /** Grid 3 kolom gap-4 mulai md (Sorotan Kurasi). */
  tigaKolom: "(min-width: 1488px) 374px, (min-width: 1024px) calc((100vw - 368px) / 3), (min-width: 768px) calc((100vw - 80px) / 3), calc(100vw - 32px)",

  /** Grid produk di dalam panel ber-padding p-4/sm:p-6: 1 → 2 (sm) → 4 kolom (xl). */
  gridProduk:
    "(min-width: 1488px) 264px, (min-width: 1280px) calc((100vw - 432px) / 4), (min-width: 1024px) calc((100vw - 400px) / 2), (min-width: 640px) calc((100vw - 112px) / 2), calc(100vw - 64px)",

  /** Produk terbaru: kartu xl:col-span-8, di dalamnya grid 1 → 2 (sm) → 3 kolom (lg). */
  produkTerbaru:
    "(min-width: 1488px) 227px, (min-width: 1280px) calc((200vw - 936px) / 9), (min-width: 1024px) calc((100vw - 416px) / 3), (min-width: 640px) calc((100vw - 112px) / 2), calc(100vw - 72px)",
} as const;
