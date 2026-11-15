"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authFetch, getCurrentUser } from "@/lib/dal";
import { SESSION_COOKIE } from "@/lib/session";
import { isValidSlug, validateFoto } from "@/lib/validation/upload";
import type { Akun, ApiResponse, MediaToko, Permission, StatusAkun, Toko, TokoFormValues } from "@/types";

/**
 * Mutasi data lewat Server Action: browser tidak lagi memanggil Express langsung,
 * sehingga token sesi tetap di server.
 *
 * Setiap action adalah endpoint HTTP publik — bisa dipanggil tanpa melewati form atau tombol
 * (yang mungkin disembunyikan di UI). Karena itu SETIAP action:
 *   1. memeriksa sesi & izin sendiri (`authorize`)      → 401 / 403
 *   2. memvalidasi argumen sebelum diteruskan            → 400 / 422
 *   3. baru meneruskan ke Express, yang memeriksa ulang izin & kepemilikan (ABAC)
 *
 * Hasil dikembalikan sebagai objek (bukan throw) karena pesan error dari Server Action
 * disamarkan di mode produksi — pesan 403/404/422 dari API tetap sampai ke pengguna.
 * Hanya `message` dan data yang diperlukan yang dikembalikan, tidak ada detail internal.
 */
export type ActionResult<T> = { ok: true; body: T } | { ok: false; status: number; message: string };

const fail = (status: number, message: string) => ({ ok: false, status, message }) as const;

async function authorize(permission: Permission): Promise<ActionResult<never> | null> {
  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return fail(503, "Server API tidak dapat dihubungi.");
  }
  if (!user) return fail(401, "Sesi Anda sudah berakhir. Silakan login kembali.");
  if (!user.izin.includes(permission)) return fail(403, "Anda tidak memiliki izin untuk tindakan ini.");
  return null;
}

interface CallOptions {
  method: string;
  /** Objek → dikirim sebagai JSON. Blob → dikirim apa adanya dengan `contentType`. */
  payload?: unknown;
  contentType?: string;
}

async function call<T>(path: string, { method, payload, contentType }: CallOptions): Promise<ActionResult<T>> {
  const isBinary = payload instanceof Blob;
  let response: Response;
  try {
    response = await authFetch(path, {
      method,
      headers: { "Content-Type": isBinary ? (contentType ?? payload.type) : "application/json" },
      body: payload === undefined ? undefined : isBinary ? payload : JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return fail(503, "Server API tidak dapat dihubungi.");
  }

  if (response.status === 401) {
    // Sesi dicabut/kedaluwarsa di server → bersihkan cookie & minta login ulang.
    (await cookies()).delete(SESSION_COOKIE);
    redirect("/login?sesi=berakhir");
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    // 5xx: jangan teruskan isi respons mentah — cukup pesan umum (detail ada di log backend via requestId).
    const message = response.status >= 500 && response.status !== 503 ? "Terjadi kesalahan pada server. Coba lagi beberapa saat." : body?.message;
    return fail(response.status, message ?? `Permintaan gagal (${response.status})`);
  }
  return { ok: true, body: body as T };
}

const seg = encodeURIComponent;
const isPlainObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const isPositiveInt = (value: unknown): value is number => Number.isInteger(value) && (value as number) > 0;
const STATUS_AKUN: StatusAkun[] = ["aktif", "menunggu", "ditangguhkan"];

export async function createToko(values: TokoFormValues) {
  const denied = await authorize("toko:create");
  if (denied) return denied;
  if (!isPlainObject(values)) return fail(400, "Data toko tidak valid.");
  return call<ApiResponse<Toko>>("/toko", { method: "POST", payload: values });
}

export async function updateToko(slug: string, values: Partial<TokoFormValues>) {
  const denied = await authorize("toko:update");
  if (denied) return denied;
  if (!isValidSlug(slug) || !isPlainObject(values)) return fail(400, "Data toko tidak valid.");
  return call<ApiResponse<Toko>>(`/toko/${seg(slug)}`, { method: "PUT", payload: values });
}

const MEDIA_TOKO: MediaToko[] = ["foto", "stempel"];

/**
 * Unggah media toko — foto sampul atau stempel (alur: Pilih File → Validasi → Simpan ke Storage
 * → Catat Referensi). Berkas diperiksa ulang di sini (tipe & ukuran), lalu isinya diteruskan ke
 * Express yang memeriksa magic bytes, mengunggah ke Vercel Blob, dan mencatat URL-nya di
 * kolom `toko.foto` / `toko.stempel`.
 */
export async function uploadMediaToko(slug: string, jenis: MediaToko, formData: FormData) {
  const denied = await authorize("toko:update");
  if (denied) return denied;
  if (!isValidSlug(slug) || !MEDIA_TOKO.includes(jenis) || !(formData instanceof FormData)) return fail(400, "Permintaan unggah tidak valid.");

  const file = formData.get("berkas");
  if (!(file instanceof File)) return fail(400, "Pilih gambar yang akan diunggah.");
  const error = validateFoto(file);
  if (error) return fail(422, error);

  return call<ApiResponse<Toko>>(`/toko/${seg(slug)}/${jenis}`, { method: "PUT", payload: file, contentType: file.type });
}

export async function removeToko(slug: string) {
  const denied = await authorize("toko:delete");
  if (denied) return denied;
  if (!isValidSlug(slug)) return fail(400, "Slug toko tidak valid.");
  return call<{ message: string }>(`/toko/${seg(slug)}`, { method: "DELETE" });
}

export async function putuskanPengajuan(slug: string, keputusan: "verifikasi" | "tolak") {
  const denied = await authorize("pengajuan:decide");
  if (denied) return denied;
  if (!isValidSlug(slug) || (keputusan !== "verifikasi" && keputusan !== "tolak")) return fail(400, "Keputusan pengajuan tidak valid.");
  return call<{ message: string }>(`/pengajuan/${seg(slug)}`, { method: "PATCH", payload: { keputusan } });
}

export async function removeProduk(id: number) {
  const denied = await authorize("produk:delete");
  if (denied) return denied;
  if (!isPositiveInt(id)) return fail(400, "ID produk tidak valid.");
  return call<{ message: string }>(`/produk/${seg(String(id))}`, { method: "DELETE" });
}

export async function updateAkunStatus(id: number, status: StatusAkun) {
  const denied = await authorize("akun:update");
  if (denied) return denied;
  if (!isPositiveInt(id) || !STATUS_AKUN.includes(status)) return fail(400, "Status akun tidak valid.");
  return call<ApiResponse<Akun>>(`/akun/${seg(String(id))}/status`, { method: "PATCH", payload: { status } });
}
