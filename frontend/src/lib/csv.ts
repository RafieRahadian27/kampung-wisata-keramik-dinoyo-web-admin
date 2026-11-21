export type SelCsv = string | number | null | undefined;

/**
 * Satu sel CSV (RFC 4180): dibungkus kutip bila memuat koma/kutip/baris baru.
 * Teks yang diawali = + - @ diberi petik tunggal agar Excel/Sheets tidak menjalankannya sebagai
 * rumus (CSV/formula injection) — data seperti nama toko berasal dari input pengguna.
 */
function sel(value: SelCsv): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Baris → teks CSV. Diawali BOM agar Excel membaca UTF-8 (mis. "–", "°", "•") dengan benar. */
export function keCsv(baris: SelCsv[][]): string {
  return "﻿" + baris.map((row) => row.map(sel).join(",")).join("\r\n");
}

/** Buat berkas CSV di browser lalu unduh — tanpa request tambahan ke server. */
export function unduhCsv(namaBerkas: string, baris: SelCsv[][]) {
  const blob = new Blob([keCsv(baris)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = namaBerkas.endsWith(".csv") ? namaBerkas : `${namaBerkas}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Tanggal hari ini untuk nama berkas, mis. "2026-11-19". */
export const tanggalBerkas = () => new Date().toISOString().slice(0, 10);
