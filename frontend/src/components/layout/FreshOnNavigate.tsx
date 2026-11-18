"use client";

import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";

/**
 * Dengan Cache Components, Next.js tidak lagi membongkar (unmount) halaman saat berpindah rute —
 * halaman disembunyikan dengan <Activity> dan state-nya dipertahankan (sampai 3 rute).
 *
 * Banyak komponen panel menyimpan data server di state awal, mis. `useState(initialProduk)`.
 * Tanpa pembungkus ini: Tambah Produk → router.push("/produk") menampilkan daftar LAMA, dan
 * formulir "Tambah" yang dibuka lagi masih berisi isian sebelumnya.
 *
 * `bfcacheId` berganti setiap navigasi push/replace (klik <Link>, router.push) dan tetap sama
 * untuk tombol Back/Forward & router.refresh(). Dipakai sebagai `key`, hasilnya:
 *   - navigasi baru  → subtree dirender ulang dari nol dengan data terbaru (perilaku lama)
 *   - Back/Forward    → filter, isian, dan posisi scroll dipulihkan (bonus Activity)
 *
 * Harus dipasang DI DALAM page.tsx (bukan layout): `bfcacheId` bersifat kontekstual per segmen,
 * dan di layout nilainya tidak berubah saat berpindah antarhalaman.
 */
export function FreshOnNavigate({ children }: { children: ReactNode }) {
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}
