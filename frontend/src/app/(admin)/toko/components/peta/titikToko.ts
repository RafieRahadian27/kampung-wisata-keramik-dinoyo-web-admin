import type { StatusToko, Toko } from "@/types";

/** Satu penanda di peta. */
export interface TitikToko {
  slug: string;
  nama: string;
  lokasiGang: string;
  wilayah: string;
  status: StatusToko;
  lat: number;
  lng: number;
  /** Warna lorong — sama dengan warna bar di daftar sebaran. */
  warna: string;
}

const KOORDINAT = /^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

/** "lat, lng" → angka. Nilai kosong/rusak/di luar jangkauan → null (toko tidak digambar). */
export function parseKoordinat(teks: string): { lat: number; lng: number } | null {
  const cocok = KOORDINAT.exec(teks ?? "");
  if (!cocok) return null;
  const lat = Number(cocok[1]);
  const lng = Number(cocok[2]);
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

export function keTitik(toko: Toko[], warnaWilayah: (wilayah: string) => string): { titik: TitikToko[]; tanpaKoordinat: number } {
  const titik: TitikToko[] = [];
  let tanpaKoordinat = 0;
  for (const item of toko) {
    const posisi = parseKoordinat(item.koordinat);
    if (!posisi) {
      tanpaKoordinat += 1;
      continue;
    }
    titik.push({ slug: item.slug, nama: item.nama, lokasiGang: item.lokasiGang, wilayah: item.wilayah, status: item.status, ...posisi, warna: warnaWilayah(item.wilayah) });
  }
  return { titik, tanpaKoordinat };
}
