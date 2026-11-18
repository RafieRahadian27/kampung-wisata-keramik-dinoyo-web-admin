import { KeyRound, Lightbulb, MessageCircleWarning, MonitorX, Smartphone } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";

const TIPS = [
  { icon: KeyRound, judul: "Gunakan kata sandi unik", teks: "Jangan pakai kata sandi yang sama dengan email atau media sosial Anda." },
  { icon: MessageCircleWarning, judul: "Waspada penipuan", teks: "Admin paguyuban tidak pernah meminta kata sandi lewat WhatsApp atau telepon." },
  { icon: MonitorX, judul: "Keluar di perangkat umum", teks: "Selalu tekan Keluar setelah memakai komputer warnet atau milik orang lain." },
  { icon: Smartphone, judul: "Periksa perangkat aktif", teks: "Keluarkan perangkat yang tidak Anda kenali dari daftar di atas." },
];

/** Panduan singkat keamanan akun untuk pengrajin. */
export function TipsKeamananCard() {
  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-8">
      <SectionTitle title="Tips Keamanan" description="Lindungi akun dan data toko Anda" icon={<Lightbulb />} />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        {TIPS.map(({ icon: Icon, judul, teks }) => (
          <li key={judul} className="flex gap-3 rounded-xl bg-surface-low p-4">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface">{judul}</p>
              <p className="text-xs leading-[18px] text-on-surface-variant">{teks}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
