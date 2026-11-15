import type { Instrumentation } from "next";
import { redactSecrets } from "@/lib/redact";

/**
 * Dipanggil Next.js untuk setiap error server (render Server Component, Route Handler,
 * Server Action, proxy). Dicatat sebagai satu baris JSON yang aman:
 *  - path TANPA query string (bisa memuat data pengguna)
 *  - TANPA header request (berisi cookie sesi)
 *  - pesan & stack disensor dari pola token/kata sandi
 *  - `digest` sama dengan yang ditampilkan di halaman error → error di layar bisa dicocokkan dengan log
 * Log ini hanya di server; pengguna tetap hanya melihat pesan umum di error.tsx.
 */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const err = error instanceof Error ? error : new Error(String(error));
  const digest = typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : undefined;

  console.error(
    JSON.stringify({
      level: "error",
      time: new Date().toISOString(),
      service: "dinoyo-admin-web",
      msg: "Next.js server error",
      digest,
      method: request.method,
      path: request.path.split("?")[0],
      routePath: context.routePath,
      routeType: context.routeType,
      err: { name: err.name, message: redactSecrets(err.message), stack: err.stack && redactSecrets(err.stack) },
    }),
  );
};
