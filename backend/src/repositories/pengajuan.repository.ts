import type { Prisma } from "../generated/prisma/client";
import { type Db, lockRow } from "../lib/prisma";
import type { Pengajuan } from "../types";

const PENGAJUAN_SELECT = {
  slug: true,
  nama: true,
  lokasiGang: true,
  pengrajin: true,
  keahlian: true,
  diajukan: true,
  foto: true,
} satisfies Prisma.PengajuanSelect;

export const pengajuanRepository = {
  findAll(db: Db): Promise<Pengajuan[]> {
    return db.pengajuan.findMany({ select: PENGAJUAN_SELECT, orderBy: { id: "asc" } });
  },

  async lockBySlug(tx: Prisma.TransactionClient, slug: string) {
    const row = await tx.pengajuan.findUnique({ where: { slug }, select: { id: true } });
    if (!row || !(await lockRow(tx, "pengajuan", row.id))) return undefined;
    // Dibaca ulang setelah terkunci agar isinya pasti versi terbaru.
    const pengajuan = await tx.pengajuan.findUnique({ where: { id: row.id }, select: { id: true, ...PENGAJUAN_SELECT } });
    return pengajuan ?? undefined;
  },

  async remove(db: Db, id: number) {
    await db.pengajuan.delete({ where: { id } });
  },
};
