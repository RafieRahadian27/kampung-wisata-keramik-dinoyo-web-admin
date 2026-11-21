"use client";

import { Bell, BellOff, BookOpen, CircleHelp, ExternalLink, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { IconButton } from "@/components/ui/Button";
import { PORTAL_PUBLIK_URL } from "@/constants/navigation";
import { getNotifikasi, type Notifikasi } from "@/lib/actions/notifikasi";
import { useUserAuth } from "@/lib/user-auth";
import { cn } from "@/lib/utils";

/** Panel dropdown kecil: tutup saat klik di luar, tekan Escape, atau pindah halaman. */
function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [pathTerakhir, setPathTerakhir] = useState(pathname);

  // Pindah halaman → panel ditutup (disesuaikan saat render, bukan lewat efek).
  if (pathTerakhir !== pathname) {
    setPathTerakhir(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return { open, setOpen, ref };
}

function Panel({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div id={id} role="dialog" aria-label={label} className="animate-popover-in absolute top-full right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-lowest shadow-float">
      {children}
    </div>
  );
}

const NADA: Record<Notifikasi["nada"], string> = { primary: "bg-primary", tertiary: "bg-tertiary", error: "bg-error" };

/** Lonceng notifikasi — isinya dihitung dari data nyata (lihat lib/actions/notifikasi.ts). */
export function NotifikasiMenu() {
  const { open, setOpen, ref } = useDropdown();
  const [daftar, setDaftar] = useState<Notifikasi[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const muat = useCallback(() => startTransition(async () => setDaftar(await getNotifikasi().catch(() => []))), []);
  // Dimuat saat halaman berganti (agar titik merah akurat) dan setiap panel dibuka.
  useEffect(muat, [muat, pathname]);

  const jumlah = daftar?.length ?? 0;

  return (
    <div ref={ref} className="relative">
      <IconButton
        label={jumlah > 0 ? `Notifikasi (${jumlah} baru)` : "Notifikasi"}
        className="relative"
        aria-expanded={open}
        aria-controls="panel-notifikasi"
        onClick={() => {
          if (!open) muat();
          setOpen(!open);
        }}
      >
        <Bell className="size-[18px]" />
        {jumlah > 0 && <span className="absolute top-2 right-2.5 size-2 rounded-full bg-primary ring-2 ring-surface-low" aria-hidden />}
      </IconButton>
      {open && (
        <Panel id="panel-notifikasi" label="Notifikasi">
          <p className="border-b border-outline-variant/30 px-4 py-3 text-sm font-semibold text-on-surface">Notifikasi</p>
          {daftar === null || (isPending && daftar.length === 0) ? (
            <p className="px-4 py-6 text-center text-xs text-on-surface-variant">Memuat…</p>
          ) : daftar.length === 0 ? (
            <p className="flex flex-col items-center gap-2 px-4 py-6 text-center text-xs text-on-surface-variant">
              <BellOff className="size-5" aria-hidden />
              Tidak ada yang perlu ditindaklanjuti.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {daftar.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} onClick={() => setOpen(false)} className="flex gap-3 px-4 py-3 transition hover:bg-surface-low">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", NADA[item.nada])} aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-on-surface">{item.judul}</span>
                      <span className="block truncate text-xs text-on-surface-variant">{item.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}
    </div>
  );
}

/** Pintasan bantuan sesuai peran + kontak sekretariat paguyuban. */
export function BantuanMenu() {
  const { open, setOpen, ref } = useDropdown();
  const { can } = useUserAuth();

  const panduan = [
    can("toko:create") && { href: "/toko/tambah", label: "Menambah toko baru & menandai lokasi di peta" },
    can("toko:update") && !can("toko:create") && { href: "/toko", label: "Memperbarui profil & lokasi toko saya" },
    can("produk:create") && { href: "/produk/tambah", label: "Menambah produk ke katalog" },
    can("akun:update") && { href: "/akun", label: "Mengaktifkan akun pengrajin baru" },
    can("profil:update") && { href: "/profil", label: "Mengganti kata sandi & mengelola sesi login" },
  ].filter((item): item is { href: string; label: string } => Boolean(item));

  return (
    <div ref={ref} className="relative hidden sm:block">
      <IconButton label="Bantuan" aria-expanded={open} aria-controls="panel-bantuan" onClick={() => setOpen(!open)}>
        <CircleHelp className="size-[18px]" />
      </IconButton>
      {open && (
        <Panel id="panel-bantuan" label="Bantuan">
          <p className="border-b border-outline-variant/30 px-4 py-3 text-sm font-semibold text-on-surface">Bantuan Cepat</p>
          <ul className="py-1">
            {panduan.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface transition hover:bg-surface-low">
                  <BookOpen className="size-4 shrink-0 text-primary" aria-hidden />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1 border-t border-outline-variant/30 py-1">
            <a href="tel:+623415550123" className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface transition hover:bg-surface-low">
              <Phone className="size-4 shrink-0 text-secondary" aria-hidden />
              Sekretariat Paguyuban (Senin–Jumat)
            </a>
            <a href={PORTAL_PUBLIK_URL} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface transition hover:bg-surface-low">
              <ExternalLink className="size-4 shrink-0 text-on-surface-variant" aria-hidden />
              Buka Portal Publik
            </a>
          </div>
        </Panel>
      )}
    </div>
  );
}
