import type { BadgeTone } from "@/components/ui/Badge";
import type { StatusProduk } from "@/types";

/**
 * Pemetaan warna badge produk — modul biasa (bukan "use client") agar bisa dipanggil
 * dari Server Component seperti CuratedHighlights maupun dari Client Component.
 */
export const STATUS_PRODUK_TONE: Record<StatusProduk, BadgeTone> = {
  tersedia: "secondary",
  habis: "error",
  preorder: "tertiary",
};

export function produkBadgeTone(badge: string): BadgeTone {
  return badge.toLowerCase().includes("best") ? "secondary" : "tertiary";
}
