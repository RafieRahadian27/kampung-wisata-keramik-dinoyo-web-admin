import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { getCurrentUser } from "@/lib/dal";
import { UserAuthProvider } from "@/lib/user-auth";
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
  title: {
    default: "Panel Pengelolaan • Kampung Wisata Keramik Dinoyo",
    template: "%s • Dinoyo Craft Admin",
  },
  description:
    "Panel admin paguyuban Kampung Wisata Keramik Dinoyo untuk mengelola toko, produk, akun pengrajin, dan laporan kunjungan.",
};

export const viewport: Viewport = {
  themeColor: "#9a4023",
};

/** Menerapkan tema tersimpan sebelum render agar tidak terjadi kedipan warna. */
const themeInitScript = `try{var t=localStorage.getItem('kd-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.dataset.theme='dark'}}catch(e){}`;

/**
 * Pengguna yang sedang login (atau null) dibagikan ke seluruh Client Component lewat
 * UserAuthProvider. Bila API tidak bisa dihubungi, aplikasi tetap tampil sebagai tamu;
 * halaman yang wajib login akan memverifikasi ulang sesinya sendiri (lib/dal.ts).
 */
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser().catch(() => null);

  return (
    <html lang="id" className={`${jakarta.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <UserAuthProvider user={user}>{children}</UserAuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
