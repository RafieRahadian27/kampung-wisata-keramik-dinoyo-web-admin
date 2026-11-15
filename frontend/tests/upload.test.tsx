import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MediaSection } from "@/app/(admin)/toko/components/form/MediaSection";
import { FOTO_MAX_BYTES, validateFoto } from "@/lib/validation/upload";

const file = (name: string, type: string, size = 2048) => new File([new Uint8Array(size)], name, { type });
const EMPTY = { foto: null, stempel: null };

describe("validateFoto", () => {
  it("menerima JPG/PNG/WebP sampai 2 MB", () => {
    expect(validateFoto(file("a.jpg", "image/jpeg"))).toBeUndefined();
    expect(validateFoto(file("a.png", "image/png", FOTO_MAX_BYTES))).toBeUndefined();
    expect(validateFoto(file("a.webp", "image/webp"))).toBeUndefined();
  });

  it("menolak tipe lain, berkas kosong, dan berkas terlalu besar", () => {
    expect(validateFoto(file("a.gif", "image/gif"))).toMatch(/JPG, PNG, atau WebP/);
    expect(validateFoto(file("a.pdf", "application/pdf"))).toMatch(/JPG, PNG, atau WebP/);
    expect(validateFoto(file("a.png", "image/png", 0))).toMatch(/kosong/);
    expect(validateFoto(file("a.png", "image/png", FOTO_MAX_BYTES + 1))).toMatch(/melebihi batas 2\.0 MB/);
  });
});

describe("MediaSection", () => {
  it("berkas tidak valid → pesan error, tidak diteruskan ke form", async () => {
    const onFileChange = vi.fn();
    render(<MediaSection saved={{}} files={EMPTY} onFileChange={onFileChange} />);
    // applyAccept:false → meniru pengguna yang memilih "Semua berkas" di dialog sistem.
    await userEvent.setup({ applyAccept: false }).upload(screen.getByLabelText("Unggah foto sampul"), file("skrip.svg", "image/svg+xml"));
    expect(screen.getByRole("alert").textContent).toMatch(/JPG, PNG, atau WebP/);
    expect(onFileChange).not.toHaveBeenCalled();
  });

  it("foto sampul & stempel valid → diteruskan ke form beserta jenisnya", async () => {
    const onFileChange = vi.fn();
    const sampul = file("sampul.png", "image/png");
    const stempel = file("stempel.webp", "image/webp");
    render(<MediaSection saved={{}} files={EMPTY} onFileChange={onFileChange} />);
    await userEvent.upload(screen.getByLabelText("Unggah foto sampul"), sampul);
    await userEvent.upload(screen.getByLabelText("Unggah stempel"), stempel);
    expect(onFileChange).toHaveBeenNthCalledWith(1, "foto", sampul);
    expect(onFileChange).toHaveBeenNthCalledWith(2, "stempel", stempel);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("stempel SVG ditolak (bisa memuat skrip)", async () => {
    const onFileChange = vi.fn();
    render(<MediaSection saved={{}} files={EMPTY} onFileChange={onFileChange} />);
    await userEvent.setup({ applyAccept: false }).upload(screen.getByLabelText("Unggah stempel"), file("stempel.svg", "image/svg+xml"));
    expect(screen.getByRole("alert").textContent).toMatch(/JPG, PNG, atau WebP/);
    expect(onFileChange).not.toHaveBeenCalled();
  });

  it("menampilkan error unggah dari server & status media cloud", () => {
    render(
      <MediaSection
        saved={{
          foto: "https://abc123.public.blob.vercel-storage.com/toko/sari-asih/sampul-Xy12.webp",
          stempel: "https://abc123.public.blob.vercel-storage.com/toko/sari-asih/stempel-Ab34.png",
        }}
        files={EMPTY}
        onFileChange={() => undefined}
        uploadErrors={{ stempel: "Penyimpanan berkas belum dikonfigurasi atau sedang tidak dapat dihubungi." }}
      />,
    );
    expect(screen.getByRole("alert").textContent).toMatch(/Penyimpanan berkas/);
    expect(screen.getAllByText("Tersimpan di cloud")).toHaveLength(2);
    expect(screen.getByText("sampul-Xy12.webp")).toBeTruthy();
    expect(screen.getByText("stempel-Ab34.png")).toBeTruthy();
  });
});
