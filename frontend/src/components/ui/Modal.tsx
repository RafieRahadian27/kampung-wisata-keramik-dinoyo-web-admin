"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState, type AnimationEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  children: ReactNode;
  className?: string;
  /** Strip gradasi terakota → hijau di tepi atas seperti desain dialog logout. */
  accentBar?: boolean;
}

/**
 * Dialog popup dengan animasi masuk (latar memudar, kartu naik + membesar) dan keluar.
 *
 * Agar animasi KELUAR sempat terlihat, dialog tidak langsung dibongkar saat `open` menjadi false:
 * state `tampil` menahannya di DOM dengan animasi keluar, lalu baru dilepas saat `animationend`.
 * Fokus, kunci scroll, dan tombol Escape tetap mengikuti `open` (langsung bereaksi saat ditutup).
 */
export function Modal({ open, onClose, labelledBy, children, className, accentBar }: ModalProps) {
  // useRef: akses langsung ke elemen DOM dialog untuk fokus, tanpa render ulang.
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [tampil, setTampil] = useState(open);
  // Isi terakhir saat masih terbuka. Banyak dialog memakai pola `open={data !== null}` — begitu
  // ditutup datanya langsung null, jadi tanpa ini kartu akan kosong selama animasi keluar.
  const [isiTerakhir, setIsiTerakhir] = useState(children);

  // Menyesuaikan state saat prop berubah (pola React yang dianjurkan, tanpa efek tambahan).
  if (open && !tampil) setTampil(true);
  if (open && isiTerakhir !== children) setIsiTerakhir(children);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!tampil) return null;

  const closing = !open;
  // Hanya animasi milik kartu dialog itu sendiri (bukan spinner/skeleton di dalamnya) yang dihitung.
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (closing && event.target === event.currentTarget) setTampil(false);
  };

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", closing && "pointer-events-none")}>
      <div
        className={cn("absolute inset-0 bg-scrim backdrop-blur-sm", closing ? "animate-overlay-out" : "animate-overlay-in")}
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-hidden={closing || undefined}
        tabIndex={-1}
        onAnimationEnd={handleAnimationEnd}
        className={cn(
          "relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-surface shadow-float outline-none",
          closing ? "animate-dialog-out" : "animate-dialog-in",
          className,
        )}
      >
        {accentBar && <div className="h-1.5 w-full bg-linear-to-r from-primary-container via-primary to-secondary" aria-hidden />}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup dialog"
          className="absolute top-6 right-6 inline-flex size-8 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container"
        >
          <X className="size-5" />
        </button>
        {open ? children : isiTerakhir}
      </div>
    </div>
  );
}
