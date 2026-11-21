"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

/**
 * Pin terakota berbentuk tetes (HTML + style inline, tanpa berkas gambar) — ikon bawaan Leaflet
 * memakai PNG yang sering rusak saat di-bundle, dan warnanya tidak sesuai tema panel.
 */
const ikonPin = L.divIcon({
  className: "",
  html: '<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#9a4023;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.35)"></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

interface Posisi {
  lat: number;
  lng: number;
}

/** Klik di mana pun pada peta → pin pindah ke titik itu. */
function KlikUntukMemilih({ onPilih }: { onPilih: (posisi: Posisi) => void }) {
  useMapEvents({
    click(event) {
      onPilih({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

/** Bila koordinat berubah dari luar peta (diketik manual / GPS), peta ikut berpindah ke pin. */
function IkutiPosisi({ posisi }: { posisi: Posisi }) {
  const map = useMap();
  useEffect(() => {
    if (!map.getBounds().pad(-0.2).contains([posisi.lat, posisi.lng])) {
      map.flyTo([posisi.lat, posisi.lng], Math.max(map.getZoom(), 17), { duration: 0.5 });
    }
  }, [map, posisi.lat, posisi.lng]);
  return null;
}

interface PetaPilihLokasiProps {
  posisi: Posisi;
  onPilih: (posisi: Posisi) => void;
}

/**
 * Peta pemilih lokasi studio (Leaflet + OpenStreetMap). Dimuat hanya di browser.
 * Klik peta atau seret pin untuk menentukan koordinat; nilainya dikirim ke formulir lewat `onPilih`.
 */
export default function PetaPilihLokasi({ posisi, onPilih }: PetaPilihLokasiProps) {
  const markerRef = useRef<L.Marker>(null);
  const handlers = useMemo(
    () => ({
      dragend() {
        const titik = markerRef.current?.getLatLng();
        if (titik) onPilih({ lat: titik.lat, lng: titik.lng });
      },
    }),
    [onPilih],
  );

  return (
    <MapContainer center={[posisi.lat, posisi.lng]} zoom={17} scrollWheelZoom={false} className="size-full cursor-crosshair" aria-label="Peta pemilihan lokasi studio — klik untuk menempatkan pin">
      <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' maxZoom={19} />
      <KlikUntukMemilih onPilih={onPilih} />
      <IkutiPosisi posisi={posisi} />
      <Marker position={[posisi.lat, posisi.lng]} icon={ikonPin} draggable eventHandlers={handlers} ref={markerRef} keyboard />
    </MapContainer>
  );
}
