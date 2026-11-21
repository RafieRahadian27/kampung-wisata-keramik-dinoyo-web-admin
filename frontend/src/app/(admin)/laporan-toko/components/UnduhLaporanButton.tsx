"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { type SelCsv, unduhCsv } from "@/lib/csv";
import type { LaporanTokoData } from "@/types";

function barisLaporan(laporan: LaporanTokoData): SelCsv[][] {
  return [
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
}

/** Unduh laporan yang sedang ditampilkan sebagai CSV (dibuat di browser, tanpa request tambahan). */
export function UnduhLaporanButton({ laporan }: { laporan: LaporanTokoData }) {
  const { showToast } = useToast();

  const unduh = () => {
    unduhCsv(`laporan-toko-${laporan.periode}-hari`, barisLaporan(laporan));
    showToast("Laporan CSV berhasil diunduh.");
  };

  return (
    <Button variant="tonal" size="lg" onClick={unduh}>
      <Download className="size-4" aria-hidden />
      Unduh CSV
    </Button>
  );
}
