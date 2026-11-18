/** Menggabungkan className kondisional tanpa dependensi tambahan. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatRupiah(value: number): string {
  // Intl menghasilkan "Rp 85.000" dengan non-breaking space; samakan dengan spasi biasa.
  return rupiahFormatter.format(value).replace(/ /g, " ");
}

export function formatAngka(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

/** Format ribuan bergaya desain dashboard (1,480) yang memakai pemisah koma. */
export function formatRibuan(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function inisial(nama: string): string {
  return nama
    .replace(/^(Pak|Bpk\.|Ibu|H\.)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("");
}

/** Waktu relatif berbahasa Indonesia: "baru saja", "5 menit lalu", "3 hari lalu", lalu tanggal. */
export function formatRelatif(iso: string, now: Date = new Date()): string {
  const detik = Math.round((now.getTime() - new Date(iso).getTime()) / 1000);
  if (detik < 60) return "baru saja";
  const menit = Math.round(detik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.round(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.round(jam / 24);
  if (hari < 7) return `${hari} hari lalu`;
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

/** Angka ringkas: 1.250.000 → "1,3 jt", 12.400 → "12,4 rb". */
export function formatRingkas(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (value >= 10_000) return `${(value / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} rb`;
  return formatAngka(value);
}
