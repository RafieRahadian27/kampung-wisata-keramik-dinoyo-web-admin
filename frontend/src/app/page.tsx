import { redirect } from "next/navigation";
import { Suspense } from "react";
import { homePathFor } from "@/constants/navigation";
import { verifySession } from "@/lib/dal";

/**
 * Beranda diarahkan ke halaman awal sesuai peran (admin → dashboard, pengrajin → toko miliknya).
 * Pembacaan sesi dibungkus <Suspense> agar tidak memblokir prerender cangkang (Cache Components).
 */
export default function Home() {
  return (
    <Suspense fallback={null}>
      <ArahkanSesuaiPeran />
    </Suspense>
  );
}

async function ArahkanSesuaiPeran() {
  const user = await verifySession();
  return redirect(homePathFor(user.izin));
}
