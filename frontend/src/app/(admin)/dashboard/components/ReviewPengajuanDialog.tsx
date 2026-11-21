"use client";

import { CalendarClock, Check, Hammer, Hourglass, MapPin, UserRound, X } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { PengajuanToko } from "@/types";
import type { Keputusan } from "./VerificationItem";

const TITLE_ID = "review-pengajuan-title";

const formatWaktu = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

interface ReviewPengajuanDialogProps {
  item: PengajuanToko | null;
  kedaluwarsa: boolean;
  sisaWaktu: string | null;
  isBusy: boolean;
  onClose: () => void;
  onDecision: (item: PengajuanToko, keputusan: Keputusan) => void;
}

/** Detail berkas pengajuan sebelum admin memutuskan — menggantikan toast "Membuka berkas…". */
export function ReviewPengajuanDialog({ item, kedaluwarsa, sisaWaktu, isBusy, onClose, onDecision }: ReviewPengajuanDialogProps) {
  return (
    <Modal open={item !== null} onClose={onClose} labelledBy={TITLE_ID} className="max-w-xl">
      {item && (
        <div className="flex flex-col">
          <div className="relative aspect-[16/9] w-full bg-surface-high">
            <Image src={item.foto} alt={`Foto studio ${item.nama}`} fill sizes="(min-width: 640px) 576px, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col gap-5 p-6 sm:p-8">
            <div className="flex flex-col gap-2 pr-8">
              <div className="flex flex-wrap gap-2">
                <Badge tone="secondary">Pengajuan Direktori</Badge>
                {kedaluwarsa ? <Badge tone="neutral">Kedaluwarsa • dinonaktifkan</Badge> : <Badge tone="tertiary">Menunggu keputusan</Badge>}
              </div>
              <h2 id={TITLE_ID} className="font-serif text-2xl font-bold text-on-surface">
                {item.nama}
              </h2>
            </div>

            <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              {[
                { icon: UserRound, label: "Pengrajin", value: item.pengrajin },
                { icon: Hammer, label: "Keahlian", value: item.keahlian },
                { icon: MapPin, label: "Lokasi", value: item.lokasiGang },
                { icon: CalendarClock, label: "Diajukan", value: formatWaktu(item.diajukanPada) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-[11px] font-semibold text-on-surface-variant uppercase">{label}</dt>
                    <dd className="text-on-surface">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>

            <p className="flex items-start gap-2 rounded-xl bg-surface-low p-3 text-xs leading-5 text-on-surface-variant">
              <Hourglass className="mt-0.5 size-4 shrink-0 text-tertiary" aria-hidden />
              {kedaluwarsa
                ? "Batas verifikasi 3×24 jam sudah lewat. Pengajuan tidak bisa diverifikasi lagi; hapus dari antrean dan minta pengrajin mengajukan ulang."
                : `Batas keputusan: ${formatWaktu(item.batasWaktu)}${sisaWaktu ? ` (sisa ${sisaWaktu})` : ""}. Verifikasi = toko langsung masuk direktori publik.`}
            </p>

            <div className="flex flex-wrap justify-end gap-3">
              <Button variant="danger" onClick={() => onDecision(item, "tolak")} disabled={isBusy}>
                <X className="size-4" aria-hidden />
                {kedaluwarsa ? "Hapus dari antrean" : "Tolak"}
              </Button>
              {!kedaluwarsa && (
                <Button variant="secondary" onClick={() => onDecision(item, "verifikasi")} isLoading={isBusy}>
                  {!isBusy && <Check className="size-4" aria-hidden />}
                  Verifikasi Toko
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
