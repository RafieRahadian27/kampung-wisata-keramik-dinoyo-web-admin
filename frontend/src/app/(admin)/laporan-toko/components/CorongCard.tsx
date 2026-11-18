import { Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatAngka } from "@/lib/utils";
import type { LaporanTokoData } from "@/types";

const WARNA = ["bg-primary", "bg-primary/85", "bg-secondary", "bg-secondary/80", "bg-tertiary"];

/** Corong konversi: berapa banyak calon pembeli yang lanjut ke tahap berikutnya. */
export function CorongCard({ corong }: { corong: LaporanTokoData["corong"] }) {
  const max = Math.max(1, corong[0]?.nilai ?? 1);

  return (
    <Card>
      <SectionTitle variant="sans" icon={<Filter className="mt-1 size-5 shrink-0 text-primary" aria-hidden />} title="Corong Konversi" description="Dari melihat profil hingga bertransaksi" />
      <ol className="mt-5 flex flex-col gap-2.5">
        {corong.map((tahap, index) => {
          const lebar = Math.max(18, (tahap.nilai / max) * 100);
          const lanjut = index > 0 && corong[index - 1].nilai ? Math.round((tahap.nilai / corong[index - 1].nilai) * 100) : null;
          return (
            <li key={tahap.tahap} className="flex flex-col items-center gap-1">
              {lanjut !== null && <span className="text-[10px] font-semibold text-on-surface-variant">↓ {lanjut}% lanjut</span>}
              <div className={`flex h-11 items-center justify-between gap-2 rounded-lg px-3 text-white ${WARNA[index % WARNA.length]}`} style={{ width: `${lebar}%` }}>
                <span className="truncate text-xs font-semibold">{tahap.tahap}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums">{formatAngka(tahap.nilai)}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
