import { ChartColumn } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn, formatAngka } from "@/lib/utils";
import type { LaporanTokoData } from "@/types";

const SERIES = [
  { key: "kunjungan", label: "Kunjungan ke toko", className: "bg-primary" },
  { key: "klikWhatsapp", label: "Klik WhatsApp", className: "bg-secondary" },
] as const;

/** Grafik batang berkelompok per minggu (flexbox, tinggi batang = persentase nilai tertinggi). */
export function TrenTokoChart({ tren, periodeLabel }: { tren: LaporanTokoData["tren"]; periodeLabel: string }) {
  const maxValue = Math.max(1, ...tren.flatMap((week) => [week.kunjungan, week.klikWhatsapp]));

  return (
    <Card>
      <SectionTitle
        variant="sans"
        icon={<ChartColumn className="mt-1 size-5 shrink-0 text-primary" aria-hidden />}
        title="Tren Kunjungan"
        description={`Perbandingan kunjungan dan klik WhatsApp ke toko Anda • ${periodeLabel}`}
      />

      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2" aria-label="Legenda grafik">
        {SERIES.map((series) => (
          <li key={series.key} className="flex items-center gap-2 text-xs font-semibold text-on-surface">
            <span className={cn("size-3 rounded-sm", series.className)} aria-hidden />
            {series.label}
          </li>
        ))}
      </ul>

      <figure className="mt-6 rounded-2xl bg-surface-low p-4 sm:p-6">
        <div className="scrollbar-thin overflow-x-auto">
          <div className="flex h-64 min-w-[420px] items-end justify-between gap-3 border-b border-outline-variant/50 pt-6 sm:h-72" role="img" aria-label="Grafik tren kunjungan dan klik WhatsApp per minggu">
            {tren.map((week) => (
              <div key={week.label} className="flex h-full flex-1 items-end justify-center gap-1.5">
                {SERIES.map((series) => (
                  <div
                    key={series.key}
                    className={cn("relative w-1/2 max-w-9 rounded-t-md", series.className)}
                    style={{ height: `${(week[series.key] / maxValue) * 100}%` }}
                    title={`${week.label} • ${series.label}: ${formatAngka(week[series.key])}`}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap text-on-surface-variant">
                      {formatAngka(week[series.key])}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex min-w-[420px] justify-between gap-3 pt-2">
            {tren.map((week) => (
              <span key={week.label} className="flex-1 text-center text-[11px] font-semibold text-on-surface-variant">
                {week.label}
              </span>
            ))}
          </div>
        </div>
        <figcaption className="mt-4 grid grid-cols-3 gap-3 border-t border-outline-variant/40 pt-4 text-center">
          {[
            { label: "Tertinggi", value: Math.max(...tren.map((week) => week.kunjungan)) },
            { label: "Rata-rata", value: Math.round(tren.reduce((sum, week) => sum + week.kunjungan, 0) / Math.max(tren.length, 1)) },
            { label: "Terendah", value: Math.min(...tren.map((week) => week.kunjungan)) },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-[11px] text-on-surface-variant">{item.label}</p>
              <p className="font-serif text-lg font-bold text-on-surface">{formatAngka(item.value)}</p>
            </div>
          ))}
        </figcaption>
      </figure>
    </Card>
  );
}
