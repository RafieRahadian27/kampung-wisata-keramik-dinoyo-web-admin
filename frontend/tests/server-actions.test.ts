import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminUser } from "@/types";

/**
 * Server Action diuji sebagai fungsi biasa. DAL (sesi), cookies, dan redirect di-mock,
 * jadi tes tidak membutuhkan backend Express yang berjalan.
 */
const dal = vi.hoisted(() => ({ getCurrentUser: vi.fn(), authFetch: vi.fn() }));
const nav = vi.hoisted(() => ({ redirect: vi.fn((url: string) => { throw new Error(`NEXT_REDIRECT ${url}`); }) }));
const cookieStore = vi.hoisted(() => ({ delete: vi.fn() }));

vi.mock("@/lib/dal", () => dal);
vi.mock("next/navigation", () => nav);
vi.mock("next/headers", () => ({ cookies: async () => cookieStore }));

const { removeProduk, updateAkunStatus, uploadMediaToko } = await import("@/lib/actions/api");
const { ApiError, parseResponse } = await import("@/lib/api/config");

const admin = { id: 1, role: "admin", izin: ["toko:update", "produk:delete", "akun:update"] } as unknown as AdminUser;
const pengrajin = { id: 2, role: "pengrajin", izin: ["toko:update", "produk:delete"] } as unknown as AdminUser;

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const png = (size = 1024) => new File([new Uint8Array(size)], "sampul.png", { type: "image/png" });
const formWith = (file: File) => {
  const form = new FormData();
  form.append("berkas", file);
  return form;
};

beforeEach(() => {
  dal.getCurrentUser.mockResolvedValue(admin);
  dal.authFetch.mockResolvedValue(json(200, { success: true, data: null, message: "OK" }));
});

describe("Autentikasi & otorisasi di dalam Server Action", () => {
  it("401 tanpa sesi — request tidak diteruskan ke API", async () => {
    dal.getCurrentUser.mockResolvedValue(null);
    expect(await removeProduk(3)).toMatchObject({ ok: false, status: 401 });
    expect(dal.authFetch).not.toHaveBeenCalled();
  });

  it("403 bila peran tidak punya izin (tombol disembunyikan bukan pengaman)", async () => {
    dal.getCurrentUser.mockResolvedValue(pengrajin);
    expect(await updateAkunStatus(5, "aktif")).toMatchObject({ ok: false, status: 403 });
    expect(dal.authFetch).not.toHaveBeenCalled();
  });

  it("400 untuk argumen tidak valid", async () => {
    expect(await removeProduk(-1)).toMatchObject({ ok: false, status: 400 });
    expect(await updateAkunStatus(5, "superadmin" as never)).toMatchObject({ ok: false, status: 400 });
    expect(dal.authFetch).not.toHaveBeenCalled();
  });
});

describe("Respons saat API gagal", () => {
  it("503 dengan pesan ramah saat Express tidak dapat dihubungi", async () => {
    dal.authFetch.mockRejectedValue(new TypeError("fetch failed: connect ECONNREFUSED 127.0.0.1:4000"));
    const result = await removeProduk(3);
    expect(result).toEqual({ ok: false, status: 503, message: "Server API tidak dapat dihubungi." });
  });

  it("500 dari API → pesan umum, isi respons mentah tidak diteruskan", async () => {
    dal.authFetch.mockResolvedValue(json(500, { success: false, message: "ER_PARSE_ERROR at toko.repository.ts:42", error: { code: "INTERNAL_ERROR" } }));
    const result = await removeProduk(3);
    expect(result).toMatchObject({ ok: false, status: 500 });
    expect(JSON.stringify(result)).not.toMatch(/ER_PARSE_ERROR|repository/);
  });

  it("4xx dari API → pesan validasi diteruskan ke pengguna", async () => {
    dal.authFetch.mockResolvedValue(json(404, { success: false, message: "Produk tidak ditemukan", error: { code: "NOT_FOUND" } }));
    expect(await removeProduk(3)).toEqual({ ok: false, status: 404, message: "Produk tidak ditemukan" });
  });

  it("401 dari API → cookie sesi dihapus & diarahkan ke login", async () => {
    dal.authFetch.mockResolvedValue(json(401, { success: false, message: "Sesi tidak valid" }));
    await expect(removeProduk(3)).rejects.toThrow("NEXT_REDIRECT /login?sesi=berakhir");
    expect(cookieStore.delete).toHaveBeenCalled();
  });

  it("parseResponse melempar ApiError dengan status & pesan dari body", async () => {
    await expect(parseResponse(json(403, { message: "Akses ditolak" }))).rejects.toEqual(new ApiError(403, "Akses ditolak"));
    await expect(parseResponse(new Response("<html>Bad Gateway</html>", { status: 502 }))).rejects.toMatchObject({ status: 502, message: "Permintaan gagal (502)" });
  });
});

describe("uploadMediaToko (Pilih File → Validasi → Simpan ke Storage)", () => {
  it("menolak tipe selain JPG/PNG/WebP sebelum dikirim ke API", async () => {
    const svg = new File(["<svg onload=alert(1)>"], "x.svg", { type: "image/svg+xml" });
    expect(await uploadMediaToko("toko-uji", "foto", formWith(svg))).toMatchObject({ ok: false, status: 422 });
    expect(dal.authFetch).not.toHaveBeenCalled();
  });

  it("menolak berkas di atas 2 MB", async () => {
    expect(await uploadMediaToko("toko-uji", "foto", formWith(png(2 * 1024 * 1024 + 1)))).toMatchObject({ ok: false, status: 422 });
    expect(dal.authFetch).not.toHaveBeenCalled();
  });

  it("menolak slug tidak valid & form tanpa berkas", async () => {
    expect(await uploadMediaToko("../akun", "foto", formWith(png()))).toMatchObject({ ok: false, status: 400 });
    expect(await uploadMediaToko("toko-uji", "foto", new FormData())).toMatchObject({ ok: false, status: 400 });
  });

  it("berkas sah diteruskan sebagai body biner PUT /toko/:slug/foto", async () => {
    const file = png();
    expect(await uploadMediaToko("toko-uji", "foto", formWith(file))).toMatchObject({ ok: true });
    const [path, init] = dal.authFetch.mock.calls[0];
    expect(path).toBe("/toko/toko-uji/foto");
    expect(init.method).toBe("PUT");
    expect(init.headers["Content-Type"]).toBe("image/png");
    expect(init.body).toBeInstanceOf(Blob);
    expect((init.body as Blob).size).toBe(file.size);
  });

  it("stempel diteruskan ke PUT /toko/:slug/stempel; jenis lain ditolak", async () => {
    expect(await uploadMediaToko("toko-uji", "stempel", formWith(png()))).toMatchObject({ ok: true });
    expect(dal.authFetch.mock.calls[0][0]).toBe("/toko/toko-uji/stempel");
    expect(await uploadMediaToko("toko-uji", "../../akun" as never, formWith(png()))).toMatchObject({ ok: false, status: 400 });
    expect(dal.authFetch).toHaveBeenCalledTimes(1);
  });
});
