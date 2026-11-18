/**
 * Profil umur cache (`cacheLife`) untuk data dari Express — satu sumber kebenaran yang dipakai
 * next.config.ts (didaftarkan sebagai profil bernama) dan lib/api/server.ts.
 *
 * - stale      : berapa lama klien boleh memakai data tanpa bertanya ke server
 * - revalidate : setelah ini, permintaan berikutnya memicu pembaruan di latar belakang
 * - expire     : batas mutlak; lewat dari ini data lama tidak boleh disajikan lagi
 * (detik). Setelah mutasi, tag terkait langsung diinvalidasi (lib/actions/cache.ts).
 */
export const CACHE_PROFILES = {
  /** Angka yang cepat berubah: dashboard admin & dashboard toko pengrajin. */
  segar: { stale: 30, revalidate: 30, expire: 300 },
  /** Daftar toko, produk, akun — berubah saat ada mutasi. */
  panel: { stale: 30, revalidate: 60, expire: 600 },
  /** Agregat laporan & harga pasar — mahal dihitung, cukup diperbarui tiap 5 menit. */
  laporan: { stale: 60, revalidate: 300, expire: 3600 },
} as const;

export type CacheProfile = keyof typeof CACHE_PROFILES;
