"use client";

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import { PUSAT_DINOYO } from "./pusat";
import type { TitikToko } from "./titikToko";

/** Pusat Kampung Wisata Keramik Dinoyo — dipakai bila belum ada toko yang berkoordinat. */
const PUSAT: [number, number] = [PUSAT_DINOYO.lat, PUSAT_DINOYO.lng];

const STATUS_LABEL: Record<TitikToko["status"], string> = {
  terverifikasi: "Terverifikasi",
  menunggu: "Menunggu review",
  nonaktif: "Nonaktif",
};

/** Sesuaikan zoom agar semua titik (atau titik lorong yang dipilih) terlihat. */
function SesuaikanTampilan({ titik }: { titik: TitikToko[] }) {
  const map = useMap();
  useEffect(() => {
    if (titik.length === 0) return;
    if (titik.length === 1) {
      map.flyTo([titik[0].lat, titik[0].lng], 18, { duration: 0.6 });
      return;
    }
    map.flyToBounds(
      titik.map((t) => [t.lat, t.lng] as [number, number]),
      { padding: [36, 36], maxZoom: 18, duration: 0.6 },
    );
  }, [map, titik]);
  return null;
}

interface PetaLeafletProps {
  titik: TitikToko[];
  /** Wilayah lorong yang sedang disorot; titik lorong lain dibuat redup. */
  wilayahAktif: string | null;
}

/**
 * Peta interaktif OpenStreetMap (Leaflet). Dimuat HANYA di browser (next/dynamic ssr:false)
 * karena Leaflet membutuhkan `window`. Ubin peta diambil dari tile.openstreetmap.org —
 * host ini diizinkan di CSP `img-src` (next.config.ts). Atribusi OSM wajib ditampilkan.
 */
export default function PetaLeaflet({ titik, wilayahAktif }: PetaLeafletProps) {
  const disorot = wilayahAktif ? titik.filter((t) => t.wilayah === wilayahAktif) : titik;

  return (
    <MapContainer center={PUSAT} zoom={17} scrollWheelZoom={false} className="size-full" aria-label="Peta sebaran toko di Kampung Keramik Dinoyo">
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      <SesuaikanTampilan titik={disorot} />
      {titik.map((t) => {
        const redup = wilayahAktif !== null && t.wilayah !== wilayahAktif;
        return (
          <CircleMarker
            key={t.slug}
            center={[t.lat, t.lng]}
            radius={redup ? 6 : 9}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: t.warna,
              fillOpacity: redup ? 0.25 : t.status === "nonaktif" ? 0.45 : 0.95,
              dashArray: t.status === "menunggu" ? "3 3" : undefined,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {t.nama}
            </Tooltip>
            <Popup>
              <div className="flex min-w-44 flex-col gap-1 font-sans">
                <strong className="text-sm">{t.nama}</strong>
                <span className="text-xs">{t.lokasiGang}</span>
                <span className="text-xs">Status: {STATUS_LABEL[t.status]}</span>
                <Link href={`/toko/${t.slug}`} className="mt-1 text-xs font-semibold">
                  Buka profil toko →
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
