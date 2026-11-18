import { CircleAlert, CircleCheck, ShieldHalf } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { formatRelatif } from "@/lib/utils";
import type { ProfilData } from "@/types";

const LEVEL = (skor: number) =>
  skor >= 100
    ? { label: "Sangat aman", tone: "secondary" as const, className: "text-secondary" }
    : skor >= 75
      ? { label: "Aman", tone: "secondary" as const, className: "text-secondary" }
      : skor >= 50
        ? { label: "Perlu perhatian", tone: "tertiary" as const, className: "text-tertiary" }
        : { label: "Berisiko", tone: "error" as const, className: "text-error" };

/** Skor keamanan dihitung backend dari data tercatat: usia kata sandi, jumlah sesi, status akun. */
export function SkorKeamananCard({ keamanan }: { keamanan: ProfilData["keamanan"] }) {
  const level = LEVEL(keamanan.skor);

  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-8">
      <div className="flex items-center gap-5">
        <ProgressRing value={keamanan.skor} tone={level.tone} size={104} thickness={10} label="Skor keamanan akun">
          <span className="font-serif text-2xl font-bold text-on-surface">{keamanan.skor}</span>
          <span className="text-[10px] text-on-surface-variant">dari 100</span>
        </ProgressRing>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-overline text-on-surface-variant">
            <ShieldHalf className="size-3.5" aria-hidden />
            Skor Keamanan
          </p>
          <p className={`font-serif text-2xl font-bold ${level.className}`}>{level.label}</p>
          <p className="text-xs text-on-surface-variant">
            Kata sandi terakhir diganti: {keamanan.passwordTerakhir ? formatRelatif(keamanan.passwordTerakhir) : "belum pernah"}
          </p>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {keamanan.pemeriksaan.map((item) => (
          <li key={item.label} className={`flex items-start gap-3 rounded-xl px-4 py-3 ${item.ok ? "bg-secondary-container/30" : "bg-error-container/40"}`}>
            {item.ok ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-secondary" aria-label="Terpenuhi" /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-error" aria-label="Belum terpenuhi" />}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-on-surface">{item.label}</p>
              {!item.ok && <p className="text-xs text-on-surface-variant">{item.saran}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
