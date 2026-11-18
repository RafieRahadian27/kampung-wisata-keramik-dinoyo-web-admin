import { Activity, MonitorSmartphone, Package, ShieldCheck, Store } from "lucide-react";
import type { ProfilData, StatusAkun } from "@/types";
import { inisial } from "@/lib/utils";

const STATUS_AKUN: Record<StatusAkun, string> = { aktif: "Akun Aktif", menunggu: "Menunggu Aktivasi", ditangguhkan: "Ditangguhkan" };

/** Banner profil: avatar besar, identitas, dan empat statistik akun. */
export function ProfilHero({ profil }: { profil: ProfilData }) {
  const stats = [
    { icon: Store, label: "Toko dikelola", value: profil.statistik.jumlahToko },
    { icon: Package, label: "Produk di katalog", value: profil.statistik.jumlahProduk },
    { icon: Activity, label: "Aktivitas tercatat", value: profil.statistik.totalAktivitas },
    { icon: MonitorSmartphone, label: "Perangkat aktif", value: profil.statistik.jumlahSesi },
  ];

  return (
    <section className="overflow-hidden rounded-3xl bg-surface-lowest shadow-card">
      <div className="relative h-32 bg-linear-to-r from-brand via-primary to-brand-soft sm:h-40">
        <span className="absolute -top-10 right-10 size-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <span className="absolute bottom-0 left-1/3 size-32 rounded-full bg-white/10 blur-2xl" aria-hidden />
      </div>
      <div className="flex flex-col gap-6 px-5 pb-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end">
          <span className="inline-flex size-24 shrink-0 items-center justify-center rounded-3xl border-4 border-surface-lowest bg-primary font-serif text-3xl font-bold text-on-primary shadow-float sm:size-28">
            {inisial(profil.nama)}
          </span>
          <div className="min-w-0 pb-1">
            <h1 className="font-serif text-2xl leading-8 font-bold text-on-surface sm:text-3xl sm:leading-10">{profil.nama}</h1>
            <p className="text-sm text-on-surface-variant">
              @{profil.username} • tampil sebagai <strong className="text-on-surface">{profil.sapaan}</strong>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-fixed px-3 py-1 text-xs font-semibold text-on-primary-fixed-variant">
                <ShieldCheck className="size-3.5" aria-hidden />
                {profil.peran}
              </span>
              {profil.akun && (
                <span className="inline-flex items-center rounded-full bg-secondary-container px-3 py-1 text-xs font-semibold text-secondary-text">
                  {STATUS_AKUN[profil.akun.status]}
                </span>
              )}
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex min-w-28 flex-col gap-1 rounded-2xl bg-surface-low px-4 py-3">
              <Icon className="size-4 text-primary" aria-hidden />
              <dd className="font-serif text-2xl leading-8 font-bold text-on-surface">{value}</dd>
              <dt className="text-[11px] text-on-surface-variant">{label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
