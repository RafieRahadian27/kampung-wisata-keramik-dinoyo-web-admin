"use client";

import { LogOut, MonitorSmartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FormSection } from "@/components/ui/FormSection";
import { useToast } from "@/context/ToastContext";
import { profilApi } from "@/lib/api/client";
import type { SesiAktif } from "@/types";

const formatWaktu = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

/** Daftar perangkat yang sedang login dengan akun ini + tombol keluarkan perangkat lain. */
export function SesiAktifCard({ sesi }: { sesi: SesiAktif[] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);
  const adaSesiLain = sesi.some((item) => !item.sesiIni);

  const cabut = async () => {
    setBusy(true);
    try {
      const response = await profilApi.cabutSesiLain();
      showToast(response.message ?? "Perangkat lain telah dikeluarkan.");
      router.refresh();
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal mengeluarkan perangkat lain.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <FormSection
      title="Perangkat Aktif"
      description={`${sesi.length} sesi login sedang aktif`}
      icon={<MonitorSmartphone />}
      aside={
        adaSesiLain ? (
          <Button variant="danger" size="md" onClick={cabut} isLoading={busy}>
            {!busy && <LogOut className="size-4" aria-hidden />}
            Keluarkan perangkat lain
          </Button>
        ) : undefined
      }
    >
      <ul className="flex flex-col divide-y divide-outline-variant/30">
        {sesi.map((item) => (
          <li key={item.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-on-surface">
                {item.perangkat}
                {item.sesiIni && <Badge tone="secondary">Perangkat ini</Badge>}
              </p>
              <p className="text-xs text-on-surface-variant">
                Masuk {formatWaktu(item.dibuat)}
                {item.ipAddress ? ` • IP ${item.ipAddress}` : ""}
              </p>
            </div>
            <p className="shrink-0 text-xs text-on-surface-variant">Berakhir {formatWaktu(item.berakhir)}</p>
          </li>
        ))}
      </ul>
    </FormSection>
  );
}
