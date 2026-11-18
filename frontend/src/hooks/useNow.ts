"use client";

import { useSyncExternalStore } from "react";

/**
 * Jam bersama untuk countdown: SATU setInterval untuk semua komponen yang memakainya
 * (bukan satu timer per item), berhenti otomatis saat tidak ada pelanggan.
 *
 * Saat render di server & hidrasi pertama nilainya `null` — waktu server dan browser hampir pasti
 * beda beberapa detik, dan menampilkan angka berbeda akan memicu hydration mismatch.
 * Komponen menampilkan placeholder sampai jam browser aktif.
 */
let sekarang = Date.now();
const pelanggan = new Set<() => void>();
let interval: ReturnType<typeof setInterval> | undefined;

function subscribe(onChange: () => void) {
  pelanggan.add(onChange);
  if (!interval) {
    sekarang = Date.now();
    interval = setInterval(() => {
      sekarang = Date.now();
      pelanggan.forEach((notify) => notify());
    }, 1000);
  }
  return () => {
    pelanggan.delete(onChange);
    if (pelanggan.size === 0 && interval) {
      clearInterval(interval);
      interval = undefined;
    }
  };
}

const getSnapshot = () => sekarang;
const getServerSnapshot = () => null;

/** Waktu sekarang (ms) yang diperbarui tiap detik, atau `null` sebelum hidrasi selesai. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
