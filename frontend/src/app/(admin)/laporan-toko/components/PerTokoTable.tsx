import { Store } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatAngka } from "@/lib/utils";
import type { LaporanTokoData } from "@/types";

/** Rincian angka per toko — berguna bila satu pengrajin mengelola lebih dari satu gerai. */
export function PerTokoTable({ perToko }: { perToko: LaporanTokoData["perToko"] }) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-5 sm:p-6">
        <SectionTitle variant="sans" icon={<Store className="mt-1 size-5 shrink-0 text-primary" aria-hidden />} title="Rincian per Toko" description="Kunjungan, klik WhatsApp, dan reservasi tiap gerai milik Anda" />
      </div>
      {perToko.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-on-surface-variant">Belum ada toko yang tertaut ke akun Anda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-low text-overline text-on-surface-variant">
              <tr>
                <th scope="col" className="px-6 py-3">Toko</th>
                <th scope="col" className="px-4 py-3 text-right">Kunjungan</th>
                <th scope="col" className="px-4 py-3 text-right">Klik WA</th>
                <th scope="col" className="px-4 py-3 text-right">Reservasi</th>
                <th scope="col" className="px-6 py-3 text-right">Tren</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {perToko.map((item) => (
                <tr key={item.slug}>
                  <td className="px-6 py-4">
                    <Link href={`/toko/${item.slug}`} className="font-semibold text-on-surface hover:text-primary hover:underline">
                      {item.nama}
                    </Link>
                    <p className="text-xs text-on-surface-variant">{item.lokasiGang}</p>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold tabular-nums">{formatAngka(item.kunjungan)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{formatAngka(item.klikWhatsapp)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">{item.reservasi}</td>
                  <td className={`px-6 py-4 text-right font-semibold tabular-nums ${item.pertumbuhan >= 0 ? "text-secondary" : "text-error"}`}>
                    {item.pertumbuhan >= 0 ? "+" : ""}
                    {item.pertumbuhan}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
