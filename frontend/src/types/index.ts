/* Tipe data yang dikirim oleh REST API Express (lihat backend/src/types). */

export type Tone = "primary" | "secondary" | "tertiary" | "neutral" | "error" | "solid";

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
  | "akun:update"
  | "beranda:read"
  | "produk:create"
  | "laporan-toko:read"
  | "profil:update";

/** Pengguna yang sedang login, hasil verifikasi sesi oleh Express (`GET /auth/me`). */
export interface AdminUser {
  id: number;
  nama: string;
  sapaan: string;
  email: string;
  /** Label peran untuk tampilan, mis. "Admin Paguyuban". */
  peran: string;
  role: Role;
  izin: Permission[];
  tokoSlugs: string[];
}

export type StatusToko = "terverifikasi" | "menunggu" | "nonaktif";
export type BadgeToko = "baru" | "unggulan" | "maestro";

/** Media toko yang diunggah ke Vercel Blob: foto sampul & stempel otentikasi. */
export type MediaToko = "foto" | "stempel";

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
  /** Belum disimpan oleh API (frontend dulu) — bisa kosong. */
  fasilitas?: string[];
}

export type TokoFormValues = { fasilitas: string[] } & Pick<
  Toko,
  | "nama"
  | "pemilik"
  | "tahunBerdiri"
  | "kategori"
  | "deskripsi"
  | "wilayah"
  | "alamat"
  | "koordinat"
  | "whatsapp"
  | "jamBuka"
  | "aktifPublik"
  | "akreditasi"
>;

export interface RingkasanToko {
  total: number;
  terverifikasi: number;
  menunggu: number;
  nonaktif: number;
  katalogAktif: number;
}

export interface PengajuanToko {
  slug: string;
  nama: string;
  lokasiGang: string;
  pengrajin: string;
  keahlian: string;
  foto: string;
  /** ISO 8601 — awal hitung mundur verifikasi. */
  diajukanPada: string;
  /** ISO 8601 — diajukanPada + 3×24 jam. Lewat dari ini pengajuan otomatis dinonaktifkan. */
  batasWaktu: string;
  status: "menunggu" | "kedaluwarsa";
}

export type StatusProduk = "tersedia" | "habis" | "preorder";

export interface Produk {
  id: number;
  nama: string;
  sku: string;
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

export interface KategoriProduk {
  nama: string;
  jumlah: number;
}

export interface RingkasanProduk {
  totalKoleksi: number;
  pengrajin: number;
  stokTersedia: number;
  preOrder: number;
  habis: number;
  suhuBakar: string;
}

/** Body POST /produk (formulir Tambah Produk). */
export interface ProdukFormValues {
  tokoSlug: string;
  nama: string;
  kategori: string;
  teknik: string;
  bahan: string;
  harga: number;
  catatanHarga: string;
  status: StatusProduk;
  stok: number;
  lokasiStok: string;
  badge: string;
}

export type PeranAkun = "Pemilik Toko" | "Staf Pengrajin";
export type StatusAkun = "aktif" | "menunggu" | "ditangguhkan";

export interface Akun {
  id: number;
  nama: string;
  inisial: string;
  nik: string;
  email: string;
  toko: string;
  lokasi: string;
  peran: PeranAkun;
  whatsapp: string;
  status: StatusAkun;
  terakhirAktif: string;
  tone: Tone;
  /** Diisi saat pendaftaran mandiri; akun dari data awal boleh kosong. */
  umur?: number | null;
}

/** Body POST /auth/login. `identifier` = email ATAU username. */
export interface LoginPayload {
  identifier: string;
  password: string;
  remember: boolean;
}

/** `data` dari POST /auth/login: token sesi opaque (disimpan server Next.js sebagai cookie HttpOnly). */
export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AdminUser;
}

/** `data` dari POST /auth/register — akun baru selalu menunggu aktivasi admin. */
export interface RegisterResponse {
  id: number;
  nama: string;
  username: string;
  email: string;
  status: "menunggu";
}

/** Rincian error per field dari API (422 validasi / 409 data sudah terdaftar). */
export interface FieldErrorDetail {
  field: string;
  message: string;
}

/** Body POST /auth/register (pendaftaran mandiri pengrajin). */
export interface RegisterPayload {
  nama: string;
  umur: number;
  nik: string;
  whatsapp: string;
  toko: string;
  lokasi: string;
  peran: PeranAkun;
  username: string;
  email: string;
  password: string;
}

export interface RingkasanAkun {
  total: number;
  aktif: number;
  menunggu: number;
  sesiHariIni: number;
  tokoAktif: number;
  persenAktifPekan: number;
}

export interface StatistikDashboard {
  nilai: number;
  catatan: string;
  lencana: string;
}

export interface DashboardData {
  admin: AdminUser;
  tanggal: string;
  statistik: Record<"toko" | "produk" | "pengrajin" | "reservasi", StatistikDashboard>;
  verifikasi: {
    pengajuan: PengajuanToko[];
    terakhirDisetujui: { nama: string; catatan: string };
    totalPendaftarTahunIni: number;
  };
  whatsapp: {
    totalKlik: number;
    pertumbuhan: number;
    harian: { hari: string; nilai: number; sorot?: "primary" | "secondary" }[];
    gang: { nama: string; klik: number; persen: number; tone: Tone }[];
  };
  kelasAkhirPekan: { judul: string; catatan: string };
}

export interface LaporanData {
  periode: string;
  ringkasan: {
    totalWisatawan: { nilai: number; pertumbuhan: number; pembanding: string };
    workshopSelesai: { nilai: number; mendatang: number; okupansi: number };
    estimasiOmzet: { nilai: string; pertumbuhan: number; keterangan: string };
    konversiWhatsapp: { nilai: number; perHari: number; keterangan: string };
  };
  tren: { label: string; sekolah: number; mandiri: number; catatan?: string; parsial?: boolean }[];
  sebaranLorong: { nama: string; persen: number; detail: string; tone: Tone }[];
  reservasi: {
    id: string;
    pemesan: string;
    detail: string;
    paket: string;
    paketTone: Tone;
    studio: string;
    tanggal: string;
    jam: string;
  }[];
  paketTerlaris: {
    rating: string;
    daftar: { nama: string; detail: string; tren: "naik" | "stabil" }[];
  };
  unduhan: { judul: string; detail: string; jenis: "kas" | "sertifikat" | "rekap" }[];
}

/** Baris audit log yang sudah diterjemahkan backend menjadi kalimat (utils/aktivitas.ts). */
export interface AktivitasAudit {
  id: string;
  jenis: "produk" | "toko" | "akun" | "verifikasi";
  judul: string;
  keterangan: string;
  oleh: string;
  waktu: string;
}

/** GET /beranda — Dashboard Toko (khusus toko milik pengguna). */
export interface KelengkapanToko {
  persen: number;
  selesai: number;
  total: number;
  item: { label: string; ok: boolean; href: string; saran: string }[];
}

export type StatusTahapan = "selesai" | "berjalan" | "menunggu" | "terhenti";

export interface BerandaToko {
  slug: string;
  nama: string;
  foto: string;
  lokasiGang: string;
  alamat: string;
  spesialisasi: string;
  kategori: string[];
  jamBuka: string;
  whatsapp: string;
  tahunBerdiri: number;
  status: StatusToko;
  badge: BadgeToko | null;
  akreditasi: boolean;
  aktifPublik: boolean;
  jumlahProduk: number;
  diperbarui: string;
  kelengkapan: KelengkapanToko;
  tahapan: { label: string; keterangan: string; status: StatusTahapan }[];
}

export interface BerandaData {
  pengguna: { nama: string; sapaan: string; peran: string };
  salam: string;
  tanggal: string;
  toko: BerandaToko[];
  produk: RingkasanProduk & { termurah: number; termahal: number; rataRata: number; nilaiKatalog: number };
  kategori: KategoriProduk[];
  produkTerbaru: Produk[];
  perluPerhatian: Produk[];
  langkahBerikutnya: { label: string; toko: string; href: string }[];
  aktivitas: AktivitasAudit[];
  agenda: { tanggal: string; judul: string; lokasi: string; jenis: "kurasi" | "pelatihan" | "festival" | "rapat" }[];
  performa: {
    sumber: "simulasi" | "pelacakan";
    tujuhHari: { hari: string; kunjungan: number; klikWhatsapp: number }[];
    kunjungan: number;
    klikWhatsapp: number;
    konversi: number;
    reservasi: number;
    rating: number;
    jumlahUlasan: number;
    pertumbuhan: number;
  };
}

export type PeriodeLaporan = 7 | 30 | 90;

/** GET /laporan-toko — angka kunjungan masih simulasi (`sumber`), daftar toko & produk asli. */
export interface LaporanTokoData {
  sumber: "simulasi" | "pelacakan";
  periode: PeriodeLaporan;
  periodeLabel: string;
  ringkasan: {
    kunjungan: { nilai: number; pertumbuhan: number; rataHarian: number };
    klikWhatsapp: { nilai: number; konversi: number };
    reservasi: { nilai: number; peserta: number };
    produkDilihat: { nilai: number };
    transaksi: { nilai: number; estimasiOmzet: number };
    rating: { nilai: number; ulasan: number };
  };
  tren: { label: string; kunjungan: number; klikWhatsapp: number }[];
  jamRamai: { slot: string[]; baris: { hari: string; nilai: number[] }[] };
  corong: { tahap: string; nilai: number }[];
  sumberPengunjung: { nama: string; persen: number }[];
  asalPengunjung: { nama: string; persen: number }[];
  banding: {
    konversiToko: number;
    konversiSentra: number;
    kunjunganHarianToko: number;
    kunjunganHarianSentra: number;
    ratingToko: number;
    ratingSentra: number;
  };
  perToko: { slug: string; nama: string; lokasiGang: string; kunjungan: number; klikWhatsapp: number; reservasi: number; pertumbuhan: number }[];
  produkPopuler: { id: number; nama: string; foto: string; kategori: string; harga: number; dilihat: number; tanyaWhatsapp: number }[];
  reservasi: {
    id: string;
    pemesan: string;
    detail: string;
    paket: string;
    toko: string;
    tanggal: string;
    jam: string;
    nilai: number;
    status: "selesai" | "terjadwal" | "menunggu";
  }[];
  ulasan: { nama: string; asal: string; teks: string; rating: number; tanggal: string }[];
}

/** GET /produk/harga-pasar — acuan harga per kategori (agregat seluruh sentra). */
export interface HargaPasar {
  kategori: string;
  jumlah: number;
  termurah: number;
  termahal: number;
  rataRata: number;
}

/** GET /auth/profil — Profil & Keamanan Akun. */
export interface SesiAktif {
  id: string;
  perangkat: string;
  ipAddress: string | null;
  dibuat: string;
  berakhir: string;
  sesiIni: boolean;
}

export interface ProfilData {
  nama: string;
  sapaan: string;
  email: string;
  username: string;
  peran: string;
  role: Role;
  terakhirLogin: string | null;
  akun: { nik: string; whatsapp: string; toko: string; lokasi: string; peran: PeranAkun; status: StatusAkun } | null;
  toko: { slug: string; nama: string }[];
  statistik: { jumlahToko: number; jumlahProduk: number; totalAktivitas: number; jumlahSesi: number };
  keamanan: { skor: number; passwordTerakhir: string | null; pemeriksaan: { label: string; ok: boolean; saran: string }[] };
  aktivitas: AktivitasAudit[];
  sesi: SesiAktif[];
}

/* Data statis frontend (lihat src/data) — menunggu endpoint audit log di Express. */

export type JenisAktivitas = "toko" | "produk" | "akun" | "verifikasi" | "reservasi";

export interface Aktivitas {
  id: string;
  jenis: JenisAktivitas;
  judul: string;
  detail: string;
  pelaku: string;
  waktu: string;
}

export type JenisRiwayatAkun = "login" | "gagal" | "status" | "sandi";

export interface RiwayatAkun {
  id: string;
  jenis: JenisRiwayatAkun;
  akun: string;
  toko: string;
  keterangan: string;
  perangkat: string;
  waktu: string;
}

/**
 * Format respons standar dari Express:
 *   sukses → { success: true, message?, data, meta? }
 *   gagal  → { success: false, message, error: { code, details? }, meta: { requestId, timestamp } }
 */
export interface ApiResponse<T, M = undefined> {
  success: boolean;
  data: T;
  message?: string;
  meta: M;
}
