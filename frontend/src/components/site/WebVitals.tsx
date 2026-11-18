"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

/** Hanya tiga Core Web Vitals + dua metrik pendukungnya yang dilaporkan (FID sudah digantikan INP). */
const DILAPORKAN = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);

/**
 * Metrik dikumpulkan selama halaman dibuka, dikirim SEKALI saat tab disembunyikan/ditutup.
 * CLS & INP terus diperbarui selama kunjungan, jadi yang disimpan adalah nilai terakhir per metrik.
 * Map di level modul (bukan state React) — tidak memicu render ulang.
 */
const antrean = new Map<string, Metric>();
let halamanAwal: string | null = null;

function kirim() {
  if (antrean.size === 0 || !halamanAwal) return;
  const metrik = [...antrean.values()].map(({ name, value, rating, navigationType }) => ({ name, value, rating, navigationType }));
  antrean.clear();
  const body = new Blob([JSON.stringify({ halaman: halamanAwal, metrik })], { type: "application/json" });
  // sendBeacon tetap terkirim walau halaman sedang ditutup; fetch keepalive sebagai cadangan.
  if (!navigator.sendBeacon?.("/api/vitals", body)) {
    void fetch("/api/vitals", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {});
  }
}

// Referensi fungsi tetap (di luar komponen) agar Next.js tidak melaporkan metrik yang sama dua kali.
function handleMetric(metric: Metric) {
  if (!DILAPORKAN.has(metric.name)) return;
  // LCP/CLS/INP diukur per pemuatan penuh, jadi dicatat atas nama halaman tempat pengguna mendarat.
  halamanAwal ??= window.location.pathname;

  if (process.env.NODE_ENV === "development") {
    const nilai = metric.name === "CLS" ? metric.value.toFixed(3) : `${Math.round(metric.value)} ms`;
    console.info(`[web-vitals] ${metric.name} ${nilai} → ${metric.rating}`);
    return;
  }
  antrean.set(metric.name, metric);
}

/**
 * Pengukur data LAPANGAN (Real User Monitoring). Lighthouse = data lab (terkontrol);
 * komponen ini mencatat apa yang dirasakan pengguna sungguhan, lalu Express menulisnya ke log Pino.
 * - Development: hanya dicetak ke console browser (tidak dikirim).
 * - Production: dikirim ke /api/vitals (Route Handler) → POST /api/vitals di Express.
 */
export function WebVitals() {
  useReportWebVitals(handleMetric);

  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === "hidden") kirim();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", kirim);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", kirim);
    };
  }, []);

  return null;
}
