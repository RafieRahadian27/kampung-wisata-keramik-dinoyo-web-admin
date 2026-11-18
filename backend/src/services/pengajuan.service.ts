import { isDuplicateEntry, prisma, withTransaction } from "../lib/prisma";
import { auditRepository } from "../repositories/audit.repository";
import { pengajuanRepository } from "../repositories/pengajuan.repository";
import { tokoRepository } from "../repositories/toko.repository";
import { BATAS_PENGAJUAN_JAM, isPengajuanKedaluwarsa, toPengajuan } from "../models";
import type { AdminUser, Pengajuan, TokoInput } from "../types";
import { HttpError } from "../utils/httpError";

export type Keputusan = "verifikasi" | "tolak";

/** Data awal toko yang lahir dari pengajuan yang disetujui. */
function tokoDariPengajuan(p: Pengajuan): TokoInput {
  return {
    nama: p.nama,
    nib: "-",
    keterangan: "Diverifikasi dari pengajuan",
    pemilik: p.pengrajin,
    whatsapp: "-",
    lokasiGang: p.lokasiGang,
    wilayah: p.lokasiGang,
    alamat: "",
    koordinat: "",
    spesialisasi: p.keahlian,
    kategori: [],
    jumlahProduk: 0,
    tahunBerdiri: new Date().getFullYear(),
    deskripsi: `Keahlian: ${p.keahlian}.`,
    jamBuka: "-",
    status: "terverifikasi",
    badge: "baru",
    foto: p.foto,
    aktifPublik: true,
    akreditasi: true,
  };
}

const pengajuanKedaluwarsa = () =>
  new HttpError(409, `Pengajuan sudah melewati batas verifikasi ${BATAS_PENGAJUAN_JAM} jam dan dinonaktifkan. Pengrajin perlu mengajukan ulang.`, {
    code: "PENGAJUAN_KEDALUWARSA",
  });

export const pengajuanService = {
  /** Tandai yang lewat batas lebih dulu, baru baca antrean — status yang dikirim selalu terkini. */
  async findAll(): Promise<Pengajuan[]> {
    await pengajuanRepository.expireOverdue(prisma);
    return pengajuanRepository.findAll(prisma);
  },

  /**
   * Skenario multi-langkah dalam SATU transaksi:
   *   1. kunci baris pengajuan (FOR UPDATE) — dua admin tidak bisa memutuskan bersamaan
   *   2. cek batas waktu: pengajuan kedaluwarsa TIDAK boleh diverifikasi (hanya boleh ditolak/dibersihkan)
   *   3. verifikasi → INSERT toko baru ke direktori
   *   4. DELETE pengajuan
   *   5. INSERT audit log
   * Jika langkah 3 gagal (mis. nama toko sudah ada), langkah 4 & 5 ikut di-ROLLBACK:
   * pengajuan tidak hilang tanpa tokonya tercatat.
   */
  async putuskan(user: AdminUser, slug: string, keputusan: Keputusan) {
    try {
      const hasil = await withTransaction(async (tx) => {
        const pengajuan = await pengajuanRepository.lockBySlug(tx, slug);
        if (!pengajuan) throw new HttpError(404, "Pengajuan tidak ditemukan");
        const { id, ...row } = pengajuan;
        const data = toPengajuan(row);

        if (keputusan === "verifikasi" && isPengajuanKedaluwarsa(row)) {
          // Status kedaluwarsa disimpan (transaksi di-commit), error dilempar SETELAH transaksi selesai.
          if (row.status !== "kedaluwarsa") await pengajuanRepository.markKedaluwarsa(tx, id);
          return { kedaluwarsa: true as const };
        }

        if (keputusan === "verifikasi") await tokoRepository.insert(tx, slug, tokoDariPengajuan(data));
        await pengajuanRepository.remove(tx, id);
        await auditRepository.insert(tx, { userId: user.id, aksi: `pengajuan:${keputusan}`, target: data.nama });
        return { ...data, keputusan };
      });
      if ("kedaluwarsa" in hasil) throw pengajuanKedaluwarsa();
      return hasil;
    } catch (error) {
      if (isDuplicateEntry(error)) throw new HttpError(409, "Toko dengan nama ini sudah ada di direktori. Pengajuan tidak diproses.");
      throw error;
    }
  },
};
