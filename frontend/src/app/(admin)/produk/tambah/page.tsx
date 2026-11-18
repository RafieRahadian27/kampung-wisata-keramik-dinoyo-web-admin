import type { Metadata } from "next";
import { getHargaPasar, getProdukList, getTokoList } from "@/lib/api/server";
import { requirePermission } from "@/lib/dal";
import { ProdukForm } from "../components/form/ProdukForm";
import { FreshOnNavigate } from "@/components/layout/FreshOnNavigate";

export const metadata: Metadata = { title: "Tambah Produk Baru" };

/**
 * Pilihan toko & kategori diambil dari API yang sudah dibatasi ABAC: pengrajin hanya melihat
 * tokonya sendiri, admin melihat semua toko. Express tetap memeriksa ulang kepemilikan saat simpan.
 */
export default async function TambahProdukPage() {
  await requirePermission("produk:create");
  const [{ data: toko }, { kategori }, hargaPasar] = await Promise.all([getTokoList(), getProdukList(), getHargaPasar()]);

  return (
    <FreshOnNavigate>
      <ProdukForm
        toko={toko.map((item) => ({ slug: item.slug, nama: item.nama, lokasiGang: item.lokasiGang }))}
        kategori={kategori.map((item) => item.nama)}
        hargaPasar={hargaPasar}
      />
    </FreshOnNavigate>
  );
}
