import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import AdminError from "@/app/(admin)/error";
import TokoNotFound from "@/app/(admin)/toko/[slug]/not-found";
import RootError from "@/app/error";
import GlobalError from "@/app/global-error";
import NotFound from "@/app/not-found";
import { UserAuthProvider } from "@/lib/user-auth";

/** Error yang pesannya memuat detail internal — tidak boleh pernah tampil ke pengguna. */
function internalError() {
  return Object.assign(new Error("ECONNREFUSED 10.0.0.5:3306 SELECT password_hash FROM users"), { digest: "4011452023" });
}

const SECRET = /ECONNREFUSED|10\.0\.0\.5|password_hash/;

describe("error.tsx (error boundary per segmen)", () => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);

  it.each([
    ["root", RootError],
    ["(admin)", AdminError],
  ])("%s: pesan aman + kode galat, tanpa detail internal", (_segmen, Boundary) => {
    render(<Boundary error={internalError()} retry={() => undefined} />);
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getByText(/Kode galat: 4011452023/)).toBeTruthy();
    expect(document.body.textContent).not.toMatch(SECRET);
  });

  it("tombol Coba Lagi memanggil retry()", async () => {
    const retry = vi.fn();
    render(<RootError error={internalError()} retry={retry} />);
    await userEvent.click(screen.getByRole("button", { name: /coba lagi/i }));
    expect(retry).toHaveBeenCalledOnce();
  });
});

describe("global-error.tsx", () => {
  it("merender <html> & <body> sendiri, tanpa detail internal", () => {
    const html = renderToStaticMarkup(<GlobalError error={internalError()} retry={() => undefined} />);
    expect(html).toMatch(/^<html lang="id">/);
    expect(html).toContain("<body");
    expect(html).toContain("Aplikasi mengalami kendala");
    expect(html).toContain("4011452023");
    expect(html).not.toMatch(SECRET);
  });
});

describe("not-found.tsx", () => {
  it("root: halaman 404 dengan ajakan login untuk tamu", () => {
    render(
      <UserAuthProvider user={null}>
        <NotFound />
      </UserAuthProvider>,
    );
    expect(screen.getByText("Error 404")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeTruthy();
  });

  it("toko/[slug]: 404 saat notFound() dipanggil untuk slug yang tidak ada", () => {
    render(<TokoNotFound />);
    expect(screen.getByRole("heading", { name: "Toko tidak ditemukan" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /kembali ke daftar toko/i }).getAttribute("href")).toBe("/toko");
  });
});
