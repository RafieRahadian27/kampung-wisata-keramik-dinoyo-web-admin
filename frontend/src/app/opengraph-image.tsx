import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION } from "@/constants/site";

export const alt = "Dinoyo Craft Admin — Panel Pengelolaan Kampung Wisata Keramik Dinoyo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Gambar pratinjau tautan (Open Graph) 1200×630, digambar dari JSX lewat ImageResponse.
 * Tidak memakai data per-request, jadi dibuat SEKALI saat build lalu disajikan sebagai berkas statis.
 * Warna mengikuti palet terakota panel (lihat globals.css).
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#9a4023", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 88, height: 88, borderRadius: 20, background: "#fff", color: "#9a4023", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, fontWeight: 700 }}>
            KD
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 34, fontWeight: 600 }}>Kampung Wisata Keramik Dinoyo</span>
            <span style={{ fontSize: 24, letterSpacing: 4, color: "#ffdbcf", textTransform: "uppercase" }}>Sentra Pengrajin Malang</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1 }}>Panel Pengelolaan Data Toko & Produk</span>
          <span style={{ fontSize: 28, color: "#ffdbcf", lineHeight: 1.4 }}>{SITE_DESCRIPTION}</span>
        </div>
      </div>
    ),
    size,
  );
}
