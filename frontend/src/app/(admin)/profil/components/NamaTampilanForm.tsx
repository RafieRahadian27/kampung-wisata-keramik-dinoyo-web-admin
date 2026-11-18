"use client";

import { PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { useToast } from "@/context/ToastContext";
import { invalidateCache } from "@/lib/actions/cache";
import { profilApi } from "@/lib/api/client";
import { CACHE_TAGS } from "@/lib/api/config";

const POLA = /^[\p{L}][\p{L} .'-]*$/u;

/** Ubah nama tampilan (sapaan) — muncul di sapaan Dashboard Toko, header, dan sidebar. */
export function NamaTampilanForm({ sapaan }: { sapaan: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [nilai, setNilai] = useState(sapaan);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const bersih = nilai.replace(/\s+/g, " ").trim();
  const berubah = bersih !== sapaan;

  const simpan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (bersih.length < 3 || bersih.length > 60) return setError("Nama tampilan 3–60 karakter.");
    if (!POLA.test(bersih)) return setError("Hanya huruf, spasi, titik, atau tanda petik.");
    setSaving(true);
    try {
      const response = await profilApi.ubahSapaan(bersih);
      await invalidateCache([CACHE_TAGS.beranda, CACHE_TAGS.dashboard]).catch(() => undefined);
      showToast(response.message ?? "Nama tampilan diperbarui.");
      setError(undefined);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan nama tampilan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormSection title="Nama Tampilan" description="Nama sapaan yang muncul di dashboard dan menu panel" icon={<PenLine />}>
      <form onSubmit={simpan} noValidate className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <TextField
          label="Nama tampilan"
          containerClassName="flex-1"
          maxLength={60}
          value={nilai}
          onChange={(event) => {
            setNilai(event.target.value);
            setError(undefined);
          }}
          aside={`${bersih.length}/60`}
          hint={`Pratinjau: "Selamat pagi, ${bersih || "…"}"`}
          error={error}
        />
        <div className="flex gap-2 sm:pt-6">
          {berubah && (
            <Button variant="tonal" size="md" onClick={() => setNilai(sapaan)} disabled={saving}>
              Batal
            </Button>
          )}
          <Button type="submit" size="md" isLoading={saving} disabled={!berubah}>
            Simpan
          </Button>
        </div>
      </form>
    </FormSection>
  );
}
