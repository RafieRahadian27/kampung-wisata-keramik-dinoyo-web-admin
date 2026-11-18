"use client";

import { Check, Eye, Hourglass, TimerOff, Trash2, X } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";
import type { PengajuanToko } from "@/types";

export type Keputusan = "verifikasi" | "tolak";

const JAM = 60 * 60 * 1000;
const BATAS_MS = 72 * JAM;

const dua = (n: number) => String(n).padStart(2, "0");

/** ≥ 24 jam: "2 hari 5 jam"; < 24 jam: "05:12:09" agar terasa mendesak. */
function formatSisa(ms: number): string {
  const totalDetik = Math.max(0, Math.floor(ms / 1000));
  const hari = Math.floor(totalDetik / 86_400);
  const jam = Math.floor((totalDetik % 86_400) / 3600);
  const menit = Math.floor((totalDetik % 3600) / 60);
  const detik = totalDetik % 60;
  if (hari > 0) return `${hari} hari ${jam} jam`;
  return `${dua(jam)}:${dua(menit)}:${dua(detik)}`;
}

function nadaSisa(ms: number) {
  if (ms > 24 * JAM) return { bar: "bg-secondary", teks: "text-secondary" };
  if (ms > 6 * JAM) return { bar: "bg-tertiary", teks: "text-tertiary" };
  return { bar: "bg-error", teks: "text-error" };
}

interface VerificationItemProps {
  item: PengajuanToko;
  /** Waktu sekarang dari jam bersama (null sebelum hidrasi). */
  now: number | null;
  kedaluwarsa: boolean;
  isBusy: boolean;
  onDecision: (item: PengajuanToko, keputusan: Keputusan) => void;
}

/**
 * Child component: menampilkan satu pengajuan + hitung mundur batas verifikasi 3×24 jam.
 * Lewat batas → kartu dinonaktifkan: tombol Verifikasi mati, yang tersisa hanya "Hapus dari antrean".
 * Penegakan sebenarnya di Express (409 PENGAJUAN_KEDALUWARSA); di sini hanya tampilan.
 */
export function VerificationItem({ item, now, kedaluwarsa, isBusy, onDecision }: VerificationItemProps) {
  const { showToast } = useToast();
  const sisa = now === null ? null : Date.parse(item.batasWaktu) - now;
  const persen = sisa === null ? 100 : Math.max(0, Math.min(100, (sisa / BATAS_MS) * 100));
  const nada = sisa === null ? nadaSisa(BATAS_MS) : nadaSisa(sisa);

  return (
    <li
      className={cn(
        "flex flex-col gap-4 rounded-xl p-4 transition md:flex-row md:items-center md:justify-between",
        kedaluwarsa ? "bg-surface-container/60" : "bg-surface-low",
      )}
    >
      <div className={cn("flex min-w-0 gap-4", kedaluwarsa && "opacity-60 grayscale")}>
        <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-high">
          <Image src={item.foto} alt={`Foto ${item.nama}`} fill sizes="56px" className="object-cover" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-col items-start gap-2">
            <h3 className="text-lg leading-7 font-semibold text-on-surface sm:text-xl">{item.nama}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge tone="secondary">{item.lokasiGang}</Badge>
              {kedaluwarsa && (
                <Badge tone="neutral" icon={<TimerOff className="size-3" aria-hidden />}>
                  Kedaluwarsa • dinonaktifkan
                </Badge>
              )}
            </div>
          </div>
          <p className="text-xs leading-[18px] text-on-surface-variant">
            Pengrajin: {item.pengrajin} <span aria-hidden>•</span> Keahlian: {item.keahlian}
          </p>

          {kedaluwarsa ? (
            <p className="text-[11px] leading-4 text-on-surface-variant">Melewati batas verifikasi 3×24 jam. Pengrajin perlu mengajukan ulang.</p>
          ) : (
            <div className="flex max-w-xs flex-col gap-1">
              <p className={cn("flex items-center gap-1 text-[11px] font-semibold tabular-nums", nada.teks)} aria-live="off">
                <Hourglass className="size-3" aria-hidden />
                {sisa === null ? "Menghitung sisa waktu…" : `Sisa waktu verifikasi ${formatSisa(sisa)}`}
              </p>
              <div
                className="h-1 w-full overflow-hidden rounded-full bg-surface-high"
                role="progressbar"
                aria-label="Sisa waktu verifikasi"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(persen)}
              >
                <div className={cn("h-full rounded-full transition-[width] duration-1000 ease-linear", nada.bar)} style={{ width: `${persen}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 self-end md:self-center">
        {kedaluwarsa ? (
          <Button variant="danger" size="sm" onClick={() => onDecision(item, "tolak")} isLoading={isBusy}>
            {!isBusy && <Trash2 className="size-3.5" aria-hidden />}
            Hapus dari antrean
          </Button>
        ) : (
          <>
            <Button variant="tonal" size="sm" onClick={() => showToast(`Membuka berkas ${item.nama}…`, "info")} disabled={isBusy}>
              <Eye className="size-3.5" aria-hidden />
              Review
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onDecision(item, "verifikasi")} isLoading={isBusy}>
              {!isBusy && <Check className="size-3.5" aria-hidden />}
              Verifikasi
            </Button>
            <button
              type="button"
              onClick={() => onDecision(item, "tolak")}
              disabled={isBusy}
              aria-label={`Tolak pengajuan ${item.nama}`}
              className="inline-flex size-8 items-center justify-center rounded-lg text-error transition hover:bg-error-container disabled:opacity-50"
            >
              <X className="size-4" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}
