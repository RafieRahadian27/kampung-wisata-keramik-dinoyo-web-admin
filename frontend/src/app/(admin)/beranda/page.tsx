import type { Metadata } from "next";
import { Activity, Banknote, CircleCheck, Hourglass, Package, PackageX } from "lucide-react";
import { ActivityTimeline } from "@/components/ui/ActivityTimeline";
import { EmptyState } from "@/components/ui/EmptyState";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getBeranda } from "@/lib/api/server";
import { requirePermission } from "@/lib/dal";
import { formatAngka, formatRingkas } from "@/lib/utils";
import { AgendaCard } from "./components/AgendaCard";
import { BerandaHero } from "./components/BerandaHero";
import { KategoriCard } from "./components/KategoriCard";
import { LangkahCard } from "./components/LangkahCard";
import { PerformaCard } from "./components/PerformaCard";
import { ProdukTerbaruCard } from "./components/ProdukTerbaruCard";
import { TokoSayaCard } from "./components/TokoSayaCard";
import { FreshOnNavigate } from "@/components/layout/FreshOnNavigate";

export const metadata: Metadata = { title: "Dashboard Toko" };

/** Dashboard khusus pengrajin: ringkasan toko & katalog miliknya sendiri (data dibatasi ABAC di Express). */
export default async function BerandaPage() {
  await requirePermission("beranda:read");
  const data = await getBeranda();
  const { toko, produk } = data;
  const persenTersedia = produk.totalKoleksi ? Math.round((produk.stokTersedia / produk.totalKoleksi) * 100) : 0;

  return (
    <FreshOnNavigate>
      <BerandaHero data={data} />

      <section aria-label="Ringkasan katalog" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total Produk" value={formatAngka(produk.totalKoleksi)} unit="SKU" icon={<Package />} footer={`${data.kategori.length} kategori • ${toko.length} toko`} />
        <MetricCard label="Stok Tersedia" value={formatAngka(produk.stokTersedia)} unit="Produk" icon={<CircleCheck />} iconTone="secondary" footer={`${persenTersedia}% katalog siap dibeli`} />
        <MetricCard label="Pre-order" value={formatAngka(produk.preOrder)} unit="Produk" icon={<Hourglass />} iconTone="tertiary" footer="Dibuat sesuai pesanan" />
        <MetricCard
          label="Stok Habis"
          value={formatAngka(produk.habis)}
          unit="Produk"
          icon={<PackageX />}
          iconTone="neutral"
          footer={produk.habis > 0 ? "Perbarui agar tetap dilirik" : "Tidak ada stok kosong"}
        />
        <MetricCard
          label="Nilai Katalog"
          value={formatRingkas(produk.nilaiKatalog)}
          unit="Rupiah"
          icon={<Banknote />}
          iconTone="primary"
          footer={produk.rataRata ? `Rata-rata Rp ${formatRingkas(produk.rataRata)}/produk` : "Belum ada harga"}
          className="sm:col-span-2 xl:col-span-1"
        />
      </section>

      {toko.length === 0 ? (
        <EmptyState title="Belum ada toko yang tertaut ke akun Anda" description="Hubungi admin paguyuban agar toko Anda ditautkan ke akun ini." />
      ) : (
        <>
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <PerformaCard className="xl:col-span-8" performa={data.performa} />
            <LangkahCard className="xl:col-span-4" data={data} />
          </div>

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <div className="flex min-w-0 flex-col gap-6 xl:col-span-8">
              {toko.map((item) => (
                <TokoSayaCard key={item.slug} toko={item} />
              ))}
              <ProdukTerbaruCard produk={data.produkTerbaru} />
            </div>
            <div className="flex min-w-0 flex-col gap-6 xl:col-span-4">
              <section className="flex flex-col gap-5 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-6">
                <SectionTitle title="Aktivitas Terbaru" description="Perubahan pada akun & toko Anda" icon={<Activity />} />
                <ActivityTimeline aktivitas={data.aktivitas} empty="Belum ada aktivitas. Mulai dengan menambah produk atau melengkapi profil toko." />
              </section>
              <KategoriCard data={data} />
            </div>
          </div>
        </>
      )}

      <AgendaCard agenda={data.agenda} />

      {data.performa.sumber === "simulasi" && (
        <p className="text-center text-[11px] text-on-surface-variant">
          *Angka kunjungan, klik WhatsApp, reservasi, dan ulasan masih data contoh sampai pelacakan kunjungan diaktifkan. Data toko & produk adalah data asli.
        </p>
      )}
    </FreshOnNavigate>
  );
}
