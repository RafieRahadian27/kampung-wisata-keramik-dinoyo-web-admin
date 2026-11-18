import {
  type ActionResult,
  cabutSesiLain,
  createProduk,
  createToko,
  gantiPassword,
  ubahSapaan,
  putuskanPengajuan,
  removeProduk,
  removeToko,
  updateAkunStatus,
  updateToko,
  uploadFotoProduk,
  uploadMediaToko,
} from "@/lib/actions/api";
import type { MediaToko, ProdukFormValues, StatusAkun, TokoFormValues } from "@/types";
import { ApiError } from "./config";

/**
 * API untuk Client Components. Setiap fungsi memanggil Server Action (lib/actions/api.ts)
 * yang meneruskan request ke Express beserta token sesi. Kegagalan diubah kembali
 * menjadi ApiError agar komponen cukup memakai try/catch seperti biasa.
 */
async function unwrap<T>(pending: Promise<ActionResult<T>>): Promise<T> {
  const result = await pending;
  if (!result.ok) throw new ApiError(result.status, result.message);
  return result.body;
}

export const tokoApi = {
  create: (values: TokoFormValues) => unwrap(createToko(values)),
  update: (slug: string, values: Partial<TokoFormValues>) => unwrap(updateToko(slug, values)),
  /** File dibungkus FormData — satu-satunya cara mengirim berkas ke Server Action. */
  uploadMedia: (slug: string, jenis: MediaToko, file: File) => {
    const formData = new FormData();
    formData.append("berkas", file);
    return unwrap(uploadMediaToko(slug, jenis, formData));
  },
  remove: (slug: string) => unwrap(removeToko(slug)),
  putuskanPengajuan: (slug: string, keputusan: "verifikasi" | "tolak") => unwrap(putuskanPengajuan(slug, keputusan)),
};

export const produkApi = {
  create: (values: ProdukFormValues) => unwrap(createProduk(values)),
  uploadFoto: (id: number, file: File) => {
    const formData = new FormData();
    formData.append("berkas", file);
    return unwrap(uploadFotoProduk(id, formData));
  },
  remove: (id: number) => unwrap(removeProduk(id)),
};

export const profilApi = {
  gantiPassword: (passwordLama: string, passwordBaru: string) => unwrap(gantiPassword(passwordLama, passwordBaru)),
  cabutSesiLain: () => unwrap(cabutSesiLain()),
  ubahSapaan: (sapaan: string) => unwrap(ubahSapaan(sapaan)),
};

export const akunApi = {
  updateStatus: (id: number, status: StatusAkun) => unwrap(updateAkunStatus(id, status)),
};
