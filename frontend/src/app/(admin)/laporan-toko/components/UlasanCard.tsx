import { MessageSquareQuote, Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { inisial } from "@/lib/utils";
import type { LaporanTokoData } from "@/types";

/** Ulasan pengunjung terbaru. */
export function UlasanCard({ ulasan }: { ulasan: LaporanTokoData["ulasan"] }) {
  return (
    <Card>
      <SectionTitle variant="sans" icon={<MessageSquareQuote className="mt-1 size-5 shrink-0 text-primary" aria-hidden />} title="Ulasan Pengunjung" description="Kesan terbaru dari wisatawan" />
      {ulasan.length === 0 ? (
        <p className="mt-4 rounded-xl bg-surface-low px-4 py-6 text-center text-sm text-on-surface-variant">Belum ada ulasan.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {ulasan.map((item) => (
            <li key={item.nama} className="rounded-xl bg-surface-low p-4">
              <div className="flex items-center gap-3">
                <Avatar name={item.nama} initials={inisial(item.nama)} size="sm" tone="secondary" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-on-surface">{item.nama}</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {item.asal} • {item.tanggal}
                  </p>
                </div>
                <span className="flex" aria-label={`Rating ${item.rating} dari 5`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star key={index} className={`size-3.5 ${index < item.rating ? "fill-amber-400 text-amber-400" : "text-outline-variant"}`} aria-hidden />
                  ))}
                </span>
              </div>
              <p className="mt-2 text-xs leading-[18px] text-on-surface">“{item.teks}”</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
