import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FreshOnNavigate } from "@/components/layout/FreshOnNavigate";
import { Skeleton } from "@/components/ui/Skeleton";
import { getCurrentUser } from "@/lib/dal";
import { safeRedirectPath } from "@/lib/session";
import { LoginBrandPanel } from "./components/LoginBrandPanel";
import { LoginForm } from "./components/LoginForm";

export const metadata: Metadata = {
  title: "Masuk Admin",
};

/**
 * Split screen layar penuh: panel brand (kiri) + formulir masuk (kanan).
 *
 * Partial Prerendering:
 *   - cangkang statis → panel brand beserta judul besarnya (kandidat LCP) + kerangka kartu form
 *   - menyusul        → <FormMasuk />: membaca searchParams & cookie sesi (khusus per request)
 * `searchParams` diteruskan sebagai Promise dan baru di-await di dalam <Suspense>.
 */
export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="grid min-h-dvh w-full bg-surface lg:grid-cols-2">
      <LoginBrandPanel />
      <section className="flex items-center justify-center px-4 py-10 sm:px-10 lg:px-16 lg:py-16 xl:px-24">
        <Suspense fallback={<LoginFormSkeleton />}>
          <FormMasuk searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}

async function FormMasuk({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const params = await searchParams;
  const nextPath = safeRedirectPath(params.next);

  // Sudah login dengan sesi yang masih sah → tidak perlu melihat form lagi.
  // Bila API tidak bisa dihubungi, tetap tampilkan form (pesan error muncul saat submit).
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect(nextPath);

  return (
    <FreshOnNavigate>
      <LoginForm
        nextPath={nextPath}
        justLoggedOut={params.keluar === "1"}
        sessionExpired={params.sesi === "berakhir"}
        justRegistered={params.daftar === "berhasil"}
      />
    </FreshOnNavigate>
  );
}

/** Seukuran kartu LoginForm (max-w-xl, padding sama) agar tidak terjadi loncatan tata letak. */
function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-xl rounded-3xl bg-surface-lowest p-6 shadow-float sm:p-10 xl:p-12" role="status" aria-label="Memuat formulir masuk">
      <h2 className="font-serif text-2xl leading-8 font-bold text-on-surface lg:text-3xl lg:leading-10">Masuk ke Panel Pengelolaan</h2>
      <p className="mt-2 text-base leading-6 text-on-surface-variant lg:text-lg lg:leading-7">Khusus admin paguyuban dan pengrajin terdaftar.</p>
      <div className="mt-8 flex flex-col gap-6">
        <Skeleton className="h-[76px] w-full" />
        <Skeleton className="h-[76px] w-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
