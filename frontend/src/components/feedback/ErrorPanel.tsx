"use client";

import { RefreshCw, ServerCrash } from "lucide-react";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface ErrorPanelProps {
  error: Error & { digest?: string };
  onRetry: () => void;
  title?: string;
  homeHref?: string;
  homeLabel?: string;
}

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Tampilan error yang AMAN untuk pengguna: `error.message` tidak pernah ditampilkan karena bisa
 * memuat detail internal (query, path server, alamat host). Yang ditampilkan hanya pesan umum dan
 * `digest` — kode yang bisa dicocokkan dengan log server (lihat src/instrumentation.ts).
 */
export function ErrorPanel({ error, onRetry, title = "Data gagal dimuat", homeHref = "/dashboard", homeLabel = "Ke Dashboard" }: ErrorPanelProps) {
  useEffect(() => {
    // Detail lengkap hanya untuk developer di console browser.
    console.error("[Dinoyo Admin]", error);
  }, [error]);

  return (
    <Card className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-4 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-error-container text-error">
        <ServerCrash className="size-7" aria-hidden />
      </span>
      <h1 className="font-serif text-2xl font-bold text-on-surface">{title}</h1>
      <p className="text-sm leading-[22px] text-on-surface-variant">
        Terjadi kendala saat memuat halaman ini. Silakan coba lagi beberapa saat lagi. Bila masalah berlanjut, hubungi admin paguyuban dan sertakan kode galat di bawah.
      </p>
      {isDevelopment && (
        <p className="rounded-lg bg-surface-container px-3 py-2 text-xs text-on-surface-variant">
          Mode development: pastikan backend Express berjalan (<code>npm run dev</code> di folder backend). Detail error ada di console.
        </p>
      )}
      {error.digest && <p className="text-[11px] text-on-surface-variant">Kode galat: {error.digest}</p>}
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden />
          Coba Lagi
        </Button>
        <ButtonLink href={homeHref} variant="tonal">
          {homeLabel}
        </ButtonLink>
      </div>
    </Card>
  );
}
