import { Check, CircleCheck, CircleDashed, Eye, EyeOff, Hourglass, MapPin, Pause, Phone, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { BerandaToko, StatusTahapan } from "@/types";
import { STATUS_TOKO } from "../../toko/components/tokoMeta";

const TAHAP: Record<StatusTahapan, { icon: typeof Check; circle: string; line: string }> = {
  selesai: { icon: Check, circle: "bg-secondary text-on-secondary", line: "bg-secondary" },
  berjalan: { icon: Hourglass, circle: "bg-tertiary text-white ring-4 ring-tertiary-container", line: "bg-outline-variant/50" },
  menunggu: { icon: CircleDashed, circle: "bg-surface-high text-on-surface-variant", line: "bg-outline-variant/50" },
  terhenti: { icon: Pause, circle: "bg-error text-white", line: "bg-outline-variant/50" },
};

const formatTanggal = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));

/** Profil toko: identitas, tahapan perjalanan di paguyuban (stepper), dan daftar periksa kelengkapan. */
export function TokoSayaCard({ toko }: { toko: BerandaToko }) {
  const status = STATUS_TOKO[toko.status];

  return (
    <article className="overflow-hidden rounded-2xl bg-surface-lowest shadow-card">
      <header className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-surface-high">
          <Image src={toko.foto} alt={`Foto ${toko.nama}`} fill sizes="80px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-xl leading-7 font-bold text-on-surface sm:text-2xl">{toko.nama}</h2>
            <Badge tone={status.tone} icon={status.icon}>
              {status.label}
            </Badge>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {toko.lokasiGang}
            </span>
            <span className="inline-flex items-center gap-1">
              <Phone className="size-3.5" aria-hidden />
              {toko.whatsapp}
            </span>
            <span className="inline-flex items-center gap-1">
              {toko.aktifPublik ? <Eye className="size-3.5" aria-hidden /> : <EyeOff className="size-3.5" aria-hidden />}
              {toko.aktifPublik ? "Tampil di direktori" : "Belum tampil publik"}
            </span>
          </p>
          {toko.kategori.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {toko.kategori.map((kategori) => (
                <li key={kategori} className="rounded-full bg-surface-container px-2.5 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                  {kategori}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link href={`/toko/${toko.slug}`} className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-surface-low px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-surface-high sm:self-center">
          <Store className="size-4" aria-hidden />
          Kelola
        </Link>
      </header>

      <div className="border-t border-outline-variant/30 px-5 py-6 sm:px-6">
        <p className="mb-4 text-overline text-on-surface-variant">Perjalanan di Paguyuban</p>
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-4 sm:gap-0">
          {toko.tahapan.map((tahap, index) => {
            const gaya = TAHAP[tahap.status];
            const Icon = gaya.icon;
            const terakhir = index === toko.tahapan.length - 1;
            return (
              <li key={tahap.label} className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
                {!terakhir && <span className={cn("absolute top-4 left-1/2 hidden h-0.5 w-full sm:block", gaya.line)} aria-hidden />}
                <span className={cn("relative z-10 inline-flex size-8 shrink-0 items-center justify-center rounded-full", gaya.circle)}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="sm:mt-2 sm:px-2">
                  <p className="text-sm font-semibold text-on-surface">{tahap.label}</p>
                  <p className="text-[11px] leading-4 text-on-surface-variant">{tahap.keterangan}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="border-t border-outline-variant/30 bg-surface-low/60 px-5 py-5 sm:px-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-overline text-on-surface-variant">Daftar Periksa Profil</p>
          <p className="text-[11px] text-on-surface-variant">Diperbarui {formatTanggal(toko.diperbarui)}</p>
        </div>
        <ul className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {toko.kelengkapan.item.map((item) => (
            <li key={item.label}>
              {item.ok ? (
                <span className="flex items-center gap-2 text-sm text-on-surface">
                  <CircleCheck className="size-4 shrink-0 text-secondary" aria-label="Lengkap" />
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-primary hover:underline">
                  <CircleDashed className="size-4 shrink-0 text-tertiary" aria-label="Belum lengkap" />
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
