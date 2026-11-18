import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PeriodeLaporan } from "@/types";

const OPSI: { value: PeriodeLaporan; label: string }[] = [
  { value: 7, label: "7 Hari" },
  { value: 30, label: "30 Hari" },
  { value: 90, label: "90 Hari" },
];

/** Pilihan periode lewat query string (?periode=) — tetap bisa dibagikan/di-bookmark, tanpa JS klien. */
export function PeriodeFilter({ aktif }: { aktif: PeriodeLaporan }) {
  return (
    <nav aria-label="Periode laporan" className="inline-flex w-fit rounded-xl bg-surface-container p-1">
      {OPSI.map((opsi) => (
        <Link
          key={opsi.value}
          href={`/laporan-toko?periode=${opsi.value}`}
          aria-current={opsi.value === aktif ? "page" : undefined}
          scroll={false}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-semibold transition",
            opsi.value === aktif ? "bg-surface-lowest text-primary shadow-card" : "text-on-surface-variant hover:text-on-surface",
          )}
        >
          {opsi.label}
        </Link>
      ))}
    </nav>
  );
}
