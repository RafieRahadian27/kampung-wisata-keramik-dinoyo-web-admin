"use client";

import { ErrorPanel } from "@/components/feedback/ErrorPanel";

/**
 * Error boundary segmen root (mis. halaman login/daftar/beranda). Root layout tetap tampil,
 * jadi tema & font aplikasi masih berlaku. Error di root layout sendiri ditangani global-error.tsx,
 * sedangkan halaman admin punya boundary sendiri di (admin)/error.tsx agar sidebar tetap tampil.
 *
 * `retry()` mengambil ulang data server lalu me-render ulang segmen ini.
 */
export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <ErrorPanel error={error} onRetry={retry} title="Halaman gagal dimuat" homeHref="/" homeLabel="Ke Beranda" />
    </main>
  );
}
