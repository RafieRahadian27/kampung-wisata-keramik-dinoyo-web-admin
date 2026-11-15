import { EMAIL, EMAIL_MAX, NAMA_ORANG, NIK, USERNAME, WHATSAPP_ID } from "../lib/validate";
import { PASSWORD_MAX, PASSWORD_MIN, validatePassword } from "../lib/validatePassword";
import type { Schema } from "../utils/schema";

/** Skema input per endpoint. Dipakai oleh middleware `validate()` di setiap router. */

export const loginSchema: Schema = {
  identifier: { type: "string", label: "Email/username", required: true, max: EMAIL_MAX },
  password: { type: "string", label: "Kata sandi", required: true, max: 200 },
  remember: { type: "boolean", default: false },
};

/**
 * Aturan format pendaftaran (lihat src/lib/validate.ts & validatePassword.ts).
 * Validasi di browser hanya untuk kenyamanan, yang di sini adalah penentu akhir.
 */
export const registerSchema: Schema = {
  nama: { type: "string", label: "Nama lengkap", required: true, min: 3, max: 100, pattern: NAMA_ORANG, patternMessage: "Nama lengkap hanya boleh berisi huruf, spasi, titik, atau tanda petik" },
  umur: { type: "number", label: "Umur", required: true, integer: true, min: 17, max: 100 },
  nik: { type: "string", label: "NIK", required: true, pattern: NIK, patternMessage: "NIK harus 16 digit angka" },
  whatsapp: { type: "string", label: "Nomor WhatsApp", required: true, pattern: WHATSAPP_ID, patternMessage: "Nomor WhatsApp harus diawali 08 atau 62 dan berisi 10–14 digit" },
  toko: { type: "string", label: "Nama toko", required: true, min: 3, max: 60 },
  lokasi: { type: "string", label: "Lokasi toko", required: true, min: 5, max: 100 },
  peran: { type: "string", label: "Peran", required: true, enum: ["Pemilik Toko", "Staf Pengrajin"] },
  username: { type: "string", label: "Username", required: true, pattern: USERNAME, patternMessage: "Username 4–20 karakter, diawali huruf, hanya huruf/angka/garis bawah" },
  email: { type: "string", label: "Email", required: true, max: EMAIL_MAX, pattern: EMAIL, patternMessage: "Format email tidak valid (contoh: nama@gmail.com)" },
  password: {
    type: "string",
    label: "Kata sandi",
    required: true,
    min: PASSWORD_MIN,
    max: PASSWORD_MAX,
    // Huruf besar + huruf kecil + angka, tanpa spasi, tidak memuat username/email.
    check: (password, input) => validatePassword(password, { username: input.username, email: input.email }),
  },
};

const WHATSAPP = /^\+?[0-9\s-]{9,20}$/;
const KOORDINAT = /^-?\d{1,2}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/;

/** Untuk POST. PUT memakai skema yang sama dalam mode parsial. */
export const tokoSchema: Schema = {
  nama: { type: "string", label: "Nama toko", required: true, min: 3, max: 60 },
  pemilik: { type: "string", label: "Nama pemilik", required: true, max: 100 },
  tahunBerdiri: { type: "number", label: "Tahun berdiri", required: true, integer: true, min: 1900, max: () => new Date().getFullYear() },
  kategori: { type: "array", label: "Kategori", maxItems: 8, itemMax: 60, default: [] },
  deskripsi: { type: "string", label: "Deskripsi", max: 2000, default: "" },
  wilayah: { type: "string", label: "Wilayah", required: true, max: 120 },
  alamat: { type: "string", label: "Alamat", max: 200, default: "" },
  koordinat: { type: "string", label: "Koordinat", max: 40, pattern: KOORDINAT, patternMessage: "Koordinat harus berformat 'lat, lng'" },
  whatsapp: { type: "string", label: "Nomor WhatsApp", required: true, pattern: WHATSAPP, patternMessage: "Format nomor WhatsApp belum valid" },
  jamBuka: { type: "string", label: "Jam buka", required: true, max: 80 },
  aktifPublik: { type: "boolean", default: false },
  akreditasi: { type: "boolean", default: false },
};

export const tokoQuerySchema: Schema = {
  q: { type: "string", max: 100 },
  status: { type: "string", enum: ["terverifikasi", "menunggu", "nonaktif"] },
  lokasi: { type: "string", max: 60 },
  kategori: { type: "string", max: 60 },
};

export const produkQuerySchema: Schema = {
  q: { type: "string", max: 100 },
  kategori: { type: "string", max: 60 },
  toko: { type: "string", max: 100 },
};

export const akunQuerySchema: Schema = {
  q: { type: "string", max: 100 },
  peran: { type: "string", enum: ["Pemilik Toko", "Staf Pengrajin"] },
  status: { type: "string", enum: ["aktif", "menunggu", "ditangguhkan"] },
};

export const akunStatusSchema: Schema = {
  status: { type: "string", label: "Status akun", required: true, enum: ["aktif", "menunggu", "ditangguhkan"] },
};

export const keputusanSchema: Schema = {
  keputusan: { type: "string", label: "Keputusan", required: true, enum: ["verifikasi", "tolak"] },
};
