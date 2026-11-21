import type { Metadata } from "next";
import { Plus, Store } from "lucide-react";
import { FreshOnNavigate } from "@/components/layout/FreshOnNavigate";
import { AuthGate } from "@/components/site/auth-gate";
import { ButtonLink } from "@/components/ui/Button";
import { Eyebrow, PageHeader } from "@/components/ui/PageHeader";
import { UnduhCsvButton } from "@/components/ui/UnduhCsvButton";
import { getProdukList } from "@/lib/api/server";
import { requirePermission } from "@/lib/dal";
import { CuratedHighlights } from "./components/CuratedHighlights";
import { ProdukManager } from "./components/ProdukManager";
import { ProdukStats } from "./components/ProdukStats";
import { SyncHelpCard } from "./components/SyncHelpCard";

export const metadata: Metadata = { title: "Kelola Produk & Katalog" };

/**
 * Satu halaman, dua sudut pandang (data sudah dibatasi ABAC di Express):
 *  - admin     → katalog seluruh sentra + kurasi & sinkronisasi paguyuban
 *  - pengrajin → hanya produk toko miliknya; elemen khusus admin disembunyikan,
 *                filter toko dihilangkan bila tokonya cuma satu.
 */
export default async function KelolaProdukPage() {
  const user = await requirePermission("produk:read");
  const { data, kategori, ringkasan } = await getProdukList();
  const modePengrajin = user.role === "pengrajin";
  const namaToko = [...new Set(data.map((produk) => produk.toko.nama))];

  return (
    <FreshOnNavigate>
      <PageHeader
        eyebrow={
          modePengrajin ? (
            <Eyebrow icon={<Store />}>{namaToko.length === 1 ? namaToko[0] : "Katalog Toko Saya"}</Eyebrow>
          ) : (
            <Eyebrow>Katalog Resmi Paguyuban Dinoyo</Eyebrow>
          )
        }
        title={modePengrajin ? "Produk Toko Saya" : "Kelola Produk & Katalog Kriya"}
        description={
          modePengrajin
            ? "Perbarui harga, stok, dan foto karya Anda. Produk yang tersimpan langsung tampil di direktori Kampung Keramik Dinoyo."
            : "Inventaris karya keramik, cangkir, vas, guci, dan suvenir otentik dari seluruh studio pengrajin Dinoyo Kota Malang."
        }
        actions={
          <>
            <AuthGate permission="produk:create">
              <ButtonLink href="/produk/tambah" size="lg">
                <Plus className="size-5" aria-hidden />
                Tambah Produk
              </ButtonLink>
            </AuthGate>
            <UnduhCsvButton
              namaBerkas={modePengrajin ? "katalog-toko-saya" : "rekap-katalog-produk"}
              baris={[
                ["SKU", "Nama Produk", "Toko", "Kategori", "Teknik", "Bahan", "Harga (Rp)", "Status", "Stok", "Lokasi Stok"],
                ...data.map((p) => [p.sku, p.nama, p.toko.nama, p.kategori, p.teknik, p.bahan, p.harga, p.status, p.stokLabel, p.lokasiStok]),
              ]}
            >
              Ekspor Rekap
            </UnduhCsvButton>
          </>
        }
      />
      <ProdukStats ringkasan={ringkasan} />
      {!modePengrajin && <CuratedHighlights produk={data} />}
      <ProdukManager initialProduk={data} kategori={kategori} totalKoleksi={ringkasan.totalKoleksi} modePengrajin={modePengrajin} />
      {!modePengrajin && <SyncHelpCard />}
    </FreshOnNavigate>
  );
}
