"use client";

/**
 * Penangkap error terakhir jika root layout ikut gagal. Menggantikan root layout sepenuhnya,
 * jadi wajib punya <html> & <body> sendiri dan tidak memuat globals.css (gaya ditulis inline).
 * Seperti boundary lain, `error.message` tidak ditampilkan — hanya `digest` untuk dicocokkan dengan log.
 */
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="id">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#fff8f4", color: "#1e1b18", display: "grid", placeItems: "center", minHeight: "100dvh", margin: 0, padding: 16 }}>
        <title>Terjadi Kesalahan • Dinoyo Craft Admin</title>
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <h1 style={{ fontSize: 24 }}>Aplikasi mengalami kendala</h1>
          <p style={{ color: "#56423d" }}>Silakan muat ulang panel pengelolaan.</p>
          {error.digest && <p style={{ color: "#56423d", fontSize: 12 }}>Kode galat: {error.digest}</p>}
          <button
            type="button"
            onClick={() => retry()}
            style={{ background: "#9a4023", color: "#fff", border: 0, borderRadius: 12, padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}
          >
            Muat Ulang
          </button>
        </div>
      </body>
    </html>
  );
}
