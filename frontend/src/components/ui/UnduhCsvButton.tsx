"use client";

import { Download } from "lucide-react";
import type { ReactNode } from "react";
import { useToast } from "@/context/ToastContext";
import { type SelCsv, tanggalBerkas, unduhCsv } from "@/lib/csv";
import { Button, type ButtonSize, type ButtonVariant } from "./Button";

interface UnduhCsvButtonProps {
  /** Awalan nama berkas; tanggal hari ini ditambahkan otomatis, mis. "rekap-toko-2026-11-19.csv". */
  namaBerkas: string;
  /** Baris pertama = judul kolom. Disiapkan di Server Component dari data yang sudah dimuat halaman. */
  baris: SelCsv[][];
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** Tombol "Unduh/Ekspor Rekap" yang benar-benar mengunduh CSV (bisa dibuka di Excel/Google Sheets). */
export function UnduhCsvButton({ namaBerkas, baris, children = "Unduh Rekap", variant = "tonal", size = "lg", className }: UnduhCsvButtonProps) {
  const { showToast } = useToast();
  const jumlah = Math.max(0, baris.length - 1);

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={jumlah === 0}
      onClick={() => {
        unduhCsv(`${namaBerkas}-${tanggalBerkas()}`, baris);
        showToast(`${jumlah} baris diunduh sebagai CSV.`);
      }}
    >
      <Download className="size-4" aria-hidden />
      {children}
    </Button>
  );
}
