import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { WebVitals } from "@/components/site/WebVitals";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/constants/site";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s • ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  /**
   * Panel privat: jangan diindeks, jangan ikuti tautannya. robots.txt TIDAK cukup untuk ini
   * (lihat app/robots.ts) — noindex inilah yang benar-benar menjaga URL keluar dari Google.
   * Header X-Robots-Tag yang sama dipasang di next.config.ts untuk respons non-HTML.
   */
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  // Pratinjau tautan (mis. saat link panel dibagikan di grup WhatsApp paguyuban).
  // Gambarnya dibuat oleh app/opengraph-image.tsx.
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#9a4023",
};

/** Menerapkan tema tersimpan sebelum render agar tidak terjadi kedipan warna. */
const themeInitScript = `try{var t=localStorage.getItem('kd-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.dataset.theme='dark'}}catch(e){}`;

/**
 * Root layout sengaja TIDAK membaca cookie/sesi. Dulu layout ini menunggu `getCurrentUser()`
 * di puncak pohon — akibatnya SEMUA rute (termasuk /login) menjadi dinamis dan tidak satu pun
 * bisa diprerender. Kini data pengguna dibaca lebih dalam, di balik <Suspense>:
 *   - area admin  → app/(admin)/layout.tsx (AdminShell membawa UserAuthProvider sendiri)
 *   - login/daftar → komponen kecil yang dialirkan menyusul
 * Hasilnya: layout, font, tema, dan kerangka halaman masuk ke cangkang statis.
 *
 * Tema dipasang lewat skrip inline di <head>, bukan dari cookie di server, supaya <html> tetap statis.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <WebVitals />
        <ThemeProvider>
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
