"use client";

import { Check, KeyRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { useToast } from "@/context/ToastContext";
import { profilApi } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { PASSWORD_RULES, passwordStrength, validateConfirmPassword, validatePassword } from "@/lib/validation/auth";

const STRENGTH = [
  { label: "", bar: "" },
  { label: "Lemah", bar: "bg-error w-1/4" },
  { label: "Cukup", bar: "bg-tertiary w-2/4" },
  { label: "Kuat", bar: "bg-secondary w-3/4" },
  { label: "Sangat kuat", bar: "bg-secondary w-full" },
] as const;

interface Errors {
  lama?: string;
  baru?: string;
  konfirmasi?: string;
  form?: string;
}

/** Ganti kata sandi. Setelah berhasil, Express mencabut semua sesi lain; sesi di perangkat ini tetap aktif. */
export function GantiPasswordForm({ username, email }: { username: string; email: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(baru);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next: Errors = {
      lama: lama ? undefined : "Masukkan kata sandi saat ini.",
      baru: validatePassword(baru, { username, email }) ?? (baru && baru === lama ? "Kata sandi baru harus berbeda dari yang lama." : undefined),
      konfirmasi: validateConfirmPassword(konfirmasi, baru),
    };
    setErrors(next);
    if (next.lama || next.baru || next.konfirmasi) return;

    setSubmitting(true);
    try {
      const response = await profilApi.gantiPassword(lama, baru);
      const dicabut = response.data.sesiDicabut;
      showToast(dicabut > 0 ? `Kata sandi diperbarui. ${dicabut} perangkat lain telah dikeluarkan.` : "Kata sandi berhasil diperbarui.");
      setLama("");
      setBaru("");
      setKonfirmasi("");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengganti kata sandi.";
      // Sandi lama salah → tampilkan di kolomnya; selain itu di atas formulir.
      if (/saat ini salah/i.test(message)) setErrors({ lama: message });
      else setErrors({ form: message });
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = (
    <button type="button" onClick={() => setShow((value) => !value)} className="rounded-lg px-2 py-1 text-xs font-semibold text-primary hover:bg-primary-fixed/50" aria-pressed={show}>
      {show ? "Sembunyikan" : "Tampilkan"}
    </button>
  );

  return (
    <FormSection title="Ganti Kata Sandi" description="Perangkat lain akan otomatis dikeluarkan setelah kata sandi diganti" icon={<KeyRound />}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {errors.form && (
          <p role="alert" className="rounded-xl bg-error-container px-4 py-3 text-sm font-semibold text-error">
            {errors.form}
          </p>
        )}
        <TextField
          label="Kata Sandi Saat Ini"
          required
          type={show ? "text" : "password"}
          autoComplete="current-password"
          value={lama}
          onChange={(event) => setLama(event.target.value)}
          error={errors.lama}
          trailing={toggle}
        />
        <div className="flex flex-col gap-3">
          <TextField
            label="Kata Sandi Baru"
            required
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={baru}
            onChange={(event) => setBaru(event.target.value)}
            error={errors.baru}
          />
          {strength > 0 && (
            <>
              <div className="flex items-center gap-3" aria-live="polite">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-high">
                  <span className={cn("block h-full rounded-full transition-[width] duration-300", STRENGTH[strength].bar)} />
                </span>
                <span className="w-20 text-right text-[11px] font-semibold text-on-surface-variant">{STRENGTH[strength].label}</span>
              </div>
              <ul className="grid grid-cols-2 gap-x-3 gap-y-1" aria-label="Syarat kata sandi">
                {PASSWORD_RULES.map((rule) => {
                  const met = rule.test(baru);
                  return (
                    <li key={rule.label} className={cn("flex items-center gap-1.5 text-[11px]", met ? "text-secondary" : "text-on-surface-variant")}>
                      {met ? <Check className="size-3 shrink-0" aria-hidden /> : <X className="size-3 shrink-0" aria-hidden />}
                      <span>
                        {rule.label}
                        <span className="sr-only">{met ? " (terpenuhi)" : " (belum)"}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
        <TextField
          label="Ulangi Kata Sandi Baru"
          required
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={konfirmasi}
          onChange={(event) => setKonfirmasi(event.target.value)}
          error={errors.konfirmasi}
        />
        <Button type="submit" size="lg" isLoading={submitting} className="sm:self-start">
          Simpan Kata Sandi Baru
        </Button>
      </form>
    </FormSection>
  );
}
