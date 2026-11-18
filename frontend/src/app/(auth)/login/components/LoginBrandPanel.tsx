import { BadgeCheck, Palette, ShieldUser, type LucideIcon } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";

interface RoleInfo {
  title: string;
  description: string;
  icon: LucideIcon;
}

const ROLES: RoleInfo[] = [
  { title: "Admin Paguyuban", description: "Mengelola seluruh toko, produk, dan akun pengrajin.", icon: ShieldUser },
  { title: "Pengrajin", description: "Mengelola profil, produk, dan workshop toko sendiri.", icon: Palette },
];

function RoleCard({ title, description, icon: Icon }: RoleInfo) {
  return (
    <li className="flex items-start gap-4 rounded-2xl bg-white/10 p-5 xl:p-6">
      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-white">
        <Icon className="size-5" aria-hidden />
      </span>
      <div>
        <p className="text-base leading-6 font-semibold text-white xl:text-lg xl:leading-7">{title}</p>
        <p className="text-base leading-[22px] text-brand-tint">{description}</p>
      </div>
    </li>
  );
}

/** Kolom kiri halaman login (latar terakota) — Server Component statis tanpa JavaScript klien. */
export function LoginBrandPanel() {
  return (
    <section className="relative flex flex-col justify-between gap-10 overflow-hidden bg-brand px-6 py-10 sm:px-10 lg:min-h-dvh lg:px-16 lg:py-14 xl:px-24">
      <span className="pointer-events-none absolute -bottom-32 left-1/3 size-[28rem] rounded-full bg-brand-soft/40 blur-3xl" aria-hidden />
      <span className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand-soft/30 blur-3xl" aria-hidden />

      <BrandMark variant="login" className="relative" />

      <div className="relative flex max-w-2xl flex-col gap-6 lg:gap-8">
        <span className="w-fit rounded-full bg-brand-soft px-4 py-1.5 text-base text-white">Panel Pengelolaan Data</span>
        <h1 className="font-serif text-2xl leading-9 font-bold text-white lg:text-4xl lg:leading-[1.2] xl:text-5xl">
          Kelola data toko dan produk pengrajin Dinoyo
        </h1>
        <p className="max-w-xl text-base leading-[26px] text-brand-tint lg:text-lg lg:leading-8">
          Perbarui profil toko, katalog produk, dan status workshop agar informasi di direktori selalu akurat.
        </p>
        <ul className="hidden flex-col gap-4 sm:flex">
          {ROLES.map((role) => (
            <RoleCard key={role.title} {...role} />
          ))}
        </ul>
      </div>

      <p className="relative hidden items-center gap-2 text-base text-brand-tint lg:flex">
        <BadgeCheck className="size-4 shrink-0" aria-hidden />
        Sistem Informasi Terpadu Dinoyo Pottery • Versi 2.4
      </p>
    </section>
  );
}
