import { prisma } from "../lib/prisma";
import { auditRepository } from "../repositories/audit.repository";
import { pengajuanService } from "./pengajuan.service";
import { produkRepository } from "../repositories/produk.repository";
import { tokoRepository } from "../repositories/toko.repository";
import type { AdminUser } from "../types";
import { akunService } from "./akun.service";

const formatTanggal = (date: Date, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...options }).format(date);

export const dashboardService = {
  async ringkasan(admin: AdminUser) {
    /**
     * Asynchronous I/O: enam query independen dikirim BERSAMAAN lewat Promise.all.
     * Masing-masing meminjam koneksi berbeda dari prisma, sehingga total waktu tunggu
     * ≈ query paling lambat, bukan jumlah semuanya (seperti bila di-await satu per satu).
     */
    const [toko, produk, kategori, akun, pengajuan, terakhir] = await Promise.all([
      tokoRepository.ringkasan(prisma, admin),
      produkRepository.ringkasan(prisma, admin),
      produkRepository.kategori(prisma, admin),
      akunService.ringkasan(),
      pengajuanService.findAll(),
      auditRepository.latest(prisma, "pengajuan:verifikasi"),
    ]);

    return {
      admin,
      tanggal: formatTanggal(new Date(), { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      statistik: {
        toko: { nilai: toko.total, catatan: `${toko.menunggu} menunggu verifikasi berkas`, lencana: `+${pengajuan.filter((p) => p.status === "menunggu").length} baru` },
        produk: {
          nilai: produk.totalKoleksi,
          catatan: `Tersebar di ${kategori.length} kategori utama (${kategori.map((k) => k.nama).join(", ")})`,
          lencana: `${produk.stokTersedia} tersedia`,
        },
        pengrajin: { nilai: akun.total, catatan: `${akun.aktif} aktif mengelola etalase & reservasi mandiri`, lencana: "Terverifikasi" },
        reservasi: { nilai: 18, catatan: "7 kelas teknik putar & 11 kelas mewarnai", lencana: "Minggu Ini" },
      },
      verifikasi: {
        pengajuan,
        terakhirDisetujui: terakhir
          ? {
              nama: terakhir.target,
              catatan: `Diverifikasi oleh ${terakhir.oleh ?? "admin"} pada ${formatTanggal(terakhir.createdAt, { day: "numeric", month: "short", year: "numeric" })}`,
            }
          : { nama: "Keramik Barokah Jaya", catatan: "Diverifikasi oleh Pak Joko pada 22 Okt 2024" },
        totalPendaftarTahunIni: 30,
      },
      whatsapp: {
        totalKlik: 1480,
        pertumbuhan: 18.4,
        harian: [
          { hari: "Sen", nilai: 45 },
          { hari: "Sel", nilai: 60 },
          { hari: "Rab", nilai: 38 },
          { hari: "Kam", nilai: 65, sorot: "secondary" },
          { hari: "Jum", nilai: 52 },
          { hari: "Sab", nilai: 70, sorot: "primary" },
          { hari: "Min", nilai: 58 },
        ],
        gang: [
          { nama: "Gang 2 (Pusat Souvenir Dinoyo)", klik: 542, persen: 58, tone: "primary" },
          { nama: "Gang 4 (Sentra Vas & Guci Besar)", klik: 389, persen: 34, tone: "secondary" },
        ],
      },
      kelasAkhirPekan: {
        judul: "Kelas Keramik Akhir Pekan",
        catatan: "Slot terisi 85% untuk Sabtu & Minggu ini",
      },
    };
  },
};
