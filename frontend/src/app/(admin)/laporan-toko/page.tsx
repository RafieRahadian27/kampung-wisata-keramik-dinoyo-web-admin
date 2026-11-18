import type { Metadata } from "next";
import { Banknote, CalendarCheck, Eye, FlaskConical, Footprints, MessageCircle, Star, TrendingDown, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { Eyebrow, PageHeader } from "@/components/ui/PageHeader";
import { getLaporanToko } from "@/lib/api/server";
import { requirePermission } from "@/lib/dal";
import { formatAngka, formatRingkas } from "@/lib/utils";
import type { PeriodeLaporan } from "@/types";
import { BandingSentraCard } from "./components/BandingSentraCard";
import { CorongCard } from "./components/CorongCard";
import { JamRamaiCard } from "./components/JamRamaiCard";
import { PengunjungCard } from "./components/PengunjungCard";
import { PeriodeFilter } from "./components/PeriodeFilter";
import { PerTokoTable } from "./components/PerTokoTable";
import { ProdukPopulerCard } from "./components/ProdukPopulerCard";
import { ReservasiTokoCard } from "./components/ReservasiTokoCard";
import { TrenTokoChart } from "./components/TrenTokoChart";
import { UlasanCard } from "./components/UlasanCard";
import { UnduhLaporanButton } from "./components/UnduhLaporanButton";
import { FreshOnNavigate } from "@/components/layout/FreshOnNavigate";

export const metadata: Metadata = { title: "Laporan Kunjungan Toko" };

const PERIODE: PeriodeLaporan[] = [7, 30, 90];

/** Laporan kunjungan khusus toko milik pengrajin — Express hanya menghitung toko dalam cakupan pengguna. */
export default async function LaporanTokoPage({ searchParams }: PageProps<"/laporan-toko">) {
  await requirePermission("laporan-toko:read");
  const raw = Number((await searchParams).periode);
  const periode = PERIODE.includes(raw as PeriodeLaporan) ? (raw as PeriodeLaporan) : 30;
  const laporan = await getLaporanToko(periode);
  const { ringkasan } = laporan;
  const naik = ringkasan.kunjungan.pertumbuhan >= 0;

  return (
    <FreshOnNavigate>
      <PageHeader
        eyebrow={<Eyebrow icon={<Footprints />}>Statistik Toko Saya • {laporan.periodeLabel}</Eyebrow>}
        title="Laporan Kunjungan Toko"
        description="Pantau arus pengunjung, klik WhatsApp ke kontak Anda, reservasi workshop, perilaku pengunjung, dan produk yang paling banyak dilihat di direktori."
        actions={<UnduhLaporanButton laporan={laporan} />}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <PeriodeFilter aktif={periode} />
        {laporan.sumber === "simulasi" && (
          <p role="note" className="flex items-start gap-2 text-xs leading-[18px] text-on-surface-variant lg:max-w-xl lg:text-right">
            <FlaskConical className="mt-0.5 size-3.5 shrink-0 text-tertiary" aria-hidden />
            <span>
              <strong className="text-on-surface">Data contoh:</strong> pelacakan kunjungan belum aktif, angka kunjungan masih simulasi. Daftar toko, produk &amp; harga
              adalah data asli.
            </span>
          </p>
        )}
      </div>

      <section aria-label="Ringkasan kunjungan" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <MetricCard
          label="Total Kunjungan"
          value={formatAngka(ringkasan.kunjungan.nilai)}
          icon={<Footprints />}
          footer={
            <span className={naik ? "inline-flex items-center gap-1 font-semibold text-secondary" : "inline-flex items-center gap-1 font-semibold text-error"}>
              {naik ? <TrendingUp className="size-3.5" aria-hidden /> : <TrendingDown className="size-3.5" aria-hidden />}
              {naik ? "+" : ""}
              {ringkasan.kunjungan.pertumbuhan}% • ±{ringkasan.kunjungan.rataHarian}/hari
            </span>
          }
        />
        <MetricCard label="Klik WhatsApp" value={formatAngka(ringkasan.klikWhatsapp.nilai)} icon={<MessageCircle />} iconTone="secondary" footer={`Konversi ${ringkasan.klikWhatsapp.konversi}%`} />
        <MetricCard label="Reservasi" value={formatAngka(ringkasan.reservasi.nilai)} icon={<CalendarCheck />} iconTone="tertiary" footer={`${formatAngka(ringkasan.reservasi.peserta)} peserta workshop`} />
        <MetricCard label="Transaksi" value={formatAngka(ringkasan.transaksi.nilai)} icon={<Banknote />} footer={`Estimasi Rp ${formatRingkas(ringkasan.transaksi.estimasiOmzet)}`} />
        <MetricCard label="Produk Dilihat" value={formatAngka(ringkasan.produkDilihat.nilai)} icon={<Eye />} iconTone="neutral" footer="Dari 5 produk terpopuler" />
        <MetricCard
          label="Rating Toko"
          value={ringkasan.rating.nilai.toLocaleString("id-ID")}
          unit="/ 5"
          icon={<Star />}
          iconTone="tertiary"
          footer={`${ringkasan.rating.ulasan} ulasan baru`}
        />
      </section>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-6">
          <TrenTokoChart tren={laporan.tren} periodeLabel={laporan.periodeLabel} />
          <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
            <JamRamaiCard jamRamai={laporan.jamRamai} />
            <CorongCard corong={laporan.corong} />
          </div>
          <PerTokoTable perToko={laporan.perToko} />
          <ReservasiTokoCard reservasi={laporan.reservasi} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <BandingSentraCard banding={laporan.banding} />
          <PengunjungCard sumber={laporan.sumberPengunjung} asal={laporan.asalPengunjung} />
          <ProdukPopulerCard produk={laporan.produkPopuler} />
          <UlasanCard ulasan={laporan.ulasan} />
        </div>
      </div>
    </FreshOnNavigate>
  );
}
