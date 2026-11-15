/**
 * Aturan unggah foto sampul toko — dipakai di browser (umpan balik instan) DAN di Server Action
 * (sebelum diteruskan ke Express). Penentu akhir tetap backend, yang juga memeriksa isi berkas
 * (magic bytes) karena tipe dari browser bisa dipalsukan. Nilai disamakan dengan backend/.env.example.
 */
export const FOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const FOTO_MAX_BYTES = 2 * 1024 * 1024;
export const FOTO_ACCEPT = FOTO_TYPES.join(",");

export function formatBytes(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Pesan error untuk ditampilkan, atau `undefined` bila berkas boleh diunggah. */
export function validateFoto(file: Pick<File, "type" | "size">): string | undefined {
  if (!(FOTO_TYPES as readonly string[]).includes(file.type)) return "Format foto harus JPG, PNG, atau WebP.";
  if (file.size === 0) return "Berkas foto kosong.";
  if (file.size > FOTO_MAX_BYTES) return `Ukuran foto ${formatBytes(file.size)} melebihi batas ${formatBytes(FOTO_MAX_BYTES)}.`;
  return undefined;
}

/** Slug toko dari URL/argumen — format sama dengan backend (routes/params.ts). */
export function isValidSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
