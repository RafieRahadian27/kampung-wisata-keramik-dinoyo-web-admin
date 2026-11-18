import { AtSign, Clock, IdCard, Info, Mail, MapPin, Phone, Store, UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatRelatif } from "@/lib/utils";
import type { ProfilData } from "@/types";

const formatWaktu = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "long", timeStyle: "short" }).format(new Date(iso));

function Row({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface-low px-4 py-3">
      <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-lowest text-primary shadow-card [&_svg]:size-4" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] text-on-surface-variant">{label}</dt>
        <dd className="text-sm font-semibold break-words text-on-surface">{children}</dd>
      </div>
    </div>
  );
}

/** Data akun (baca saja). Perubahan nama/NIK/kontak dilakukan lewat admin paguyuban agar data verifikasi tetap sah. */
export function ProfilCard({ profil }: { profil: ProfilData }) {
  return (
    <section className="flex flex-col gap-6 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-8">
      <SectionTitle title="Informasi Akun" description="Data yang terdaftar di sistem paguyuban" icon={<UserRound />} />

      <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Row icon={<AtSign />} label="Username">
          {profil.username}
        </Row>
        <Row icon={<Mail />} label="Email">
          {profil.email}
        </Row>
        <Row icon={<Clock />} label="Login terakhir">
          {profil.terakhirLogin ? (
            <span title={formatWaktu(profil.terakhirLogin)}>
              {formatWaktu(profil.terakhirLogin)} <span className="font-normal text-on-surface-variant">({formatRelatif(profil.terakhirLogin)})</span>
            </span>
          ) : (
            "Belum tercatat"
          )}
        </Row>
        <Row icon={<UserRound />} label="Peran di sistem">
          {profil.akun ? `${profil.peran} • ${profil.akun.peran}` : profil.peran}
        </Row>
        {profil.akun && (
          <>
            <Row icon={<IdCard />} label="NIK (disamarkan)">
              <span className="tracking-wider">{profil.akun.nik}</span>
            </Row>
            <Row icon={<Phone />} label="WhatsApp">
              {profil.akun.whatsapp}
            </Row>
            <Row icon={<Store />} label="Nama toko saat mendaftar">
              {profil.akun.toko}
            </Row>
            <Row icon={<MapPin />} label="Lokasi toko">
              {profil.akun.lokasi}
            </Row>
          </>
        )}
      </dl>

      {profil.toko.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-overline text-on-surface-variant">Toko yang Anda kelola</p>
          <ul className="flex flex-wrap gap-2">
            {profil.toko.map((toko) => (
              <li key={toko.slug}>
                <Link href={`/toko/${toko.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/50 px-4 py-2.5 text-sm font-semibold text-on-surface transition hover:border-primary/40 hover:bg-surface-low">
                  <Store className="size-4 text-primary" aria-hidden />
                  {toko.nama}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="flex items-start gap-2 rounded-xl bg-tertiary-container/40 px-4 py-3 text-xs leading-[18px] text-on-surface">
        <Info className="mt-0.5 size-3.5 shrink-0 text-tertiary" aria-hidden />
        Nama lengkap, NIK, dan kontak dipakai untuk verifikasi paguyuban. Untuk mengubahnya, hubungi sekretariat paguyuban.
      </p>
    </section>
  );
}
