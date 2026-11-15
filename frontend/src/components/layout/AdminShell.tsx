"use client";

import { AdminShellProvider } from "@/context/AdminShellContext";
import { UserAuthProvider } from "@/lib/user-auth";
import type { AdminUser } from "@/types";
import { Header } from "./Header";
import { LogoutDialog } from "./LogoutDialog";
import { Sidebar } from "./Sidebar";

/**
 * Kerangka halaman admin: Sidebar (kiri) + Header (atas) + konten.
 * `children` tetap Server Component yang dirender di server lalu "dimasukkan" ke sini.
 *
 * `user` di sini hasil `verifySession()` layout (admin), sehingga dijamin tidak null;
 * provider ini menimpa nilai dari root layout untuk seluruh area admin.
 */
export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  return (
    <UserAuthProvider user={user}>
      <AdminShellProvider>
        <div className="min-h-dvh lg:pl-72">
          <Sidebar />
          <div className="flex min-h-dvh min-w-0 flex-col">
            <Header />
            <main id="konten" className="mx-auto w-full max-w-[1200px] min-w-0 flex-1 px-4 pt-6 pb-16 sm:px-6 lg:pt-8">
              {children}
            </main>
          </div>
        </div>
        <LogoutDialog />
      </AdminShellProvider>
    </UserAuthProvider>
  );
}
