import { Compass, Globe2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { LaporanTokoData } from "@/types";

const WARNA = ["#a3401f", "#4f6b4a", "#b07a2a", "#7c5a4a", "#9aa59a", "#c9b8a8"];

/** Donat SVG sederhana dari daftar persentase. */
function Donat({ data, label }: { data: { nama: string; persen: number }[]; label: string }) {
  const r = 42;
  const keliling = 2 * Math.PI * r;
  // Offset tiap irisan = jumlah panjang irisan sebelumnya (dihitung murni, tanpa mutasi saat render).
  const irisan = data.map((item, index) => {
    const panjang = (item.persen / 100) * keliling;
    const offset = data.slice(0, index).reduce((sum, prev) => sum + (prev.persen / 100) * keliling, 0);
    return { nama: item.nama, panjang, offset, warna: WARNA[index % WARNA.length] };
  });
  return (
    <svg viewBox="0 0 100 100" className="size-32 shrink-0 -rotate-90" role="img" aria-label={label}>
      {irisan.map((item) => (
        <circle
          key={item.nama}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={item.warna}
          strokeWidth="14"
          strokeDasharray={`${item.panjang} ${keliling - item.panjang}`}
          strokeDashoffset={-item.offset}
        />
      ))}
    </svg>
  );
}

/** Dari mana pengunjung menemukan toko & dari kota mana mereka datang. */
export function PengunjungCard({ sumber, asal }: { sumber: LaporanTokoData["sumberPengunjung"]; asal: LaporanTokoData["asalPengunjung"] }) {
  return (
    <Card>
      <SectionTitle variant="sans" icon={<Compass className="mt-1 size-5 shrink-0 text-primary" aria-hidden />} title="Sumber Pengunjung" description="Kanal yang membawa pengunjung ke toko" />
      <div className="mt-5 flex items-center gap-5">
        <Donat data={sumber} label="Diagram sumber pengunjung" />
        <ul className="flex min-w-0 flex-1 flex-col gap-2">
          {sumber.map((item, index) => (
            <li key={item.nama} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-2 text-on-surface">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: WARNA[index % WARNA.length] }} aria-hidden />
                <span className="truncate">{item.nama}</span>
              </span>
              <span className="font-semibold text-on-surface tabular-nums">{item.persen}%</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-outline-variant/30 pt-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-on-surface">
          <Globe2 className="size-4 text-primary" aria-hidden />
          Asal Pengunjung
        </p>
        <ul className="flex flex-col gap-2.5">
          {asal.map((item) => (
            <li key={item.nama} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-xs">
              <span className="text-on-surface">{item.nama}</span>
              <span className="font-semibold text-on-surface tabular-nums">{item.persen}%</span>
              <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-surface-high">
                <span className="block h-full rounded-full bg-secondary" style={{ width: `${item.persen}%` }} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
