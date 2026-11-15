export type StatusToko = "terverifikasi" | "menunggu" | "nonaktif";
export type BadgeToko = "baru" | "unggulan" | "maestro";

export interface Toko {
  id: number;
  slug: string;
  nama: string;
  nib: string;
  keterangan: string;
  pemilik: string;
  whatsapp: string;
  lokasiGang: string;
  wilayah: string;
  alamat: string;
  koordinat: string;
  spesialisasi: string;
  kategori: string[];
  jumlahProduk: number;
  tahunBerdiri: number;
  deskripsi: string;
  jamBuka: string;
  status: StatusToko;
  badge?: BadgeToko;
  foto: string;
  /** URL Vercel Blob stempel otentikasi; tidak ada bila belum diunggah. */
  stempel?: string;
  aktifPublik: boolean;
  akreditasi: boolean;
  diperbarui: string;
}

export type TokoInput = Omit<Toko, "id" | "slug" | "diperbarui">;

export interface Pengajuan {
  slug: string;
  nama: string;
  lokasiGang: string;
  pengrajin: string;
  keahlian: string;
  diajukan: string;
  foto: string;
}

export type StatusProduk ="tersedia" | "habis" | "preorder";

export interface Produk {
  id: number;
  nama: string;
  sku: string;
  /** Toko pemilik produk — dipakai untuk cek kepemilikan (ABAC). */
  tokoSlug: string;
  teknik: string;
  foto: string;
  badge?: string;
  toko: { nama: string; inisial: string; pengrajin: string };
  kategori: string;
  bahan: string;
  harga: number;
  catatanHarga: string;
  status: StatusProduk;
  stokLabel: string;
  lokasiStok: string;
}

export type PeranAkun = "Pemilik Toko" | "Staf Pengrajin";
export type StatusAkun = "aktif" | "menunggu" | "ditangguhkan";

export interface Akun {
  id: number;
  nama: string;
  /** Diisi saat pendaftaran mandiri; akun dari data awal boleh kosong. */
  umur?: number | null;
  inisial: string;
  nik: string;
  email: string;
  toko: string;
  lokasi: string;
  peran: PeranAkun;
  whatsapp: string;
  status: StatusAkun;
  terakhirAktif: string;
  tone: "primary" | "neutral" | "solid" | "tertiary" | "secondary";
}

export type Role = "admin" | "pengrajin";

export type Permission =
  | "dashboard:read"
  | "laporan:read"
  | "toko:read"
  | "toko:create"
  | "toko:update"
  | "toko:delete"
  | "pengajuan:decide"
  | "produk:read"
  | "produk:delete"
  | "akun:read"
  | "akun:update";

/** Baris tabel pengguna — hanya hidup di server, tidak pernah dikirim ke klien. */
export interface UserRecord {
  id: number;
  nama: string;
  sapaan: string;
  email: string;
  username: string;
  passwordHash: string;
  role: Role;
  /** Tautan ke data akun pengrajin (status aktif/ditangguhkan). */
  akunId?: number;
  /** Toko yang dimiliki pengguna — atribut untuk ABAC. */
  tokoSlugs: string[];
}

/** Profil pengguna yang aman dikirim ke klien (tanpa hash kata sandi). */
export interface AdminUser {
  id: number;
  nama: string;
  sapaan: string;
  email: string;
  /** Label peran untuk tampilan. */
  peran: string;
  role: Role;
  izin: Permission[];
  tokoSlugs: string[];
}
