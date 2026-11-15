import { prisma, withTransaction } from "../lib/prisma";
import { auditRepository } from "../repositories/audit.repository";
import { type ProdukFilter, produkRepository } from "../repositories/produk.repository";
import { tokoRepository } from "../repositories/toko.repository";
import type { AdminUser, Produk } from "../types";
import { HttpError } from "../utils/httpError";

export type { ProdukFilter };

/** Sama seperti toko: query produk selalu dibatasi ke toko milik pengguna (ABAC). */
export const produkService = {
  findAll(user: AdminUser, filter: ProdukFilter = {}): Promise<Produk[]> {
    return produkRepository.findMany(prisma, user, filter);
  },

  kategori(user: AdminUser) {
    return produkRepository.kategori(prisma, user);
  },

  ringkasan(user: AdminUser) {
    return produkRepository.ringkasan(prisma, user);
  },

  /** Transaksi: hapus produk + kurangi jumlah produk di toko + catat audit. */
  async remove(user: AdminUser, id: number): Promise<void> {
    await withTransaction(async (tx) => {
      const produk = await produkRepository.lockById(tx, user, id);
      if (!produk) throw new HttpError(404, "Produk tidak ditemukan");
      await produkRepository.remove(tx, id);
      await tokoRepository.adjustJumlahProduk(tx, produk.tokoId, -1);
      await auditRepository.insert(tx, { userId: user.id, aksi: "produk:delete", target: String(id), detail: produk.nama });
    });
  },
};
