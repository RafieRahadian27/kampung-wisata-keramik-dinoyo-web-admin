import { authFetch, getSessionToken } from "@/lib/dal";

/** Laporan web vitals jauh lebih kecil dari ini; batas mencegah body raksasa diteruskan ke Express. */
const MAKS_BYTES = 4 * 1024;

/**
 * POST /api/vitals — perantara laporan Web Vitals dari browser ke Express.
 * Token sesi ada di cookie HttpOnly yang tidak bisa dibaca JavaScript browser, jadi browser
 * mengirim ke origin sendiri, lalu Route Handler ini meneruskannya dengan header Authorization.
 *
 * Selalu menjawab 204: pengiriman via sendBeacon tidak membaca respons, dan kegagalan pencatatan
 * metrik tidak boleh mengganggu pengguna. Tamu (tanpa sesi) diabaikan.
 */
export async function POST(request: Request) {
  const noContent = new Response(null, { status: 204 });
  if (!(await getSessionToken())) return noContent;

  const body = await request.text();
  if (body.length === 0 || body.length > MAKS_BYTES) return noContent;

  // Validasi isi dilakukan Express (routes/vitals.routes.ts); di sini cukup memastikan JSON.
  try {
    JSON.parse(body);
  } catch {
    return noContent;
  }

  await authFetch("/vitals", { method: "POST", body, headers: { "Content-Type": "application/json" } }).catch(() => null);
  return noContent;
}
