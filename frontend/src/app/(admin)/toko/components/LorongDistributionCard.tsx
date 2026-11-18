"use client";

import { MapPinned, MapPinOff } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { IconTile } from "@/components/ui/IconTile";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import type { Tone, Toko } from "@/types";
import { WILAYAH_LORONG } from "./form/formConfig";
import { keTitik } from "./peta/titikToko";

/** Leaflet butuh `window` → dimuat hanya di browser, kerangka seukuran peta selama memuat (tanpa CLS). */
const PetaLeaflet = dynamic(() => import("./peta/PetaLeaflet"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

const TONES: Tone[] = ["primary", "secondary", "tertiary", "neutral"];
/** Warna penanda peta = warna token tema yang sama dengan bar lorong (nilai mode terang). */
const WARNA_TONE: Record<string, string> = { primary: "#9a4023", secondary: "#446557", tertiary: "#805200", neutral: "#89726b" };

interface SebaranLorong {
  wilayah: string;
  total: number;
  terverifikasi: number;
  tone: Tone;
}

/** Kelompokkan toko per wilayah lorong, mengikuti urutan pilihan di formulir toko. */
function hitungSebaran(toko: Toko[]): SebaranLorong[] {
  const urutan = [...WILAYAH_LORONG, ...toko.map((item) => item.wilayah).filter((w) => w && !WILAYAH_LORONG.includes(w))];
  return [...new Set(urutan)]
    .map((wilayah) => {
      const diLorong = toko.filter((item) => item.wilayah === wilayah);
      return { wilayah, total: diLorong.length, terverifikasi: diLorong.filter((item) => item.status === "terverifikasi").length };
    })
    .filter((lorong) => lorong.total > 0)
    .map((lorong, index) => ({ ...lorong, tone: TONES[index % TONES.length] }));
}

/**
 * Peta sebaran toko (OpenStreetMap asli via Leaflet) + jumlah gerai per lorong.
 * Titik diambil dari kolom `koordinat` tiap toko. Klik sebuah lorong untuk menyorot & memusatkan
 * peta ke gerai di lorong itu; klik lagi untuk melihat semuanya.
 */
export function LorongDistributionCard({ toko }: { toko: Toko[] }) {
  const sebaran = useMemo(() => hitungSebaran(toko), [toko]);
  const { titik, tanpaKoordinat } = useMemo(() => {
    const toneWilayah = new Map(sebaran.map((lorong) => [lorong.wilayah, lorong.tone]));
    return keTitik(toko, (wilayah) => WARNA_TONE[toneWilayah.get(wilayah) ?? "neutral"]);
  }, [toko, sebaran]);
  const [wilayahAktif, setWilayahAktif] = useState<string | null>(null);

  return (
    <Card>
      <SectionTitle
        icon={
          <IconTile tone="primary">
            <MapPinned />
          </IconTile>
        }
        title="Peta Sebaran Lorong"
        description="Lokasi gerai UMKM di setiap gang sentra keramik Dinoyo — klik lorong untuk menyorot di peta"
        aside={<span className="text-[11px] font-semibold text-on-surface-variant">{toko.length} Gerai</span>}
      />

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* `isolate` menahan z-index panel Leaflet (400+) agar tidak menutupi header & drawer sidebar. */}
        <div className="relative isolate h-72 w-full overflow-hidden rounded-xl bg-surface-high sm:h-80 lg:h-auto lg:min-h-80">
          <PetaLeaflet titik={titik} wilayahAktif={wilayahAktif} />
        </div>

        <div className="flex flex-col gap-4">
          {sebaran.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {sebaran.map((lorong) => {
                const persen = toko.length ? Math.round((lorong.total / toko.length) * 100) : 0;
                const aktif = wilayahAktif === lorong.wilayah;
                return (
                  <li key={lorong.wilayah}>
                    <button
                      type="button"
                      onClick={() => setWilayahAktif(aktif ? null : lorong.wilayah)}
                      aria-pressed={aktif}
                      className={cn(
                        "flex w-full flex-col gap-2 rounded-xl p-3 text-left transition hover:bg-surface-low",
                        aktif && "bg-surface-low ring-1 ring-outline-variant",
                        wilayahAktif !== null && !aktif && "opacity-60",
                      )}
                    >
                      <span className="flex items-start justify-between gap-3 text-xs font-semibold">
                        <span className="flex min-w-0 items-center gap-2 text-on-surface">
                          <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: WARNA_TONE[lorong.tone] }} aria-hidden />
                          {lorong.wilayah}
                        </span>
                        <span className="shrink-0 text-on-surface">{lorong.total} toko</span>
                      </span>
                      <ProgressBar value={persen} tone={lorong.tone} label={`Persentase gerai di ${lorong.wilayah}`} />
                      <span className="text-[11px] text-on-surface-variant">
                        {persen}% dari direktori • {lorong.terverifikasi} terverifikasi paguyuban
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="self-center text-sm text-on-surface-variant">Belum ada toko yang terdata di lorong mana pun.</p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-outline-variant/30 pt-3 text-[11px] text-on-surface-variant">
            <span>● penuh = terverifikasi</span>
            <span>◌ garis putus = menunggu review</span>
            {tanpaKoordinat > 0 && (
              <span className="inline-flex items-center gap-1 text-tertiary">
                <MapPinOff className="size-3.5" aria-hidden />
                {tanpaKoordinat} toko belum punya koordinat
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
