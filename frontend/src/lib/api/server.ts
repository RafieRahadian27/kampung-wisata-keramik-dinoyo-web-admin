import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { forbidden, redirect } from "next/navigation";
import { CACHE_PROFILES, type CacheProfile } from "@/constants/cacheProfiles";
import { authFetch, getSessionToken } from "@/lib/dal";
import type {
  Akun,
  ApiResponse,
  BerandaData,
  DashboardData,
  HargaPasar,
  KategoriProduk,
  LaporanData,
  LaporanTokoData,
  PeriodeLaporan,
  Produk,
  ProfilData,
  RingkasanAkun,
  RingkasanProduk,
  RingkasanToko,
  Toko,
} from "@/types";
import { API_BASE_URL, ApiError, CACHE_TAGS, type CacheTag, parseResponse } from "./config";

type HasilFetch<T> = { ok: true; body: T } | { ok: false; status: number; message: string };

/**
 * Bagian yang di-cache (`'use cache'`): panggilan HTTP ke Express + parsing JSON.
 *
 * - `cookies()` tidak boleh dibaca di dalam scope cache, jadi token sesi dikirim sebagai
 *   ARGUMEN. Argumen ikut menjadi cache key → entri cache terpisah per sesi, data pengguna A
 *   tidak pernah tersaji ke pengguna B (sama seperti header Authorization pada Data Cache dulu).
 * - Hanya respons sukses yang disimpan sesuai profil + diberi tag (diinvalidasi lewat
 *   `updateTag` di lib/actions/cache.ts setelah mutasi). Respons gagal (401/403/5xx) diberi umur
 *   1 detik agar request berikutnya langsung bertanya ulang ke Express.
 * - Error jaringan (Express mati) dilempar dan tidak pernah di-cache.
 */
async function fetchTercache<T>(path: string, token: string | undefined, tag: CacheTag, profil: CacheProfile): Promise<HasilFetch<T>> {
  "use cache";
  const response = await fetch(`${API_BASE_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    cacheLife({ stale: 0, revalidate: 0, expire: 1 });
    return { ok: false, status: response.status, message: body?.message ?? `Permintaan gagal (${response.status})` };
  }
  cacheLife(CACHE_PROFILES[profil]);
  cacheTag(tag);
  return { ok: true, body: body as T };
}

/**
 * Fetch data dari Express di sisi server (dipanggil oleh Server Components). Cookie sesi dibaca
 * DI LUAR scope cache, lalu hasilnya diterjemahkan: 401 → login ulang, 403 → forbidden.tsx.
 * Halaman tetap wajib memanggil `requirePermission()` (tanpa cache) sebelum memakai data ini.
 */
async function getJson<T>(path: string, tag: CacheTag, profil: CacheProfile = "panel"): Promise<T> {
  const hasil = await fetchTercache<T>(path, await getSessionToken(), tag, profil);
  if (hasil.ok) return hasil.body;
  if (hasil.status === 401) redirect("/login?sesi=berakhir");
  if (hasil.status === 403) forbidden();
  throw new ApiError(hasil.status, hasil.message);
}

export async function getDashboard() {
  const { data } = await getJson<ApiResponse<DashboardData>>("/dashboard", CACHE_TAGS.dashboard, "segar");
  return data;
}

/** Daftar + ringkasan: ringkasan dikirim Express di `meta`, lalu diratakan agar mudah dipakai halaman. */
export async function getTokoList() {
  const { data, meta } = await getJson<ApiResponse<Toko[], { ringkasan: RingkasanToko }>>("/toko", CACHE_TAGS.toko);
  return { data, ringkasan: meta.ringkasan };
}

export async function getToko(slug: string) {
  const { data } = await getJson<ApiResponse<Toko>>(`/toko/${encodeURIComponent(slug)}`, CACHE_TAGS.toko);
  return data;
}

export async function getProdukList() {
  const { data, meta } = await getJson<ApiResponse<Produk[], { kategori: KategoriProduk[]; ringkasan: RingkasanProduk }>>(
    "/produk",
    CACHE_TAGS.produk,
  );
  return { data, kategori: meta.kategori, ringkasan: meta.ringkasan };
}

export async function getAkunList() {
  const { data, meta } = await getJson<ApiResponse<Akun[], { ringkasan: RingkasanAkun }>>("/akun", CACHE_TAGS.akun);
  return { data, ringkasan: meta.ringkasan };
}

export async function getLaporan() {
  const { data } = await getJson<ApiResponse<LaporanData>>("/laporan", CACHE_TAGS.laporan, "laporan");
  return data;
}

export async function getBeranda() {
  const { data } = await getJson<ApiResponse<BerandaData>>("/beranda", CACHE_TAGS.beranda, "segar");
  return data;
}

export async function getLaporanToko(periode: PeriodeLaporan = 30) {
  const { data } = await getJson<ApiResponse<LaporanTokoData>>(`/laporan-toko?periode=${periode}`, CACHE_TAGS.laporanToko, "laporan");
  return data;
}

export async function getHargaPasar() {
  const { data } = await getJson<ApiResponse<HargaPasar[]>>("/produk/harga-pasar", CACHE_TAGS.produk, "laporan");
  return data;
}

/** Profil & daftar sesi selalu diambil segar (di luar `use cache`) — sesi bisa dicabut kapan saja. */
export async function getProfil() {
  const response = await authFetch("/auth/profil", { cache: "no-store" });
  if (response.status === 401) redirect("/login?sesi=berakhir");
  if (response.status === 403) forbidden();
  const { data } = await parseResponse<ApiResponse<ProfilData>>(response);
  return data;
}
