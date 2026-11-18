import { CalendarDays } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { formatRupiah } from "@/lib/utils";
import type { LaporanTokoData } from "@/types";

const STATUS: Record<LaporanTokoData["reservasi"][number]["status"], { label: string; tone: BadgeTone }> = {
  selesai: { label: "Selesai", tone: "secondary" },
  terjadwal: { label: "Terjadwal", tone: "primary" },
  menunggu: { label: "Menunggu", tone: "tertiary" },
};

/** Riwayat & jadwal reservasi workshop di toko milik pengguna, lengkap dengan nilai pemesanan. */
export function ReservasiTokoCard({ reservasi }: { reservasi: LaporanTokoData["reservasi"] }) {
  const total = reservasi.reduce((sum, item) => sum + item.nilai, 0);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 sm:p-6">
        <SectionTitle variant="sans" icon={<CalendarDays className="mt-1 size-5 shrink-0 text-primary" aria-hidden />} title="Reservasi Workshop" description="Rombongan yang memesan kelas di toko Anda" />
        <div className="text-right">
          <p className="text-[11px] text-on-surface-variant">Total nilai pemesanan</p>
          <p className="font-serif text-xl font-bold text-primary">{formatRupiah(total)}</p>
        </div>
      </div>
      {reservasi.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-on-surface-variant">Belum ada reservasi.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface-low text-overline text-on-surface-variant">
              <tr>
                <th scope="col" className="px-6 py-3">Pemesan</th>
                <th scope="col" className="px-4 py-3">Paket</th>
                <th scope="col" className="px-4 py-3">Jadwal</th>
                <th scope="col" className="px-4 py-3 text-right">Nilai</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {reservasi.map((item) => (
                <tr key={item.id} className="hover:bg-surface-low/60">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-on-surface">{item.pemesan}</p>
                    <p className="text-xs text-on-surface-variant">
                      {item.detail} • {item.id}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-on-surface">{item.paket}</p>
                    <p className="text-xs text-on-surface-variant">{item.toko}</p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="text-on-surface">{item.tanggal}</p>
                    <p className="text-xs text-on-surface-variant">{item.jam}</p>
                  </td>
                  <td className="px-4 py-4 text-right font-semibold whitespace-nowrap text-on-surface tabular-nums">{formatRupiah(item.nilai)}</td>
                  <td className="px-6 py-4">
                    <Badge tone={STATUS[item.status].tone}>{STATUS[item.status].label}</Badge>
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
