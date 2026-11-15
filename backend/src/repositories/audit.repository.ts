import type { Db } from "../lib/prisma";

export interface AuditEntry {
  userId: number | null;
  aksi: string;
  target: string;
  detail?: string;
}

/** Jejak audit selalu ditulis dengan klien transaksi yang sama dengan perubahan datanya. */
export const auditRepository = {
  async insert(db: Db, entry: AuditEntry) {
    await db.auditLog.create({
      data: { userId: entry.userId, aksi: entry.aksi, target: entry.target, detail: entry.detail ?? "", createdAt: new Date() },
    });
  },

  async latest(db: Db, aksi: string) {
    const row = await db.auditLog.findFirst({
      where: { aksi },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: { target: true, createdAt: true, user: { select: { sapaan: true } } },
    });
    return row ? { target: row.target, createdAt: row.createdAt, oleh: row.user?.sapaan ?? null } : undefined;
  },
};
