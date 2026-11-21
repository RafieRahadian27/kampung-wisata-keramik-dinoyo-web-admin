"use server";

import { authFetch, getCurrentUser } from "@/lib/dal";
import type { ApiResponse, PengajuanToko, Produk } from "@/types";

export interface Notifikasi {
  id: string;
  judul: string;
  detail: string;
  href: string;
  nada: "primary" | "tertiary" | "error";
}

const JAM = 60 * 60 * 1000;

async function ambil<T>(path: string): Promise<T | null> {
  try {
    const response = await authFetch(path, { cache: "no-store" });
    if (!response.ok) return null;
    return ((await response.json()) as ApiResponse<T>).data;
  } catch {
    return null;
  }
}

/**
 * Notifikasi header dihitung dari data nyata (bukan titik merah hiasan):
 *  - admin     → pengajuan toko yang menunggu, yang tinggal < 24 jam, dan yang sudah kedaluwarsa
 *  - pengrajin → produk tokonya yang stok habis
 * Server Action tetap memeriksa sesi sendiri; data sudah dibatasi izin & ABAC oleh Express.
 */
export async function getNotifikasi(): Promise<Notifikasi[]> {
  const user = await getCurrentUser().catch(() => null);
  if (!user) return [];
  const daftar: Notifikasi[] = [];

  if (user.izin.includes("pengajuan:decide")) {
    const pengajuan = (await ambil<PengajuanToko[]>("/pengajuan")) ?? [];
    const now = Date.now();
    const menunggu = pengajuan.filter((p) => p.status === "menunggu" && Date.parse(p.batasWaktu) > now);
    const mendesak = menunggu.filter((p) => Date.parse(p.batasWaktu) - now < 24 * JAM);
    const kedaluwarsa = pengajuan.length - menunggu.length;
    if (mendesak.length > 0) {
      daftar.push({ id: "mendesak", judul: `${mendesak.length} pengajuan hampir melewati batas`, detail: `Sisa < 24 jam: ${mendesak.map((p) => p.nama).join(", ")}`, href: "/dashboard", nada: "error" });
    }
    if (menunggu.length > 0) {
      daftar.push({ id: "menunggu", judul: `${menunggu.length} pengajuan toko menunggu verifikasi`, detail: "Tinjau di panel Persetujuan & Verifikasi Toko.", href: "/dashboard", nada: "primary" });
    }
    if (kedaluwarsa > 0) {
      daftar.push({ id: "kedaluwarsa", judul: `${kedaluwarsa} pengajuan kedaluwarsa`, detail: "Lewat 3×24 jam tanpa keputusan — hapus dari antrean.", href: "/dashboard", nada: "tertiary" });
    }
  }

  if (user.role === "pengrajin" && user.izin.includes("produk:read")) {
    const produk = (await ambil<Produk[]>("/produk")) ?? [];
    const habis = produk.filter((p) => p.status === "habis");
    if (habis.length > 0) {
      daftar.push({ id: "stok-habis", judul: `${habis.length} produk stok habis`, detail: habis.slice(0, 3).map((p) => p.nama).join(", "), href: "/produk", nada: "error" });
    }
    if (produk.length === 0) {
      daftar.push({ id: "katalog-kosong", judul: "Katalog toko Anda masih kosong", detail: "Tambahkan produk pertama agar tampil di direktori.", href: "/produk/tambah", nada: "primary" });
    }
  }

  return daftar;
}
