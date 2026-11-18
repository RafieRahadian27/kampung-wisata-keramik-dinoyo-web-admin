import { CalendarRange, GraduationCap, Landmark, MapPin, PartyPopper, ShieldCheck } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { cn } from "@/lib/utils";
import type { BerandaData } from "@/types";

const JENIS = {
  kurasi: { icon: ShieldCheck, label: "Kurasi", className: "bg-primary-fixed text-primary" },
  pelatihan: { icon: GraduationCap, label: "Pelatihan", className: "bg-secondary-container text-secondary" },
  festival: { icon: PartyPopper, label: "Festival", className: "bg-tertiary-container text-tertiary" },
  rapat: { icon: Landmark, label: "Rapat", className: "bg-surface-highest text-on-surface-variant" },
} as const;

/** Agenda paguyuban terdekat dengan hitung mundur hari. */
export function AgendaCard({ agenda }: { agenda: BerandaData["agenda"] }) {
  const hariIni = new Date(new Date().toDateString()).getTime();

  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-6">
      <SectionTitle title="Agenda Paguyuban" description="Kegiatan sentra yang bisa Anda ikuti" icon={<CalendarRange />} />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {agenda.map((item) => {
          const tanggal = new Date(`${item.tanggal}T00:00:00+07:00`);
          const sisa = Math.ceil((tanggal.getTime() - hariIni) / 86_400_000);
          const { icon: Icon, label, className } = JENIS[item.jenis];
          return (
            <li key={item.judul} className="flex gap-4 rounded-xl border border-outline-variant/40 p-4">
              <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-surface-low py-2 text-center">
                <span className="text-[11px] font-semibold text-primary uppercase">
                  {new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "Asia/Jakarta" }).format(tanggal)}
                </span>
                <span className="font-serif text-2xl leading-7 font-bold text-on-surface">
                  {new Intl.DateTimeFormat("id-ID", { day: "numeric", timeZone: "Asia/Jakarta" }).format(tanggal)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", className)}>
                  <Icon className="size-3" aria-hidden />
                  {label}
                </span>
                <p className="mt-1 text-sm leading-5 font-semibold text-on-surface">{item.judul}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-on-surface-variant">
                  <MapPin className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{item.lokasi}</span>
                </p>
                <p className="mt-1 text-[11px] font-semibold text-tertiary">{sisa > 0 ? `${sisa} hari lagi` : sisa === 0 ? "Hari ini" : "Selesai"}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
