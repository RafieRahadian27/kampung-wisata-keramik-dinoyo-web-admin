import { ArrowRight, CalendarCheck, Footprints, MessageCircle, Percent, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn, formatAngka } from "@/lib/utils";
import type { BerandaData } from "@/types";

function Stat({ icon, label, value, hint, className }: { icon: ReactNode; label: string; value: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface-low p-4">
      <span className={cn("inline-flex size-9 shrink-0 items-center justify-center rounded-lg [&_svg]:size-4", className)}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-on-surface-variant uppercase">{label}</p>
        <p className="font-serif text-2xl leading-8 font-bold text-on-surface">{value}</p>
        {hint && <p className="text-[11px] text-on-surface-variant">{hint}</p>}
      </div>
    </div>
  );
}

/** Performa 7 hari: empat angka ringkas + grafik batang kunjungan vs klik WhatsApp per hari. */
export function PerformaCard({ performa, className }: { performa: BerandaData["performa"]; className?: string }) {
  const max = Math.max(1, ...performa.tujuhHari.map((item) => item.kunjungan));
  const puncak = performa.tujuhHari.reduce((best, item) => (item.kunjungan > best.kunjungan ? item : best), performa.tujuhHari[0]);
  const naik = performa.pertumbuhan >= 0;

  return (
    <section className={cn("flex flex-col gap-6 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-6", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-xl font-semibold text-on-surface sm:text-2xl">Performa 7 Hari Terakhir</h2>
            {performa.sumber === "simulasi" && <Badge tone="tertiary">Data contoh</Badge>}
          </div>
          <p className="text-xs text-on-surface-variant">Kunjungan ke toko dan klik tombol WhatsApp dari direktori</p>
        </div>
        <Link href="/laporan-toko" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          Laporan lengkap
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon={<Footprints />}
          className="bg-primary-fixed text-primary"
          label="Kunjungan"
          value={formatAngka(performa.kunjungan)}
          hint={
            <span className={cn("inline-flex items-center gap-1 font-semibold", naik ? "text-secondary" : "text-error")}>
              {naik ? <TrendingUp className="size-3" aria-hidden /> : <TrendingDown className="size-3" aria-hidden />}
              {naik ? "+" : ""}
              {performa.pertumbuhan}% vs minggu lalu
            </span>
          }
        />
        <Stat icon={<MessageCircle />} className="bg-secondary-container text-secondary" label="Klik WhatsApp" value={formatAngka(performa.klikWhatsapp)} hint="Calon pembeli menghubungi" />
        <Stat icon={<Percent />} className="bg-tertiary-container text-tertiary" label="Konversi" value={`${performa.konversi.toLocaleString("id-ID")}%`} hint="Kunjungan → chat" />
        <Stat icon={<CalendarCheck />} className="bg-surface-highest text-on-surface-variant" label="Reservasi" value={performa.reservasi} hint="Kelas workshop" />
      </div>

      <figure className="rounded-2xl bg-surface-low p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-semibold text-on-surface">
          <span className="inline-flex items-center gap-2">
            <span className="size-3 rounded-sm bg-primary" aria-hidden />
            Kunjungan
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="size-3 rounded-sm bg-secondary" aria-hidden />
            Klik WhatsApp
          </span>
          <span className="ml-auto text-on-surface-variant">
            Hari tersibuk: <strong className="text-on-surface">{puncak?.hari}</strong>
          </span>
        </div>
        <div className="flex h-48 items-end justify-between gap-2 border-b border-outline-variant/50 pt-5 sm:gap-4" role="img" aria-label="Grafik kunjungan dan klik WhatsApp tujuh hari terakhir">
          {performa.tujuhHari.map((item) => (
            <div key={item.hari} className="flex h-full flex-1 items-end justify-center gap-1">
              <div className="relative w-1/2 max-w-7 rounded-t-md bg-primary" style={{ height: `${(item.kunjungan / max) * 100}%` }} title={`${item.hari}: ${item.kunjungan} kunjungan`}>
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-on-surface-variant">{item.kunjungan}</span>
              </div>
              <div className="w-1/2 max-w-7 rounded-t-md bg-secondary" style={{ height: `${(item.klikWhatsapp / max) * 100}%` }} title={`${item.hari}: ${item.klikWhatsapp} klik WhatsApp`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-2 pt-2 sm:gap-4">
          {performa.tujuhHari.map((item) => (
            <span key={item.hari} className="flex-1 text-center text-[11px] font-semibold text-on-surface-variant">
              {item.hari}
            </span>
          ))}
        </div>
      </figure>
    </section>
  );
}
