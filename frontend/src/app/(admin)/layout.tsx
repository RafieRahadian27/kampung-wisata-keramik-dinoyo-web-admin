import { Suspense } from "react";
import { AdminShellSkeleton } from "@/components/feedback/AdminShellSkeleton";
import { AdminShell } from "@/components/layout/AdminShell";
import { verifySession } from "@/lib/dal";

/**
 * Layout grup (admin) — tanda kurung membuat folder ini tidak muncul di URL.
 * Semua halaman di dalamnya berbagi Sidebar + Header yang sama.
 *
 * Partial Prerendering:
 *   - cangkang statis  → <AdminShellSkeleton /> (dibuat saat build, terkirim seketika)
 *   - bagian menyusul  → <SesiAdmin />: verifikasi cookie sesi ke Express, lalu Sidebar/Header asli
 *                         beserta halaman yang diminta di-stream menggantikan kerangka.
 * `verifySession()` sengaja TIDAK di-await di puncak layout: menunggu cookie di sini akan membuat
 * seluruh rute admin tidak bisa diprerender sama sekali.
 *
 * Layout tidak dirender ulang saat navigasi antar halaman, jadi setiap page tetap
 * memanggil `requirePermission()` sendiri.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <SesiAdmin>{children}</SesiAdmin>
    </Suspense>
  );
}

/** Pengguna diambil dari sesi yang diverifikasi server (bukan dari cookie yang bisa diubah). */
async function SesiAdmin({ children }: { children: React.ReactNode }) {
  const user = await verifySession();
  return <AdminShell user={user}>{children}</AdminShell>;
}
