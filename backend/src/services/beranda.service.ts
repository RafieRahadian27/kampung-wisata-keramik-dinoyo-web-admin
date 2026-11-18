import { prisma } from "../lib/prisma";
import { auditRepository } from "../repositories/audit.repository";
import { produkRepository } from "../repositories/produk.repository";
import { tokoRepository } from "../repositories/toko.repository";
import type { AdminUser, Produk, Toko } from "../types";
import { toAktivitas } from "../utils/aktivitas";
import { acak, antara, seriTujuhHari } from "./simulasi";

const FOTO_BAWAAN = "/images/sampul-galeri.jpg";

const formatTanggal = (date: Date) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date);

/** Sapaan sesuai jam di Malang (WIB). */
function salamWaktu(date: Date) {
  const jam = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "numeric", hour12: false }).format(date));
  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 18) return "Selamat sore";
  return "Selamat malam";
}

/**
 * Daftar periksa kelengkapan profil toko — dihitung dari kolom toko yang sudah ada, lengkap
 * dengan tautan perbaikannya, sehingga pengrajin tahu persis apa yang harus dilakukan.
 */
function kelengkapan(toko: Toko) {
  const edit = `/toko/${toko.slug}`;
  const item = [
    { label: "Foto sampul toko", ok: toko.foto !== FOTO_BAWAAN, href: edit, saran: "Unggah foto sampul workshop/galeri" },
    { label: "Stempel otentikasi kriya", ok: Boolean(toko.stempel), href: edit, saran: "Unggah stempel monogram toko" },
    { label: "Deskripsi toko (min. 50 karakter)", ok: toko.deskripsi.trim().length >= 50, href: edit, saran: "Ceritakan sejarah & keahlian studio" },
    { label: "Alamat lengkap", ok: toko.alamat.trim() !== "", href: edit, saran: "Lengkapi alamat agar mudah ditemukan" },
    { label: "Kategori spesialisasi", ok: toko.kategori.length > 0, href: edit, saran: "Pilih kategori spesialisasi" },
    { label: "Minimal satu produk di katalog", ok: toko.jumlahProduk > 0, href: "/produk/tambah", saran: "Tambahkan produk pertama" },
    { label: "Tampil di direktori publik", ok: toko.aktifPublik, href: edit, saran: "Aktifkan tampilan di direktori" },
  ];
  const selesai = item.filter((entry) => entry.ok).length;
  return { persen: Math.round((selesai / item.length) * 100), selesai, total: item.length, item };
}

/** Tahapan perjalanan toko di paguyuban: daftar → verifikasi → akreditasi → tampil publik. */
function tahapan(toko: Toko) {
  return [
    { label: "Pendaftaran", keterangan: "Data toko tercatat", status: "selesai" as const },
    {
      label: "Verifikasi Berkas",
      keterangan: toko.status === "terverifikasi" ? "Lolos verifikasi paguyuban" : toko.status === "menunggu" ? "Sedang ditinjau admin" : "Toko dinonaktifkan",
      status: toko.status === "terverifikasi" ? ("selesai" as const) : toko.status === "menunggu" ? ("berjalan" as const) : ("terhenti" as const),
    },
    {
      label: "Akreditasi Kriya",
      keterangan: toko.akreditasi ? "Keaslian karya diakui" : "Menunggu kurasi kuartal",
      status: toko.akreditasi ? ("selesai" as const) : toko.status === "terverifikasi" ? ("berjalan" as const) : ("menunggu" as const),
    },
    {
      label: "Tampil Publik",
      keterangan: toko.aktifPublik ? "Terlihat di direktori" : "Belum ditampilkan",
      status: toko.aktifPublik ? ("selesai" as const) : ("menunggu" as const),
    },
  ];
}

function statistikHarga(produk: Produk[]) {
  if (produk.length === 0) return { termurah: 0, termahal: 0, rataRata: 0, nilaiKatalog: 0 };
  const harga = produk.map((item) => item.harga);
  const total = harga.reduce((sum, value) => sum + value, 0);
  return { termurah: Math.min(...harga), termahal: Math.max(...harga), rataRata: Math.round(total / harga.length), nilaiKatalog: total };
}

/** Agenda paguyuban (konten tetap dari sekretariat — belum ada tabel agenda). */
const AGENDA = [
  { tanggal: "2026-11-22", judul: "Kurasi Akreditasi Kuartal IV", lokasi: "Balai Paguyuban Dinoyo", jenis: "kurasi" },
  { tanggal: "2026-11-29", judul: "Pelatihan Foto Produk dengan Ponsel", lokasi: "Galeri Sentra Gang IX", jenis: "pelatihan" },
  { tanggal: "2026-12-06", judul: "Festival Keramik Dinoyo 2026", lokasi: "Jl. MT Haryono, Malang", jenis: "festival" },
  { tanggal: "2026-12-13", judul: "Rapat Evaluasi Retribusi & Kas", lokasi: "Sekretariat Paguyuban", jenis: "rapat" },
];

/** Dashboard Toko — ringkasan khusus toko milik pengguna (seluruh query dibatasi ABAC `tokoScope`). */
export const berandaService = {
  async ringkasan(user: AdminUser) {
    const [toko, produk, ringkasanProduk, kategori] = await Promise.all([
      tokoRepository.findMany(prisma, user),
      produkRepository.findMany(prisma, user),
      produkRepository.ringkasan(prisma, user),
      produkRepository.kategori(prisma, user),
    ]);
    const aktivitas = await auditRepository.recentFor(
      prisma,
      user.id,
      toko.flatMap((item) => [item.slug, item.nama]),
      8,
    );

    const now = new Date();
    const tujuhHari = seriTujuhHari(toko);
    const rand = acak(user.id * 4447 + toko.length);
    const totalKunjungan = tujuhHari.reduce((sum, item) => sum + item.kunjungan, 0);
    const totalKlik = tujuhHari.reduce((sum, item) => sum + item.klikWhatsapp, 0);

    const langkah = toko.flatMap((item) =>
      kelengkapan(item)
        .item.filter((entry) => !entry.ok)
        .map((entry) => ({ label: entry.saran, toko: item.nama, href: entry.href })),
    );
    if (ringkasanProduk.habis > 0) {
      langkah.unshift({ label: `Perbarui stok ${ringkasanProduk.habis} produk yang habis`, toko: "Katalog", href: "/produk" });
    }

    return {
      pengguna: { nama: user.nama, sapaan: user.sapaan, peran: user.peran },
      salam: salamWaktu(now),
      tanggal: formatTanggal(now),
      toko: toko.map((item) => ({
        slug: item.slug,
        nama: item.nama,
        foto: item.foto,
        lokasiGang: item.lokasiGang,
        alamat: item.alamat,
        spesialisasi: item.spesialisasi,
        kategori: item.kategori,
        jamBuka: item.jamBuka,
        whatsapp: item.whatsapp,
        tahunBerdiri: item.tahunBerdiri,
        status: item.status,
        badge: item.badge ?? null,
        akreditasi: item.akreditasi,
        aktifPublik: item.aktifPublik,
        jumlahProduk: item.jumlahProduk,
        diperbarui: item.diperbarui,
        kelengkapan: kelengkapan(item),
        tahapan: tahapan(item),
      })),
      produk: { ...ringkasanProduk, ...statistikHarga(produk) },
      kategori: kategori.filter((item) => item.jumlah > 0),
      produkTerbaru: [...produk].sort((a, b) => b.id - a.id).slice(0, 6),
      perluPerhatian: produk.filter((item) => item.status !== "tersedia").slice(0, 5),
      langkahBerikutnya: langkah.slice(0, 5),
      aktivitas: aktivitas.map(toAktivitas),
      agenda: AGENDA,
      /** Angka performa masih simulasi (lihat services/simulasi.ts). */
      performa: {
        sumber: "simulasi" as const,
        tujuhHari,
        kunjungan: totalKunjungan,
        klikWhatsapp: totalKlik,
        konversi: totalKunjungan ? Math.round((totalKlik / totalKunjungan) * 1000) / 10 : 0,
        reservasi: toko.length ? antara(rand, 1, 4) * toko.length : 0,
        rating: toko.length ? Math.round((4.5 + rand() * 0.45) * 10) / 10 : 0,
        jumlahUlasan: toko.length ? antara(rand, 18, 64) : 0,
        pertumbuhan: Math.round((rand() * 26 - 4) * 10) / 10,
      },
    };
  },
};
