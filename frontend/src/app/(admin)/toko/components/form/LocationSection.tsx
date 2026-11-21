"use client";

import { Crosshair, LocateFixed, MapPin, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SelectField, TextField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { Skeleton } from "@/components/ui/Skeleton";
import type { TokoFormValues } from "@/types";
import { PUSAT_DINOYO } from "../peta/pusat";
import { parseKoordinat } from "../peta/titikToko";
import { WILAYAH_LORONG, type TokoFormErrors } from "./formConfig";
import type { UpdateField } from "./TokoForm";

/** Leaflet butuh `window` → dimuat hanya di browser; kerangka seukuran peta selama memuat. */
const PetaPilihLokasi = dynamic(() => import("../peta/PetaPilihLokasi"), {
  ssr: false,
  loading: () => <Skeleton className="size-full rounded-none" />,
});

interface LocationSectionProps {
  values: TokoFormValues;
  errors: TokoFormErrors;
  updateField: UpdateField;
}

const formatKoordinat = (lat: number, lng: number) => `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

export function LocationSection({ values, errors, updateField }: LocationSectionProps) {
  const wilayahOptions = WILAYAH_LORONG.includes(values.wilayah) ? WILAYAH_LORONG : [values.wilayah, ...WILAYAH_LORONG];
  // Teks koordinat boleh "setengah jadi" saat diketik; pin hanya berpindah bila formatnya sudah valid.
  const posisi = parseKoordinat(values.koordinat) ?? PUSAT_DINOYO;
  const [statusGps, setStatusGps] = useState<string>();
  const [mencari, setMencari] = useState(false);

  const pilih = useCallback((titik: { lat: number; lng: number }) => updateField("koordinat", formatKoordinat(titik.lat, titik.lng)), [updateField]);

  const lokasiSaya = () => {
    if (!("geolocation" in navigator)) {
      setStatusGps("Browser ini tidak mendukung GPS.");
      return;
    }
    setMencari(true);
    setStatusGps("Mencari lokasi Anda…");
    navigator.geolocation.getCurrentPosition(
      (hasil) => {
        pilih({ lat: hasil.coords.latitude, lng: hasil.coords.longitude });
        setStatusGps(`Lokasi ditemukan (akurasi ±${Math.round(hasil.coords.accuracy)} m). Geser pin bila kurang tepat.`);
        setMencari(false);
      },
      (error) => {
        setStatusGps(error.code === error.PERMISSION_DENIED ? "Izin lokasi ditolak. Klik peta untuk menempatkan pin secara manual." : "Lokasi tidak dapat ditentukan. Klik peta untuk menempatkan pin.");
        setMencari(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <FormSection title="Lokasi Lorong Dinoyo" description="Pemetaan jalan dan titik presisi studio di sentra keramik" icon={<MapPin />}>
      <SelectField
        label="Wilayah Lorong / Gang"
        required
        options={wilayahOptions}
        value={values.wilayah}
        onValueChange={(wilayah) => updateField("wilayah", wilayah)}
        error={errors.wilayah}
      />
      <TextField
        label="Alamat Lengkap & Nomor Studio"
        placeholder="Jl. MT Haryono Gg. IX No. 42B, Dinoyo, Lowokwaru"
        maxLength={200}
        value={values.alamat}
        onChange={(event) => updateField("alamat", event.target.value)}
        error={errors.alamat}
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-on-surface">Pin Koordinat Digital</span>
          <div className="flex gap-2">
            <Button size="sm" variant="tonal" onClick={lokasiSaya} isLoading={mencari}>
              {!mencari && <Crosshair className="size-3.5" aria-hidden />}
              Lokasi saya
            </Button>
            <Button size="sm" variant="ghost" onClick={() => pilih(PUSAT_DINOYO)}>
              <RotateCcw className="size-3.5" aria-hidden />
              Pusat Dinoyo
            </Button>
          </div>
        </div>

        {/* `isolate` menahan z-index panel Leaflet agar tidak menutupi header & bilah aksi formulir. */}
        <div className="relative isolate aspect-video w-full overflow-hidden rounded-xl bg-surface-high">
          <PetaPilihLokasi posisi={posisi} onPilih={pilih} />
        </div>
        <p className="text-[11px] leading-4 text-on-surface-variant">Klik peta atau seret pin ke lokasi studio. Titik ini tampil di Peta Sebaran Lorong.</p>

        <TextField
          label="Koordinat (lat, lng)"
          placeholder="-7.942100, 112.608700"
          inputMode="decimal"
          maxLength={40}
          value={values.koordinat}
          onChange={(event) => updateField("koordinat", event.target.value.replace(/[^0-9.,\s-]/g, ""))}
          error={errors.koordinat}
          hint={statusGps ?? "Bisa juga diketik/ditempel dari Google Maps."}
          leadingIcon={<LocateFixed />}
        />
      </div>
    </FormSection>
  );
}
