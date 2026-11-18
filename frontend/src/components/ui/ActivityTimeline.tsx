import { BadgeCheck, Package, Store, UserRound } from "lucide-react";
import { cn, formatRelatif } from "@/lib/utils";
import type { AktivitasAudit } from "@/types";

const JENIS = {
  produk: { icon: Package, className: "bg-primary-fixed text-primary" },
  toko: { icon: Store, className: "bg-secondary-container text-secondary" },
  akun: { icon: UserRound, className: "bg-tertiary-container text-tertiary" },
  verifikasi: { icon: BadgeCheck, className: "bg-secondary text-on-secondary" },
} as const;

const formatPersis = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "long", timeStyle: "short" }).format(new Date(iso));

/** Linimasa vertikal dari audit log (data asli) — Dashboard Toko & Profil. */
export function ActivityTimeline({ aktivitas, empty = "Belum ada aktivitas tercatat." }: { aktivitas: AktivitasAudit[]; empty?: string }) {
  if (aktivitas.length === 0) {
    return <p className="rounded-xl bg-surface-low px-4 py-8 text-center text-sm text-on-surface-variant">{empty}</p>;
  }

  return (
    <ol className="relative flex flex-col">
      {aktivitas.map((item, index) => {
        const { icon: Icon, className } = JENIS[item.jenis];
        const terakhir = index === aktivitas.length - 1;
        return (
          <li key={item.id} className="relative flex gap-4 pb-5 last:pb-0">
            {!terakhir && <span className="absolute top-10 bottom-0 left-[17px] w-px bg-outline-variant/50" aria-hidden />}
            <span className={cn("relative z-10 inline-flex size-9 shrink-0 items-center justify-center rounded-full", className)}>
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-semibold text-on-surface">{item.judul}</p>
                <time dateTime={item.waktu} title={formatPersis(item.waktu)} className="text-[11px] whitespace-nowrap text-on-surface-variant">
                  {formatRelatif(item.waktu)}
                </time>
              </div>
              <p className="truncate text-xs text-on-surface-variant">{item.keterangan}</p>
              <p className="text-[11px] text-on-surface-variant/80">oleh {item.oleh}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
