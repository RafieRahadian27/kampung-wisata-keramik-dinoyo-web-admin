import { Flame, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatAngka, formatRupiah } from "@/lib/utils";
import type { LaporanTokoData } from "@/types";

/** Lima produk yang paling sering dilihat pengunjung direktori. */
export function ProdukPopulerCard({ produk }: { produk: LaporanTokoData["produkPopuler"] }) {
  const max = Math.max(1, ...produk.map((item) => item.dilihat));

  return (
    <Card>
      <SectionTitle variant="sans" icon={<Flame className="mt-1 size-5 shrink-0 text-primary" aria-hidden />} title="Produk Terpopuler" description="Paling sering dilihat di direktori" />
      {produk.length === 0 ? (
        <p className="mt-4 rounded-xl bg-surface-low px-4 py-6 text-center text-sm text-on-surface-variant">Belum ada produk di katalog Anda.</p>
      ) : (
        <ol className="mt-5 flex flex-col gap-4">
          {produk.map((item, index) => (
            <li key={item.id} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-center font-serif text-lg font-bold text-on-surface-variant">{index + 1}</span>
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-high">
                <Image src={item.foto} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-on-surface">{item.nama}</p>
                  <p className="shrink-0 text-[11px] font-semibold text-primary">{formatRupiah(item.harga)}</p>
                </div>
                <ProgressBar value={(item.dilihat / max) * 100} tone={index === 0 ? "primary" : "secondary"} label={`Dilihat ${item.nama}`} className="mt-1.5 h-1.5" />
                <p className="mt-1 flex items-center gap-2 text-[11px] text-on-surface-variant">
                  {formatAngka(item.dilihat)}× dilihat
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="size-3" aria-hidden />
                    {item.tanyaWhatsapp} tanya
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
