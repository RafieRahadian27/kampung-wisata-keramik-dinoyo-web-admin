"use client";

import { LockKeyhole, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { useUserAuth } from "@/lib/user-auth";
import { cn } from "@/lib/utils";
import type { Permission, Role } from "@/types";

interface AuthGateProps {
  children: ReactNode;
  /** Izin yang dibutuhkan fitur ini, mis. "toko:create". */
  permission?: Permission;
  /** Peran yang boleh melihat fitur ini, mis. "admin". */
  role?: Role;
  /** Ditampilkan bila sudah login tetapi tidak berhak (default: tidak menampilkan apa pun). */
  fallback?: ReactNode;
  /** Teks ajakan untuk tamu. */
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Gerbang fitur yang memerlukan akun:
 *  - tamu (belum login / sesi berakhir) → kartu ajakan masuk, lalu kembali ke halaman ini
 *  - sudah login tetapi tidak berizin    → `fallback`
 *  - berizin                              → `children`
 *
 * Hanya untuk UX. Express & DAL tetap menolak request tanpa izin walaupun tombolnya dimunculkan paksa.
 */
export function AuthGate({
  children,
  permission,
  role,
  fallback = null,
  title = "Masuk untuk melanjutkan",
  description = "Fitur ini hanya untuk admin paguyuban dan pengrajin terdaftar.",
  className,
}: AuthGateProps) {
  const { isAuthenticated, can, hasRole } = useUserAuth();
  const pathname = usePathname();

  if (!isAuthenticated) {
    return (
      <div className={cn("flex flex-col items-center gap-3 rounded-2xl bg-surface-low p-6 text-center", className)} role="region" aria-label={title}>
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
          <LockKeyhole className="size-5" aria-hidden />
        </span>
        <p className="font-serif text-lg font-bold text-on-surface">{title}</p>
        <p className="max-w-sm text-sm leading-[22px] text-on-surface-variant">{description}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <ButtonLink href={`/login?next=${encodeURIComponent(pathname)}`}>
            <LogIn className="size-4" aria-hidden />
            Masuk
          </ButtonLink>
          <ButtonLink href="/daftar" variant="tonal">
            Daftar sebagai pengrajin
          </ButtonLink>
        </div>
      </div>
    );
  }

  if ((permission && !can(permission)) || (role && !hasRole(role))) return <>{fallback}</>;
  return <>{children}</>;
}
