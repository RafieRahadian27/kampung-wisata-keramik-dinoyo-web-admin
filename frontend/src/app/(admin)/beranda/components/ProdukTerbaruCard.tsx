import { ArrowRight, PackagePlus, Sparkles } from "lucide-react";
import Image from "next/image";
import { IMAGE_SIZES } from "@/constants/imageSizes";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatRupiah } from "@/lib/utils";
import type { Produk, StatusProduk } from "@/types";
import { STATUS_PRODUK_TONE, produkBadgeTone } from "../../produk/components/produkTone";

const STATUS_LABEL: Record<StatusProduk, string> = { tersedia: "Tersedia", habis: "Habis", preorder: "Pre-order" };

/** Produk terakhir yang ditambahkan ke katalog toko milik pengguna (maks. 6). */
export function ProdukTerbaruCard({ produk }: { produk: Produk[] }) {
  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-6">
      <SectionTitle
        title="Produk Terbaru"
        description="Karya yang terakhir ditambahkan ke katalog Anda"
        icon={<Sparkles />}
        aside={
          <Link href="/produk" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Semua produk
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        }
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {produk.map((item) => (
          <li key={item.id} className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-low transition hover:shadow-card">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-high">
              <Image src={item.foto} alt={item.nama} fill sizes={IMAGE_SIZES.produkTerbaru} className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute top-3 left-3 flex gap-1.5">
                <Badge tone={STATUS_PRODUK_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                {item.badge && (
                  <Badge tone={produkBadgeTone(item.badge)} uppercase className="text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <p className="text-[11px] font-semibold tracking-wide text-on-surface-variant uppercase">{item.kategori}</p>
              <p className="line-clamp-2 font-semibold text-on-surface">{item.nama}</p>
              <p className="text-xs text-on-surface-variant">
                {item.teknik} • {item.bahan}
              </p>
              <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                <p className="font-serif text-lg font-bold text-primary">{formatRupiah(item.harga)}</p>
                <p className="text-[11px] text-on-surface-variant">{item.sku}</p>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                {item.stokLabel} • {item.lokasiStok}
              </p>
            </div>
          </li>
        ))}
        <li>
          <Link
            href="/produk/tambah"
            className="flex h-full min-h-56 flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-outline-variant/60 p-6 text-center text-on-surface-variant transition hover:border-primary/50 hover:bg-surface-low hover:text-primary"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
              <PackagePlus className="size-6" aria-hidden />
            </span>
            <span className="text-sm font-semibold">Tambah produk baru</span>
            <span className="text-xs">Perluas katalog toko Anda</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
