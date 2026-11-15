"use client";

import { createContext, createElement, useCallback, useContext, useMemo, useTransition, type ReactNode } from "react";
import { login, logout as logoutAction } from "@/lib/actions/auth";
import type { AdminUser, Permission, Role } from "@/types";

/**
 * State pengguna untuk kebutuhan TAMPILAN di Client Components: siapa yang login,
 * cek izin untuk menyembunyikan tombol, serta fungsi login/logout.
 *
 * Sumber datanya adalah sesi yang sudah diverifikasi server (`getCurrentUser()` di root layout),
 * bukan cookie yang dibaca di browser — token sesi tetap HttpOnly dan tidak pernah sampai ke sini.
 * Ini BUKAN kontrol keamanan: menyembunyikan tombol hanya soal UX, penegakan izin tetap
 * dilakukan DAL Next.js (lib/dal.ts) dan Express (requireRole/requirePermission).
 */
export interface UserAuthValue {
  /** `null` = tamu (belum login atau sesi berakhir). */
  user: AdminUser | null;
  isAuthenticated: boolean;
  can: (permission: Permission) => boolean;
  hasRole: (...roles: Role[]) => boolean;
  /** Server Action login — dipakai LoginForm; token disimpan sebagai cookie HttpOnly oleh server. */
  login: typeof login;
  /** Cabut sesi di server, hapus cookie, lalu kembali ke /login. */
  logout: () => void;
  isLoggingOut: boolean;
}

const UserAuthContext = createContext<AdminUser | null>(null);

/** Dipasang sekali di root layout dengan pengguna hasil verifikasi server. */
export function UserAuthProvider({ user, children }: { user: AdminUser | null; children: ReactNode }) {
  // File ini sengaja .ts (bukan .tsx), jadi provider ditulis dengan createElement alih-alih JSX.
  return createElement(UserAuthContext.Provider, { value: user }, children);
}

export function useUserAuth(): UserAuthValue {
  const user = useContext(UserAuthContext);
  const [isLoggingOut, startTransition] = useTransition();

  const can = useCallback((permission: Permission) => user?.izin.includes(permission) ?? false, [user]);
  const hasRole = useCallback((...roles: Role[]) => (user ? roles.includes(user.role) : false), [user]);
  const logout = useCallback(() => startTransition(() => logoutAction()), []);

  return useMemo(
    () => ({ user, isAuthenticated: user !== null, can, hasRole, login, logout, isLoggingOut }),
    [user, can, hasRole, logout, isLoggingOut],
  );
}

/** Untuk komponen di area admin, yang layout-nya sudah menjamin pengguna login. */
export function useCurrentUser(): AdminUser {
  const { user } = useUserAuth();
  if (!user) throw new Error("useCurrentUser hanya dipakai di halaman yang wajib login (grup (admin))");
  return user;
}
