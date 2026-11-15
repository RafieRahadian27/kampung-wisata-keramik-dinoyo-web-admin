import { tokoScope } from "../auth/policy";
import type { Prisma } from "../generated/prisma/client";
import { type Db, likeSafe, lockRow } from "../lib/prisma";
import type { AdminUser, Produk } from "../types";

const PRODUK_INCLUDE = { toko: { select: { slug: true } } } satisfies Prisma.ProdukInclude;
type ProdukRow = Prisma.ProdukGetPayload<{ include: typeof PRODUK_INCLUDE }>;

/** Transformasi field: kolom datar toko_* dikelompokkan kembali menjadi objek `toko`. */
function toProduk(row: ProdukRow): Produk {
  return {
    id: row.id,
    nama: row.nama,
    sku: row.sku,
    tokoSlug: row.toko.slug,
    teknik: row.teknik,
    foto: row.foto,
    ...(row.badge ? { badge: row.badge } : {}),
    toko: { nama: row.tokoLabel, inisial: row.tokoInisial, pengrajin: row.pengrajin },
    kategori: row.kategori,
    bahan: row.bahan,
    harga: row.harga,
    catatanHarga: row.catatanHarga,
    status: row.status,
    stokLabel: row.stokLabel,
    lokasiStok: row.lokasiStok,
  };
}

export interface ProdukFilter {
  q?: string;
  kategori?: string;
  /** Nama toko seperti yang tampil di filter UI. */
  toko?: string;
  tokoSlug?: string;
}

/** Produk terlihat bila tokonya termasuk cakupan pengguna (ABAC). */
const scoped = (user: AdminUser): Prisma.ProdukWhereInput => ({ toko: tokoScope(user) });

export const produkRepository = {
  async findMany(db: Db, user: AdminUser, filter: ProdukFilter = {}): Promise<Produk[]> {
    const q = filter.q && likeSafe(filter.q);
    const where: Prisma.ProdukWhereInput = {
      AND: [
        scoped(user),
        q ? { OR: [{ nama: { contains: q } }, { sku: { contains: q } }] } : {},
        filter.kategori ? { kategori: filter.kategori } : {},
        filter.toko ? { tokoLabel: filter.toko } : {},
        filter.tokoSlug ? { toko: { slug: filter.tokoSlug } } : {},
      ],
    };
    const rows = await db.produk.findMany({ where, include: PRODUK_INCLUDE, orderBy: { id: "asc" } });
    return rows.map(toProduk);
  },

  /** Semua kategori master beserta jumlah produk yang terlihat oleh pengguna (0 bila kosong). */
  async kategori(db: Db, user: AdminUser) {
    const rows = await db.kategoriProduk.findMany({
      orderBy: { urutan: "asc" },
      select: { nama: true, _count: { select: { produk: { where: scoped(user) } } } },
    });
    return rows.map((row) => ({ nama: row.nama, jumlah: row._count.produk }));
  },

  async ringkasan(db: Db, user: AdminUser) {
    const where = scoped(user);
    const [totalKoleksi, perToko, stokTersedia, preOrder] = await Promise.all([
      db.produk.count({ where }),
      db.produk.groupBy({ by: ["tokoId"], where }),
      db.produk.count({ where: { ...where, status: "tersedia" } }),
      db.produk.count({ where: { ...where, status: "preorder" } }),
    ]);
    return { totalKoleksi, pengrajin: perToko.length, stokTersedia, preOrder, suhuBakar: "1.240°C" };
  },

  async lockById(tx: Prisma.TransactionClient, user: AdminUser, id: number) {
    const produk = await tx.produk.findFirst({ where: { id, ...scoped(user) }, select: { id: true, nama: true, tokoId: true } });
    if (!produk || !(await lockRow(tx, "produk", produk.id))) return undefined;
    return produk;
  },

  async remove(db: Db, id: number) {
    await db.produk.delete({ where: { id } });
  },
};
