"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import type { LaporanTokoData } from "@/types";

/** Kolom berisi koma/kutip/baris baru dibungkus kutip ganda (RFC 4180). */
const sel = (value: string | number) => {
  const text = String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

function toCsv(laporan: LaporanTokoData) {
  const baris: (string | number)[][] = [
    ["Laporan Kunjungan Toko", laporan.periodeLabel],
    ["Sumber data", laporan.sumber === "simulasi" ? "Simulasi (pelacakan belum aktif)" : "Pelacakan"],
    [],
    ["Ringkasan", "Nilai"],
    ["Total kunjungan", laporan.ringkasan.kunjungan.nilai],
    ["Klik WhatsApp", laporan.ringkasan.klikWhatsapp.nilai],
    ["Konversi (%)", laporan.ringkasan.klikWhatsapp.konversi],
    ["Reservasi", laporan.ringkasan.reservasi.nilai],
    ["Transaksi", laporan.ringkasan.transaksi.nilai],
    ["Estimasi omzet (Rp)", laporan.ringkasan.transaksi.estimasiOmzet],
    [],
    ["Tren", "Kunjungan", "Klik WhatsApp"],
    ...laporan.tren.map((item) => [item.label, item.kunjungan, item.klikWhatsapp]),
    [],
    ["Toko", "Lokasi", "Kunjungan", "Klik WhatsApp", "Reservasi", "Pertumbuhan (%)"],
    ...laporan.perToko.map((item) => [item.nama, item.lokasiGang, item.kunjungan, item.klikWhatsapp, item.reservasi, item.pertumbuhan]),
    [],
    ["Produk", "Kategori", "Harga (Rp)", "Dilihat", "Tanya WhatsApp"],
    ...laporan.produkPopuler.map((item) => [item.nama, item.kategori, item.harga, item.dilihat, item.tanyaWhatsapp]),
    [],
    ["ID Reservasi", "Pemesan", "Paket", "Toko", "Tanggal", "Jam", "Nilai (Rp)", "Status"],
    ...laporan.reservasi.map((item) => [item.id, item.pemesan, item.paket, item.toko, item.tanggal, item.jam, item.nilai, item.status]),
  ];
  // BOM agar Excel membaca UTF-8 (mis. "–" dan "•") dengan benar.
  return "﻿" + baris.map((row) => row.map(sel).join(",")).join("\r\n");
}

/** Unduh laporan yang sedang ditampilkan sebagai CSV (dibuat di browser, tanpa request tambahan). */
export function UnduhLaporanButton({ laporan }: { laporan: LaporanTokoData }) {
  const { showToast } = useToast();

  const unduh = () => {
    const blob = new Blob([toCsv(laporan)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-toko-${laporan.periode}-hari.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Laporan CSV berhasil diunduh.");
  };

  return (
    <Button variant="tonal" size="lg" onClick={unduh}>
      <Download className="size-4" aria-hidden />
      Unduh CSV
    </Button>
  );
}
