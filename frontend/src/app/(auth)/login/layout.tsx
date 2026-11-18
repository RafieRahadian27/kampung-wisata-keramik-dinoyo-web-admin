/** Tata letak halaman: autentikasi layar penuh (split screen) tanpa ruang kosong di tepi. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-dvh bg-surface">{children}</main>;
}
