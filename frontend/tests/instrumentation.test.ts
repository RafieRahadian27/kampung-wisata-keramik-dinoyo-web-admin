import { describe, expect, it, vi } from "vitest";
import { onRequestError } from "@/instrumentation";
import { redactSecrets } from "@/lib/redact";

describe("instrumentation.onRequestError", () => {
  it("mencatat JSON aman: digest & path tanpa query, tanpa header/cookie/token", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = Object.assign(new Error("Gagal memanggil API dengan Authorization: Bearer abc.def.ghi"), { digest: "998877" });

    await onRequestError(
      error,
      { path: "/toko/sari-asih?token=rahasia123", method: "GET", headers: { cookie: "kd_session=sesi-rahasia", authorization: "Bearer abc.def.ghi" } },
      { routerKind: "App Router", routePath: "/(admin)/toko/[slug]", routeType: "render", renderSource: "react-server-components", revalidateReason: undefined },
    );

    const line = String(log.mock.calls[0][0]);
    const entry = JSON.parse(line);
    expect(entry).toMatchObject({ level: "error", digest: "998877", method: "GET", path: "/toko/sari-asih", routeType: "render" });
    expect(line).not.toMatch(/rahasia123|sesi-rahasia|abc\.def\.ghi/);
  });

  it("redactSecrets menyensor bearer token & pasangan kunci=nilai sensitif", () => {
    expect(redactSecrets("Bearer abc.def password=Rahasia1 token: xyz")).toBe("Bearer [DISENSOR] password=[DISENSOR] token: [DISENSOR]");
  });
});
