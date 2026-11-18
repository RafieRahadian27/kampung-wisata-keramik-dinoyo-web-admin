import { Scale } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { LaporanTokoData } from "@/types";

/** Bandingkan toko dengan rata-rata seluruh sentra Dinoyo pada tiga indikator utama. */
export function BandingSentraCard({ banding }: { banding: LaporanTokoData["banding"] }) {
  const baris = [
    { label: "Konversi WhatsApp", toko: banding.konversiToko, sentra: banding.konversiSentra, satuan: "%" },
    { label: "Kunjungan per hari", toko: banding.kunjunganHarianToko, sentra: banding.kunjunganHarianSentra, satuan: "" },
    { label: "Rating pengunjung", toko: banding.ratingToko, sentra: banding.ratingSentra, satuan: "" },
  ];

  return (
    <Card className="bg-linear-to-br from-surface-lowest to-primary-fixed/40">
      <SectionTitle variant="sans" icon={<Scale className="mt-1 size-5 shrink-0 text-primary" aria-hidden />} title="Dibanding Rata-rata Sentra" description="Posisi toko Anda di antara gerai Dinoyo" />
      <ul className="mt-5 flex flex-col gap-5">
        {baris.map((item) => {
          const max = Math.max(item.toko, item.sentra, 1);
          const unggul = item.toko >= item.sentra;
          const selisih = item.sentra ? Math.round(((item.toko - item.sentra) / item.sentra) * 100) : 0;
          return (
            <li key={item.label} className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-on-surface">{item.label}</span>
                <span className={`text-xs font-bold ${unggul ? "text-secondary" : "text-error"}`}>
                  {unggul ? "▲" : "▼"} {Math.abs(selisih)}% {unggul ? "di atas" : "di bawah"}
                </span>
              </div>
              {[
                { nama: "Toko Anda", nilai: item.toko, kelas: "bg-primary" },
                { nama: "Rata-rata sentra", nilai: item.sentra, kelas: "bg-outline" },
              ].map((bar) => (
                <div key={bar.nama} className="grid grid-cols-[92px_minmax(0,1fr)_44px] items-center gap-2 text-[11px]">
                  <span className="text-on-surface-variant">{bar.nama}</span>
                  <span className="h-2 overflow-hidden rounded-full bg-surface-high">
                    <span className={`block h-full rounded-full ${bar.kelas}`} style={{ width: `${(bar.nilai / max) * 100}%` }} />
                  </span>
                  <span className="text-right font-semibold text-on-surface tabular-nums">
                    {bar.nilai.toLocaleString("id-ID")}
                    {item.satuan}
                  </span>
                </div>
              ))}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
