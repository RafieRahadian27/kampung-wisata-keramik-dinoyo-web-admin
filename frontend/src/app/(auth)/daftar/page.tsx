import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FreshOnNavigate } from "@/components/layout/FreshOnNavigate";
import { getCurrentUser } from "@/lib/dal";
import { LoginBrandPanel } from "../login/components/LoginBrandPanel";
import { RegisterForm } from "./components/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Pengrajin",
};

/**
 * Seluruh tampilan (panel brand + formulir) tidak bergantung pada siapa pengunjungnya, jadi
 * semuanya masuk cangkang statis. Satu-satunya bagian per request — cek "sudah login?" —
 * dipisah ke <AlihkanBilaSudahMasuk /> di balik <Suspense> yang tidak merender apa pun.
 */
export default function DaftarPage() {
  // Panel brand yang sama dengan halaman login (kiri) + formulir (kanan).
  // Formulir lebih panjang, jadi kolomnya diberi porsi lebih lebar (5 : 7) di layar besar.
  return (
    <div className="grid min-h-dvh w-full bg-surface lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <LoginBrandPanel />
      <section className="flex items-center justify-center px-4 py-8 sm:px-10 sm:py-10 lg:p-12 xl:px-20">
        <FreshOnNavigate>
          <RegisterForm />
        </FreshOnNavigate>
      </section>
      <Suspense fallback={null}>
        <AlihkanBilaSudahMasuk />
      </Suspense>
    </div>
  );
}

/** Sudah login → tidak perlu mendaftar lagi. */
async function AlihkanBilaSudahMasuk() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/");
  return null;
}
