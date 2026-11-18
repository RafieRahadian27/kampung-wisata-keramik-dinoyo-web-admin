/**
 * Pola karakter untuk kolom teks bebas. Disamakan dengan `backend/src/lib/validate.ts`
 * (NAMA_ORANG, NAMA_PRODUK) — browser memberi umpan balik cepat, Express tetap penentu akhir.
 */

/** Nama orang: hanya huruf (semua aksara), spasi, titik (gelar "H.", "Bpk."), petik, tanda hubung. */
export const NAMA_ORANG_PATTERN = /^[\p{L}][\p{L} .'-]*$/u;
/** Nama produk/bahan: diawali huruf/angka; boleh spasi & tanda baca sederhana. */
export const NAMA_PRODUK_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} .,'&()/-]*$/u;

/**
 * Saring ketikan untuk kolom nama orang: angka & simbol langsung dibuang saat diketik/ditempel,
 * sehingga yang tersimpan hanya karakter huruf. `ditolak` = ada karakter yang dibuang (untuk pesan).
 */
export function hanyaKarakterNama(raw: string): { value: string; ditolak: boolean } {
  const value = raw.replace(/[^\p{L} .'-]/gu, "");
  return { value, ditolak: value !== raw };
}

export function validateNamaPengrajin(raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return "Nama pengrajin wajib diisi.";
  if (/\d/.test(value)) return "Nama pengrajin tidak boleh mengandung angka.";
  if (!NAMA_ORANG_PATTERN.test(value)) return "Nama pengrajin hanya boleh berisi huruf, spasi, titik, petik, atau tanda hubung.";
  if (value.length < 3) return "Nama pengrajin minimal 3 huruf.";
  if (value.length > 100) return "Nama pengrajin maksimal 100 karakter.";
  return undefined;
}
