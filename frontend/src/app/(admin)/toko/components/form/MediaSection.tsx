"use client";

import { CircleAlert, CircleCheck, Cloud, ImagePlus, RefreshCw, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { FormSection } from "@/components/ui/FormSection";
import { FOTO_ACCEPT, FOTO_MAX_BYTES, formatBytes, validateFoto } from "@/lib/validation/upload";
import type { MediaToko } from "@/types";

/** Aset bawaan panel bila toko belum mengunggah media sendiri. */
const DEFAULT_MEDIA: Record<MediaToko, string> = {
  foto: "/images/sampul-galeri.jpg",
  stempel: "/images/stempel-paguyuban.jpg",
};

export type MediaFiles = Record<MediaToko, File | null>;

interface MediaSectionProps {
  /** Media yang sudah tersimpan (URL Vercel Blob). Kosong = memakai aset bawaan. */
  saved: Partial<Record<MediaToko, string>>;
  /** Berkas baru yang dipilih — baru diunggah ke cloud saat formulir disimpan. */
  files: MediaFiles;
  onFileChange: (jenis: MediaToko, file: File | null) => void;
  /** Error unggah dari server (mis. 415/422/503), ditampilkan di dekat media terkait. */
  uploadErrors?: Partial<Record<MediaToko, string>>;
}

const fileNameOf = (url: string) => decodeURIComponent(url.split("?")[0].split("/").pop() ?? url);

/** Object URL untuk pratinjau lokal; dibersihkan saat berkas berganti agar tidak bocor memori. */
function usePreview(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);
  return url;
}

function mediaStatus(file: File | null, isCloud: boolean) {
  if (file) return { icon: Upload, label: "Diunggah saat disimpan", className: "text-tertiary" };
  if (isCloud) return { icon: Cloud, label: "Tersimpan di cloud", className: "text-secondary" };
  return { icon: CircleCheck, label: "Bawaan", className: "text-on-surface-variant" };
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="inline-flex items-start gap-1.5 text-xs leading-[18px] font-medium text-error">
      <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  );
}

/**
 * Langkah "Pilih File → Validasi" alur unggah untuk foto sampul & stempel. Berkas yang lolos
 * validasi browser (tipe & ukuran) ditampilkan sebagai pratinjau lokal; pengunggahan ke
 * Vercel Blob dilakukan TokoForm setelah data toko tersimpan.
 */
export function MediaSection({ saved, files, onFileChange, uploadErrors = {} }: MediaSectionProps) {
  const [selectErrors, setSelectErrors] = useState<Partial<Record<MediaToko, string>>>({});

  // useRef ke <input type="file"> tersembunyi — dibuka lewat tombol kustom.
  const inputRefs = { foto: useRef<HTMLInputElement>(null), stempel: useRef<HTMLInputElement>(null) };
  const previews = { foto: usePreview(files.foto), stempel: usePreview(files.stempel) };

  const savedUrl = (jenis: MediaToko) => saved[jenis] || DEFAULT_MEDIA[jenis];
  const isCloud = (jenis: MediaToko) => savedUrl(jenis).startsWith("https://");
  const imageUrl = (jenis: MediaToko) => previews[jenis] ?? savedUrl(jenis);
  const errorOf = (jenis: MediaToko) => selectErrors[jenis] ?? uploadErrors[jenis];

  const handleChange = (jenis: MediaToko) => (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    // Reset nilai input agar memilih berkas yang sama lagi tetap memicu onChange.
    event.target.value = "";
    if (!picked) return;
    const error = validateFoto(picked);
    setSelectErrors((current) => ({ ...current, [jenis]: error }));
    if (!error) onFileChange(jenis, picked);
  };

  const cancel = (jenis: MediaToko) => {
    onFileChange(jenis, null);
    setSelectErrors((current) => ({ ...current, [jenis]: undefined }));
  };

  const fileInput = (jenis: MediaToko, label: string) => (
    <input
      ref={inputRefs[jenis]}
      type="file"
      accept={FOTO_ACCEPT}
      className="sr-only"
      onChange={handleChange(jenis)}
      tabIndex={-1}
      aria-label={label}
      aria-describedby="media-hint"
    />
  );

  const fotoStatus = mediaStatus(files.foto, isCloud("foto"));
  const stempelStatus = mediaStatus(files.stempel, isCloud("stempel"));

  return (
    <FormSection title="Media Galeri" description="Foto sampul workshop dan stempel monogram" icon={<ImagePlus />}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold">
          <span className="text-on-surface">
            Foto Sampul Workshop / Gerai <span className="text-primary">*</span>
          </span>
          <span className={`inline-flex items-center gap-1 text-[11px] ${fotoStatus.className}`}>
            <fotoStatus.icon className="size-3.5" aria-hidden />
            {fotoStatus.label}
          </span>
        </div>
        <div className="relative aspect-[3/2] w-full overflow-hidden rounded-xl bg-surface-high" data-invalid={errorOf("foto") ? "true" : undefined}>
          <Image src={imageUrl("foto")} alt="Pratinjau foto sampul" fill sizes="(min-width: 1280px) 320px, 100vw" className="object-cover" loading="eager" unoptimized={imageUrl("foto").startsWith("blob:")} />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/70 to-transparent p-4">
            <div className="min-w-0 text-white">
              <p className="truncate text-xs font-semibold">{files.foto ? files.foto.name : fileNameOf(savedUrl("foto"))}</p>
              <p className="text-[11px] text-white/80">{files.foto ? `${formatBytes(files.foto.size)} • belum diunggah` : isCloud("foto") ? "Vercel Blob" : "Aset bawaan panel"}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {files.foto && (
                <button
                  type="button"
                  onClick={() => cancel("foto")}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/60"
                >
                  <X className="size-3.5" aria-hidden />
                  Batal
                </button>
              )}
              <button
                type="button"
                onClick={() => inputRefs.foto.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-black/60"
              >
                <RefreshCw className="size-3.5" aria-hidden />
                Ganti
              </button>
            </div>
          </div>
        </div>
        {fileInput("foto", "Unggah foto sampul")}
        <ErrorText message={errorOf("foto")} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4 rounded-xl bg-surface-container p-4" data-invalid={errorOf("stempel") ? "true" : undefined}>
          <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-surface-high">
            <Image src={imageUrl("stempel")} alt="Pratinjau stempel toko" fill sizes="64px" className="object-cover" unoptimized={imageUrl("stempel").startsWith("blob:")} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-on-surface">{files.stempel ? files.stempel.name : fileNameOf(savedUrl("stempel"))}</p>
            <p className="text-xs leading-[18px] text-on-surface-variant">Stempel otentikasi kriya (rasio 1:1)</p>
            <p className={`mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold ${stempelStatus.className}`}>
              <stempelStatus.icon className="size-3.5" aria-hidden />
              {stempelStatus.label}
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-1.5">
            <button
              type="button"
              onClick={() => inputRefs.stempel.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-lowest px-3 py-2 text-xs font-semibold text-on-surface shadow-card transition hover:bg-surface-low"
            >
              <Upload className="size-3.5" aria-hidden />
              Unggah
            </button>
            {files.stempel && (
              <button type="button" onClick={() => cancel("stempel")} className="text-[11px] font-semibold text-on-surface-variant hover:text-on-surface">
                Batal
              </button>
            )}
          </div>
        </div>
        {fileInput("stempel", "Unggah stempel")}
        <ErrorText message={errorOf("stempel")} />
      </div>

      <p id="media-hint" className="text-xs leading-[18px] text-on-surface-variant">
        JPG, PNG, atau WebP, maks. {formatBytes(FOTO_MAX_BYTES)}. Sampul: rasio 16:9 landscape dengan pencahayaan alami studio. Stempel: rasio 1:1.
      </p>
    </FormSection>
  );
}
