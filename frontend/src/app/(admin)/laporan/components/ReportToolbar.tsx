"use client";

import { CalendarDays, ChevronDown, Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { useToast } from "@/context/ToastContext";
import { type SelCsv, tanggalBerkas, unduhCsv } from "@/lib/csv";
import { cn } from "@/lib/utils";
import type { LaporanData } from "@/types";

const PERIODE_OPTIONS = ["Bulan Ini (Oktober 2024)", "September 2024", "Agustus 2024", "Kuartal III 2024"];

const EXPORT_FORMATS = [
  { id: "pdf", label: "Simpan sebagai PDF", icon: FileText },
  { id: "csv", label: "Spreadsheet (CSV / Excel)", icon: FileSpreadsheet },
  { id: "cetak", label: "Cetak Ringkasan", icon: Printer },
] as const;

/** Isi CSV: ringkasan, tren kunjungan, sebaran lorong, dan riwayat reservasi yang sedang ditampilkan. */
function barisLaporan(laporan: LaporanData, periode: string): SelCsv[][] {
  const { ringkasan } = laporan;
  return [
    ["Laporan Kunjungan & Reservasi", periode],
    [],
    ["Ringkasan", "Nilai", "Keterangan"],
    ["Total wisatawan", ringkasan.totalWisatawan.nilai, `${ringkasan.totalWisatawan.pertumbuhan}% ${ringkasan.totalWisatawan.pembanding}`],
    ["Workshop selesai", ringkasan.workshopSelesai.nilai, `${ringkasan.workshopSelesai.mendatang} mendatang, okupansi ${ringkasan.workshopSelesai.okupansi}%`],
    ["Estimasi omzet", ringkasan.estimasiOmzet.nilai, ringkasan.estimasiOmzet.keterangan],
    ["Konversi WhatsApp", ringkasan.konversiWhatsapp.nilai, ringkasan.konversiWhatsapp.keterangan],
    [],
    ["Periode", "Rombongan sekolah", "Wisatawan mandiri", "Catatan"],
    ...laporan.tren.map((t) => [t.label, t.sekolah, t.mandiri, t.catatan ?? ""]),
    [],
    ["Lorong", "Persentase (%)", "Detail"],
    ...laporan.sebaranLorong.map((l) => [l.nama, l.persen, l.detail]),
    [],
    ["ID", "Pemesan", "Detail", "Paket", "Studio", "Tanggal", "Jam"],
    ...laporan.reservasi.map((r) => [r.id, r.pemesan, r.detail, r.paket, r.studio, r.tanggal, r.jam]),
  ];
}

export function ReportToolbar({ periode, laporan }: { periode: string; laporan: LaporanData }) {
  const { showToast } = useToast();
  const [selectedPeriode, setSelectedPeriode] = useState(periode);
  const [isMenuOpen, setMenuOpen] = useState(false);
  // useRef menyimpan referensi wrapper menu untuk deteksi klik di luar menu.
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleExport = (format: (typeof EXPORT_FORMATS)[number]["id"]) => {
    setMenuOpen(false);
    if (format === "csv") {
      unduhCsv(`laporan-kunjungan-${tanggalBerkas()}`, barisLaporan(laporan, selectedPeriode));
      showToast("Laporan diunduh sebagai CSV — bisa dibuka di Excel atau Google Sheets.");
      return;
    }
    // PDF & cetak memakai dialog cetak browser (pilih "Simpan sebagai PDF"). Sidebar, header, dan
    // tombol aksi disembunyikan lewat varian print: Tailwind sehingga hasilnya rapi.
    if (format === "pdf") showToast('Pilih "Simpan sebagai PDF" pada dialog cetak.', "info");
    setTimeout(() => window.print(), 150);
  };

  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <FilterSelect
        label="Periode laporan"
        icon={<CalendarDays />}
        value={selectedPeriode}
        options={[...new Set([periode, ...PERIODE_OPTIONS])].map((option) => ({ value: option, label: option }))}
        onChange={setSelectedPeriode}
        className="w-auto min-w-60 bg-surface-high"
      />

      <div ref={menuRef} className="relative">
        <Button onClick={() => setMenuOpen((open) => !open)} aria-haspopup="menu" aria-expanded={isMenuOpen} className="h-11">
          <Download className="size-4" aria-hidden />
          Ekspor Laporan
          <ChevronDown className={cn("size-4 transition-transform", isMenuOpen && "rotate-180")} aria-hidden />
        </Button>
        {isMenuOpen && (
          <ul role="menu" className="absolute top-full left-0 z-30 mt-2 w-60 overflow-hidden rounded-xl bg-surface-lowest p-1.5 shadow-float">
            {EXPORT_FORMATS.map(({ id, label, icon: Icon }) => (
              <li key={label} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleExport(id)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-on-surface hover:bg-surface-low"
                >
                  <Icon className="size-4 text-primary" aria-hidden />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
