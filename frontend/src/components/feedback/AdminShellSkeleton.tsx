import { BrandMark } from "@/components/layout/BrandMark";
import { Skeleton } from "@/components/ui/Skeleton";
import { PageSkeleton } from "./PageSkeleton";

/**
 * Cangkang statis area admin (fallback <Suspense> di app/(admin)/layout.tsx).
 *
 * Dibuat saat build dan dikirim seketika, sebelum sesi selesai diverifikasi ke Express.
 * Ukurannya meniru AdminShell asli — sidebar 288px (lg), header 64px, kolom konten 1200px —
 * supaya saat konten asli mengalir masuk tidak ada elemen yang melompat (CLS tetap ≈ 0).
 * Tanpa data pengguna: nama, email, dan menu sesuai izin baru muncul setelah sesi terverifikasi.
 */
export function AdminShellSkeleton() {
  return (
    <div className="min-h-dvh lg:pl-72">
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col bg-surface-low lg:flex" aria-hidden>
        <div className="flex items-center p-6">
          <BrandMark />
        </div>
        <p className="px-7 pt-2 pb-4 text-overline text-on-surface-variant">Menu Administrasi</p>
        <div className="flex flex-1 flex-col gap-2 px-4">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
        <div className="p-4">
          <Skeleton className="h-[124px] w-full" />
        </div>
      </aside>
      <div className="flex min-h-dvh min-w-0 flex-col">
        <header className="sticky top-0 z-30 border-b border-outline-variant/30 bg-surface/85 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <p className="truncate text-xs font-semibold tracking-[0.02em] text-on-surface-variant uppercase">
              <span className="hidden md:inline">Kampung Wisata Keramik Dinoyo Kota Malang</span>
              <span className="md:hidden">Keramik Dinoyo</span>
            </p>
            <Skeleton className="size-8 rounded-full" />
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1200px] min-w-0 flex-1 px-4 pt-6 pb-16 sm:px-6 lg:pt-8">
          <PageSkeleton />
        </main>
      </div>
    </div>
  );
}
