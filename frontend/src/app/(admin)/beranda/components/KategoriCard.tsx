import { AlertTriangle, Coins, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn, formatRupiah } from "@/lib/utils";
import type { BerandaData, Tone } from "@/types";
import { STATUS_PRODUK_TONE } from "../../produk/components/produkTone";

const TONES: Tone[] = ["primary", "secondary", "tertiary", "neutral"];

/** Wawasan katalog: statistik harga, sebaran kategori, dan produk yang perlu perhatian stok. */
export function KategoriCard({ data, className }: { data: BerandaData; className?: string }) {
  const { produk, kategori, perluPerhatian } = data;

  return (
    <div className={cn("flex min-w-0 flex-col gap-6", className)}>
      <section className="flex flex-col gap-4 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-6">
        <SectionTitle title="Harga Katalog" description="Ringkasan harga seluruh produk Anda" icon={<Coins />} />
        <div className="rounded-xl bg-linear-to-br from-primary-fixed to-surface-low p-4">
          <p className="text-[11px] font-semibold text-on-surface-variant uppercase">Total nilai katalog (1 pcs/produk)</p>
          <p className="font-serif text-3xl font-bold text-primary">{formatRupiah(produk.nilaiKatalog)}</p>
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Termurah", value: produk.termurah },
            { label: "Rata-rata", value: produk.rataRata },
            { label: "Termahal", value: produk.termahal },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-surface-low px-2 py-3">
              <dt className="text-[11px] text-on-surface-variant">{item.label}</dt>
              <dd className="text-sm font-bold text-on-surface">{item.value ? formatRupiah(item.value) : "—"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-5 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-6">
        <SectionTitle title="Sebaran Kategori" description="Komposisi katalog toko Anda" icon={<Layers />} />
        {kategori.length === 0 ? (
          <p className="rounded-xl bg-surface-low px-4 py-6 text-center text-sm text-on-surface-variant">Belum ada produk di katalog.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {kategori.map((item, index) => {
              const persen = produk.totalKoleksi ? Math.round((item.jumlah / produk.totalKoleksi) * 100) : 0;
              return (
                <li key={item.nama} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold text-on-surface">{item.nama}</span>
                    <span className="text-on-surface-variant">
                      {item.jumlah} • {persen}%
                    </span>
                  </div>
                  <ProgressBar value={persen} tone={TONES[index % TONES.length]} label={`Porsi kategori ${item.nama}`} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-6">
        <SectionTitle title="Perlu Perhatian" description="Produk pre-order atau stok habis" icon={<AlertTriangle />} />
        {perluPerhatian.length === 0 ? (
          <p className="rounded-xl bg-secondary-container/40 px-4 py-4 text-sm text-on-surface">Semua produk berstatus tersedia. 👍</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {perluPerhatian.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-surface-high">
                  <Image src={item.foto} alt="" fill sizes="44px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-on-surface">{item.nama}</p>
                  <p className="text-[11px] text-on-surface-variant">{item.stokLabel}</p>
                </div>
                <Badge tone={STATUS_PRODUK_TONE[item.status]}>{item.status === "habis" ? "Habis" : "Pre-order"}</Badge>
              </li>
            ))}
            <Link href="/produk" className="text-sm font-semibold text-primary hover:underline">
              Kelola stok di katalog →
            </Link>
          </ul>
        )}
      </section>
    </div>
  );
}
