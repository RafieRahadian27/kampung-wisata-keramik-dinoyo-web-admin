import { NAMA_PRODUK_PATTERN } from "@/lib/validation/text";
import type { ProdukFormValues, StatusProduk } from "@/types";

export type ProdukFormErrors = Partial<Record<keyof ProdukFormValues, string>>;

export const STATUS_PRODUK_OPTIONS: { value: StatusProduk; label: string; hint: string }[] = [
  { value: "tersedia", label: "Tersedia", hint: "Siap dibeli di galeri" },
  { value: "preorder", label: "Pre-order", hint: "Dibuat sesuai pesanan" },
  { value: "habis", label: "Stok Habis", hint: "Tetap tampil di katalog" },
];

/**
 * Teknik pembuatan resmi — HARUS sama dengan `TEKNIK_PEMBUATAN` di backend/src/models/produk.model.ts
 * (Express menolak nilai di luar daftar ini). Ditampilkan sebagai dropdown Select shadcn.
 */
export const TEKNIK_OPTIONS = [
  { value: "Putar Tangan", label: "Putar Tangan", description: "Dibentuk di atas meja putar (perbot)" },
  { value: "Hand Built Coiling", label: "Hand Built Coiling", description: "Pilinan tanah liat disusun melingkar" },
  { value: "Cetak Tuang (Slip Casting)", label: "Cetak Tuang (Slip Casting)", description: "Tanah cair dituang ke cetakan gips" },
  { value: "Cetak Tekan (Press Mold)", label: "Cetak Tekan (Press Mold)", description: "Lempeng tanah ditekan ke cetakan" },
  { value: "Cetak Padat & Ukir Tangan", label: "Cetak Padat & Ukir Tangan", description: "Dicetak lalu diukir manual" },
  { value: "Pinching", label: "Pinching", description: "Dipijit dari bola tanah liat" },
  { value: "Slab Building", label: "Slab Building", description: "Lembaran tanah dipotong & disambung" },
  { value: "Ukir Manual", label: "Ukir Manual", description: "Relief/ukiran langsung pada badan keramik" },
  { value: "Lukis Tangan Halus", label: "Lukis Tangan Halus", description: "Motif dilukis tangan sebelum dibakar" },
  { value: "Glasir Celup", label: "Glasir Celup", description: "Pewarnaan dengan mencelup ke glasir" },
];
const TEKNIK_VALID = new Set(TEKNIK_OPTIONS.map((item) => item.value));

export const BAHAN_SARAN = ["High-fired Stoneware", "Earthenware Granular", "Semi-Porselen", "Porselen Halus", "Terakota Lokal"];
export const LABEL_SARAN = ["", "Best Seller", "Edisi Terbatas", "Karya Maestro", "Baru"];

/** Label kolom untuk ringkasan error di atas formulir. */
export const LABEL_KOLOM: Record<keyof ProdukFormValues, string> = {
  tokoSlug: "Toko pemilik",
  nama: "Nama produk",
  kategori: "Kategori",
  teknik: "Teknik pembuatan",
  bahan: "Bahan",
  harga: "Harga jual",
  catatanHarga: "Catatan harga",
  status: "Status stok",
  stok: "Jumlah stok",
  lokasiStok: "Lokasi stok",
  badge: "Label etalase",
};

export function emptyProdukForm(tokoSlug: string, kategori: string): ProdukFormValues {
  return {
    tokoSlug,
    nama: "",
    kategori,
    teknik: "",
    bahan: "",
    harga: 0,
    catatanHarga: "",
    status: "tersedia",
    stok: 0,
    lokasiStok: "",
    badge: "",
  };
}

/** Aturan sama dengan `produkSchema` di backend — di sini untuk umpan balik langsung per kolom. */
export function validateProdukForm(values: ProdukFormValues): ProdukFormErrors {
  const errors: ProdukFormErrors = {};
  const nama = values.nama.trim();
  const bahan = values.bahan.trim();
  const lokasi = values.lokasiStok.trim();

  if (!values.tokoSlug) errors.tokoSlug = "Pilih toko pemilik produk.";

  if (!nama) errors.nama = "Nama produk wajib diisi.";
  else if (nama.length < 3) errors.nama = "Nama produk minimal 3 karakter.";
  else if (nama.length > 120) errors.nama = "Nama produk maksimal 120 karakter.";
  else if (!NAMA_PRODUK_PATTERN.test(nama)) errors.nama = "Hanya huruf, angka, spasi, dan tanda baca sederhana (. , - & ( ) / ').";

  if (!values.kategori) errors.kategori = "Pilih kategori produk.";
  if (!values.teknik) errors.teknik = "Pilih teknik pembuatan.";
  else if (!TEKNIK_VALID.has(values.teknik)) errors.teknik = "Teknik tidak ada di daftar resmi paguyuban.";

  if (!bahan) errors.bahan = "Bahan wajib diisi.";
  else if (bahan.length < 3) errors.bahan = "Bahan minimal 3 karakter.";
  else if (bahan.length > 80) errors.bahan = "Bahan maksimal 80 karakter.";
  else if (!NAMA_PRODUK_PATTERN.test(bahan)) errors.bahan = "Bahan hanya boleh huruf, angka, spasi, dan tanda baca sederhana.";

  if (!values.harga) errors.harga = "Harga jual wajib diisi.";
  else if (!Number.isInteger(values.harga) || values.harga < 1000) errors.harga = "Harga minimal Rp 1.000.";
  else if (values.harga > 100_000_000) errors.harga = "Harga maksimal Rp 100.000.000.";

  if (!Number.isInteger(values.stok) || values.stok < 0) errors.stok = "Stok harus bilangan bulat 0 atau lebih.";
  else if (values.stok > 100_000) errors.stok = "Stok maksimal 100.000.";
  else if (values.status === "tersedia" && values.stok === 0) errors.stok = "Isi jumlah stok, atau ubah status menjadi Pre-order/Habis.";

  if (!lokasi) errors.lokasiStok = "Lokasi stok wajib diisi (mis. Rak A-12 Galeri).";
  else if (lokasi.length < 2) errors.lokasiStok = "Lokasi stok minimal 2 karakter.";

  if (values.catatanHarga.length > 80) errors.catatanHarga = "Catatan harga maksimal 80 karakter.";
  return errors;
}
