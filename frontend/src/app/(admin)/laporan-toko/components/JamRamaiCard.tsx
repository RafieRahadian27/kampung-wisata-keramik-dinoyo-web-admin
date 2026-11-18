import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { LaporanTokoData } from "@/types";

/** Peta panas hari × jam: makin pekat makin ramai. Membantu mengatur jadwal jaga & workshop. */
export function JamRamaiCard({ jamRamai }: { jamRamai: LaporanTokoData["jamRamai"] }) {
  let puncak = { hari: "", slot: "", nilai: -1 };
  for (const baris of jamRamai.baris) {
    baris.nilai.forEach((nilai, index) => {
      if (nilai > puncak.nilai) puncak = { hari: baris.hari, slot: jamRamai.slot[index], nilai };
    });
  }

  return (
    <Card>
      <SectionTitle variant="sans" icon={<Clock className="mt-1 size-5 shrink-0 text-primary" aria-hidden />} title="Jam Ramai Pengunjung" description="Intensitas kunjungan per hari & jam" />
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[320px] border-separate border-spacing-1 text-center text-[11px]">
          <thead>
            <tr>
              <th scope="col" className="w-10" />
              {jamRamai.slot.map((slot) => (
                <th key={slot} scope="col" className="pb-1 font-semibold text-on-surface-variant">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jamRamai.baris.map((baris) => (
              <tr key={baris.hari}>
                <th scope="row" className="pr-1 text-left font-semibold text-on-surface-variant">
                  {baris.hari}
                </th>
                {baris.nilai.map((nilai, index) => (
                  <td key={jamRamai.slot[index]} className="h-9 rounded-md p-0" title={`${baris.hari} ${jamRamai.slot[index]}: intensitas ${nilai}`}>
                    <span
                      className="flex size-full items-center justify-center rounded-md bg-primary font-semibold"
                      style={{ opacity: 0.12 + (nilai / 100) * 0.88, color: nilai > 55 ? "white" : undefined }}
                    >
                      {nilai}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-on-surface-variant">
        <span className="inline-flex items-center gap-2">
          Sepi
          <span className="h-2 w-24 rounded-full bg-linear-to-r from-primary/15 to-primary" aria-hidden />
          Ramai
        </span>
        <span>
          Puncak:{" "}
          <strong className="text-on-surface">
            {puncak.hari}, {puncak.slot} WIB
          </strong>
        </span>
      </div>
    </Card>
  );
}
