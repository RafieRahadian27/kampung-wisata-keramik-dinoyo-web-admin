import type { Toko, TokoFormValues } from "@/types";
import { validateNamaPengrajin } from "@/lib/validation/text";
import { parseKoordinat } from "../peta/titikToko";

export const KATEGORI_SPESIALISASI = ["Semi-Porselen", "Gerabah Alami", "Guci & Hiasan", "Tableware Kafe", "Edukasi Workshop"] as const;

export const WILAYAH_LORONG = [
  "Jl. MT Haryono Gg. IX (Sentra Pembakaran Putar)",
  "Gg. X (Gerabah Alami & Tungku)",
  "Gg. II & IV (Suvenir & Custom)",
  "Koridor Jl. MT Haryono (Depan)",
];

export const JAM_BUKA_PRESET = ["Senin - Minggu, 09.00 - 17.00", "Senin - Sabtu, 08.00 - 16.00", "Sabtu - Minggu, 09.00 - 15.00"];

export const FASILITAS_STUDIO = [
  "Workshop Putar Tanah Liat",
  "Kelas Lukis Keramik",
  "Area Parkir Bus",
  "Pembayaran QRIS",
  "Pengiriman Luar Kota",
  "Toilet & Musala",
] as const;

export const MAX_NAMA = 60;
export const MAX_DESKRIPSI = 600;

export const EMPTY_TOKO_FORM: TokoFormValues = {
  nama: "",
  pemilik: "",
  tahunBerdiri: new Date().getFullYear(),
  kategori: [],
  deskripsi: "",
  wilayah: WILAYAH_LORONG[0],
  alamat: "",
  koordinat: "-7.9421, 112.6087",
  whatsapp: "",
  jamBuka: JAM_BUKA_PRESET[0],
  fasilitas: [],
  aktifPublik: true,
  akreditasi: false,
};

export function toFormValues(toko: Toko): TokoFormValues {
  return {
    nama: toko.nama,
    pemilik: toko.pemilik,
    tahunBerdiri: toko.tahunBerdiri,
    kategori: toko.kategori,
    deskripsi: toko.deskripsi,
    wilayah: toko.wilayah,
    alamat: toko.alamat,
    koordinat: toko.koordinat,
    // Data lama bisa berformat "+62 812-3341-9081" → ditampilkan & disimpan ulang sebagai digit saja.
    whatsapp: toko.whatsapp.replace(/\D/g, ""),
    jamBuka: toko.jamBuka,
    fasilitas: toko.fasilitas ?? [],
    aktifPublik: toko.aktifPublik,
    akreditasi: toko.akreditasi,
  };
}

export type TokoFormErrors = Partial<Record<keyof TokoFormValues, string>>;

export function validateTokoForm(values: TokoFormValues): TokoFormErrors {
  const errors: TokoFormErrors = {};
  const tahunSekarang = new Date().getFullYear();

  if (!values.nama.trim()) errors.nama = "Nama toko wajib diisi.";
  else if (values.nama.length > MAX_NAMA) errors.nama = `Maksimal ${MAX_NAMA} karakter.`;
  const errorPemilik = validateNamaPengrajin(values.pemilik);
  if (errorPemilik) errors.pemilik = errorPemilik;
  if (!values.tahunBerdiri || values.tahunBerdiri < 1900 || values.tahunBerdiri > tahunSekarang) {
    errors.tahunBerdiri = `Isi tahun antara 1900–${tahunSekarang}.`;
  }
  if (values.kategori.length === 0) errors.kategori = "Pilih minimal satu spesialisasi.";
  const wa = values.whatsapp.trim();
  if (!wa) errors.whatsapp = "Nomor WhatsApp wajib diisi.";
  else if (/\D/.test(wa)) errors.whatsapp = "Nomor WhatsApp hanya boleh berisi angka.";
  else if (!/^(?:62|0)8/.test(wa)) errors.whatsapp = "Nomor WhatsApp harus diawali 08 atau 628.";
  else if (wa.length < 10 || wa.length > 14) errors.whatsapp = "Nomor WhatsApp harus 10–14 digit.";
  if (!values.jamBuka.trim()) errors.jamBuka = "Jam operasional wajib diisi.";
  if (!values.wilayah) errors.wilayah = "Pilih wilayah lorong.";
  if (values.koordinat.trim() && !parseKoordinat(values.koordinat)) errors.koordinat = "Koordinat harus berformat 'lat, lng', mis. -7.942100, 112.608700.";
  if (values.alamat.length > 200) errors.alamat = "Alamat maksimal 200 karakter.";
  return errors;
}
