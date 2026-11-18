import type { Prisma } from "../generated/prisma/client";
import { type Db, lockRow } from "../lib/prisma";
import { BATAS_PENGAJUAN_MS, type Pengajuan, type PengajuanRow, toPengajuan } from "../models";

const PENGAJUAN_SELECT = {
  slug: true,
  nama: true,
  lokasiGang: true,
  pengrajin: true,
  keahlian: true,
  foto: true,
  diajukanPada: true,
  status: true,
} satisfies Prisma.PengajuanSelect;

export const pengajuanRepository = {
  /**
   * Tandai `kedaluwarsa` semua pengajuan yang lewat batas 3×24 jam (lazy expiry).
   * Dipanggil sebelum antrean dibaca, sehingga status di database selalu sesuai tanpa cron job.
   * Index `idx_pengajuan_status (status, diajukan_pada)` membuat UPDATE ini tidak memindai seluruh tabel.
   */
  async expireOverdue(db: Db, now = new Date()): Promise<number> {
    const { count } = await db.pengajuan.updateMany({
      where: { status: "menunggu", diajukanPada: { lte: new Date(now.getTime() - BATAS_PENGAJUAN_MS) } },
      data: { status: "kedaluwarsa" },
    });
    return count;
  },

  /** Yang masih menunggu didahulukan (paling mendesak = paling lama diajukan), lalu yang kedaluwarsa. */
  async findAll(db: Db, now = new Date()): Promise<Pengajuan[]> {
    const rows: PengajuanRow[] = await db.pengajuan.findMany({ select: PENGAJUAN_SELECT, orderBy: [{ status: "asc" }, { diajukanPada: "asc" }] });
    return rows.map((row) => toPengajuan(row, now));
  },

  async lockBySlug(tx: Prisma.TransactionClient, slug: string) {
    const row = await tx.pengajuan.findUnique({ where: { slug }, select: { id: true } });
    if (!row || !(await lockRow(tx, "pengajuan", row.id))) return undefined;
    // Dibaca ulang setelah terkunci agar isinya pasti versi terbaru.
    const pengajuan = await tx.pengajuan.findUnique({ where: { id: row.id }, select: { id: true, ...PENGAJUAN_SELECT } });
    return pengajuan ?? undefined;
  },

  async markKedaluwarsa(db: Db, id: number) {
    await db.pengajuan.update({ where: { id }, data: { status: "kedaluwarsa" } });
  },

  async remove(db: Db, id: number) {
    await db.pengajuan.delete({ where: { id } });
  },
};
