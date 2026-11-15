import { isDuplicateEntry, prisma, withTransaction } from "../lib/prisma";
import { auditRepository } from "../repositories/audit.repository";
import { pengajuanRepository } from "../repositories/pengajuan.repository";
import { tokoRepository } from "../repositories/toko.repository";
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

export const pengajuanService = {
  findAll(): Promise<Pengajuan[]> {
    return pengajuanRepository.findAll(prisma);
  },

  /**
   * Skenario multi-langkah dalam SATU transaksi:
   *   1. kunci baris pengajuan (FOR UPDATE) — dua admin tidak bisa memutuskan bersamaan
   *   2. verifikasi → INSERT toko baru ke direktori
   *   3. DELETE pengajuan
   *   4. INSERT audit log
   * Jika langkah 2 gagal (mis. nama toko sudah ada), langkah 3 & 4 ikut di-ROLLBACK:
   * pengajuan tidak hilang tanpa tokonya tercatat.
   */
  async putuskan(user: AdminUser, slug: string, keputusan: Keputusan) {
    try {
      return await withTransaction(async (tx) => {
        const pengajuan = await pengajuanRepository.lockBySlug(tx, slug);
        if (!pengajuan) throw new HttpError(404, "Pengajuan tidak ditemukan");
        const { id, ...data } = pengajuan;

        if (keputusan === "verifikasi") await tokoRepository.insert(tx, slug, tokoDariPengajuan(data));
        await pengajuanRepository.remove(tx, id);
        await auditRepository.insert(tx, { userId: user.id, aksi: `pengajuan:${keputusan}`, target: data.nama });
        return { ...data, keputusan };
      });
    } catch (error) {
      if (isDuplicateEntry(error)) throw new HttpError(409, "Toko dengan nama ini sudah ada di direktori. Pengajuan tidak diproses.");
      throw error;
    }
  },
};
