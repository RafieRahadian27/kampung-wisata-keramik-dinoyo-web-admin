import { CalendarDays, ChartColumnBig, Clock, MapPin, PackagePlus, Pencil, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import { IMAGE_SIZES } from "@/constants/imageSizes";
import { ButtonLink } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import type { BerandaData } from "@/types";
import { STATUS_TOKO } from "../../toko/components/tokoMeta";

/** Banner pembuka: foto sampul toko utama, sapaan, status, dan tiga angka kunci. */
export function BerandaHero({ data }: { data: BerandaData }) {
  const toko = data.toko[0];
  const status = toko ? STATUS_TOKO[toko.status] : null;
  const usia = toko ? new Date().getFullYear() - toko.tahunBerdiri : 0;

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-brand text-white shadow-float">
      {toko && <Image src={toko.foto} alt="" fill preload sizes={IMAGE_SIZES.kolomPenuh} className="-z-20 object-cover" />}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#3b1408]/95 via-[#5a200e]/85 to-[#5a200e]/40" aria-hidden />

      <div className="flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
        <div className="flex max-w-2xl min-w-0 flex-col gap-4">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <CalendarDays className="size-3.5" aria-hidden />
            {data.tanggal}
          </p>
          <div>
            <p className="text-base text-white/80">
              {data.salam}, {data.pengguna.sapaan} 👋
            </p>
            <h1 className="mt-1 font-serif text-3xl leading-tight font-bold sm:text-4xl xl:text-5xl">{toko?.nama ?? "Dashboard Toko"}</h1>
          </div>

          {toko && (
            <>
              <div className="flex flex-wrap gap-2">
                {status && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                    {status.icon}
                    {status.label}
                  </span>
                )}
                {toko.akreditasi && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                    <ShieldCheck className="size-3.5" aria-hidden />
                    Terakreditasi Paguyuban
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">{toko.spesialisasi}</span>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/85">
                <li className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden />
                  {toko.alamat || toko.lokasiGang}
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <Clock className="size-4" aria-hidden />
                  {toko.jamBuka}
                </li>
                <li>
                  Berdiri sejak {toko.tahunBerdiri} ({usia} tahun)
                </li>
              </ul>
            </>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            {/* `cn()` tidak menyelesaikan bentrokan class, jadi warna di atas latar foto diberi `!`
                agar selalu menang atas warna bawaan variant (text-on-primary / text-on-surface-variant). */}
            <ButtonLink href="/produk/tambah" size="lg" className="bg-white! text-brand! shadow-card hover:brightness-95">
              <PackagePlus className="size-5" aria-hidden />
              Tambah Produk
            </ButtonLink>
            {toko && (
              <ButtonLink href={`/toko/${toko.slug}`} size="lg" variant="ghost" className="border border-white/40 text-white! hover:bg-white/10!">
                <Pencil className="size-4" aria-hidden />
                Edit Profil Toko
              </ButtonLink>
            )}
            <ButtonLink href="/laporan-toko" size="lg" variant="ghost" className="text-white! hover:bg-white/10!">
              <ChartColumnBig className="size-4" aria-hidden />
              Laporan
            </ButtonLink>
          </div>
        </div>

        {toko && (
          <dl className="grid shrink-0 grid-cols-3 gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-md sm:gap-6 sm:p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <ProgressRing value={toko.kelengkapan.persen} size={76} thickness={7} tone="white" trackClassName="stroke-white/20" label="Kelengkapan profil">
                <span className="font-serif text-lg font-bold">{toko.kelengkapan.persen}%</span>
              </ProgressRing>
              <dt className="text-[11px] text-white/80">Profil lengkap</dt>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <dd className="flex items-center gap-1 font-serif text-3xl font-bold">
                {data.performa.rating.toLocaleString("id-ID")}
                <Star className="size-5 fill-amber-300 text-amber-300" aria-hidden />
              </dd>
              <dt className="text-[11px] text-white/80">{data.performa.jumlahUlasan} ulasan*</dt>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 text-center">
              <dd className="font-serif text-3xl font-bold">{data.produk.totalKoleksi}</dd>
              <dt className="text-[11px] text-white/80">Produk katalog</dt>
            </div>
          </dl>
        )}
      </div>
    </section>
  );
}
