"use client";

import { CalendarDays, ChevronDown, Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

const PERIODE_OPTIONS = ["Bulan Ini (Oktober 2024)", "September 2024", "Agustus 2024", "Kuartal III 2024"];

const EXPORT_FORMATS = [
  { label: "PDF Laporan Resmi", icon: FileText },
  { label: "Spreadsheet (XLSX)", icon: FileSpreadsheet },
  { label: "Cetak Ringkasan", icon: Printer },
];

export function ReportToolbar({ periode }: { periode: string }) {
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

  const handleExport = (format: string) => {
    setMenuOpen(false);
    showToast(`Menyiapkan ${format} untuk periode ${selectedPeriode}…`, "info");
  };

  return (
    <div className="flex flex-wrap gap-3">
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
            {EXPORT_FORMATS.map(({ label, icon: Icon }) => (
              <li key={label} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => handleExport(label)}
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
