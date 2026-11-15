"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface AdminShellContextValue {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  isLogoutOpen: boolean;
  openLogout: () => void;
  closeLogout: () => void;
}

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

/**
 * State UI kerangka admin: drawer sidebar (mobile) dan dialog logout.
 * Data pengguna & cek izin ada di `useUserAuth()` (lib/user-auth.ts).
 */
export function AdminShellProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutOpen, setLogoutOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openLogout = useCallback(() => {
    setSidebarOpen(false);
    setLogoutOpen(true);
  }, []);
  const closeLogout = useCallback(() => setLogoutOpen(false), []);

  const value = useMemo(
    () => ({ isSidebarOpen, openSidebar, closeSidebar, isLogoutOpen, openLogout, closeLogout }),
    [isSidebarOpen, openSidebar, closeSidebar, isLogoutOpen, openLogout, closeLogout],
  );

  return <AdminShellContext.Provider value={value}>{children}</AdminShellContext.Provider>;
}

export function useAdminShell() {
  const context = useContext(AdminShellContext);
  if (!context) throw new Error("useAdminShell harus dipakai di dalam <AdminShellProvider>");
  return context;
}
