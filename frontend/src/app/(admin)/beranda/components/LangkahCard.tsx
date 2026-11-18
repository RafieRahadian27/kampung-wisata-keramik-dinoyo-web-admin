import { ArrowUpRight, ListTodo, PartyPopper } from "lucide-react";
import Link from "next/link";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { cn } from "@/lib/utils";
import type { BerandaData } from "@/types";

/** "Langkah berikutnya": daftar tugas yang diturunkan dari kelengkapan profil & stok habis. */
export function LangkahCard({ data, className }: { data: BerandaData; className?: string }) {
  const toko = data.toko[0];
  const persen = toko?.kelengkapan.persen ?? 0;
  const tone = persen >= 80 ? "secondary" : persen >= 50 ? "tertiary" : "error";

  return (
    <section className={cn("flex flex-col gap-5 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-6", className)}>
      <div className="flex items-center gap-4">
        <ProgressRing value={persen} tone={tone} label="Kelengkapan profil toko" size={84} />
        <div className="min-w-0">
          <h2 className="font-serif text-xl font-semibold text-on-surface">Kelengkapan Toko</h2>
          <p className="text-xs leading-[18px] text-on-surface-variant">
            {toko ? `${toko.kelengkapan.selesai} dari ${toko.kelengkapan.total} bagian profil sudah lengkap.` : "Belum ada toko tertaut."}
            {persen < 100 && " Profil lengkap lebih sering muncul di pencarian pengunjung."}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-2 text-overline text-on-surface-variant">
          <ListTodo className="size-3.5" aria-hidden />
          Langkah berikutnya
        </p>
        {data.langkahBerikutnya.length === 0 ? (
          <p className="flex items-center gap-3 rounded-xl bg-secondary-container/50 px-4 py-4 text-sm font-semibold text-on-surface">
            <PartyPopper className="size-5 text-secondary" aria-hidden />
            Semua beres! Profil toko & stok Anda sudah lengkap.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {data.langkahBerikutnya.map((langkah, index) => (
              <li key={`${langkah.label}-${index}`}>
                <Link href={langkah.href} className="group flex items-center gap-3 rounded-xl border border-outline-variant/40 px-3 py-3 transition hover:border-primary/40 hover:bg-surface-low">
                  <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-xs font-bold text-primary">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-on-surface">{langkah.label}</span>
                    <span className="block truncate text-[11px] text-on-surface-variant">{langkah.toko}</span>
                  </span>
                  <ArrowUpRight className="size-4 shrink-0 text-on-surface-variant transition group-hover:text-primary" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
