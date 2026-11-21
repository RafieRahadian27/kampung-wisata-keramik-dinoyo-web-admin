"use client";

import { ContactRound, MessageSquareText } from "lucide-react";
import { useState } from "react";
import { TextField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import type { TokoFormValues } from "@/types";
import type { TokoFormErrors } from "./formConfig";
import type { UpdateField } from "./TokoForm";

interface ContactSectionProps {
  values: TokoFormValues;
  errors: TokoFormErrors;
  updateField: UpdateField;
}

const MAKS_DIGIT_WA = 14;

/** Jam operasional dipindah ke OperationalSection; seksi ini khusus kontak pemesanan. */
export function ContactSection({ values, errors, updateField }: ContactSectionProps) {
  const [peringatan, setPeringatan] = useState<string>();

  /**
   * Nomor WhatsApp HANYA angka: huruf & simbol langsung dibuang saat diketik/ditempel.
   * "+62", spasi, dan tanda hubung dari nomor yang disalin (mis. "+62 812-3456-7890") dibersihkan
   * diam-diam karena maksud pengguna jelas; huruf memunculkan pesan.
   */
  const ubahWhatsapp = (raw: string) => {
    const tanpaPemisah = raw.replace(/[\s+()-]/g, "");
    const digit = tanpaPemisah.replace(/\D/g, "").slice(0, MAKS_DIGIT_WA);
    setPeringatan(digit.length !== tanpaPemisah.length ? "Nomor WhatsApp hanya boleh berisi angka." : undefined);
    updateField("whatsapp", digit);
  };

  return (
    <FormSection title="Komunikasi & Pemesanan" description="Aksesibilitas pembeli langsung ke pengrajin" icon={<ContactRound />}>
      <TextField
        label="Nomor WhatsApp Pemesanan"
        required
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        placeholder="081234567890"
        maxLength={20}
        value={values.whatsapp}
        onChange={(event) => ubahWhatsapp(event.target.value)}
        onBlur={() => setPeringatan(undefined)}
        error={errors.whatsapp ?? peringatan}
        aside={`${values.whatsapp.length}/${MAKS_DIGIT_WA}`}
        hint='Hanya angka, diawali 08 atau 628. Terhubung dengan tombol "Tanya Pengrajin".'
        leadingIcon={<MessageSquareText />}
      />
    </FormSection>
  );
}
