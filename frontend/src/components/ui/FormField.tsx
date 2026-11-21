"use client";

import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

const CONTROL_BASE =
  "w-full rounded-xl bg-surface-low text-sm text-on-surface placeholder:text-on-surface-variant/70 outline-none transition " +
  "border border-transparent focus:border-primary/40 focus:bg-surface-lowest focus:ring-2 focus:ring-primary/15";

interface FieldShellProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  aside?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  /** `md` = label 16px reguler (halaman login), `sm` = label 12px tebal (formulir data). */
  labelSize?: "sm" | "md";
}

const LABEL_SIZE = {
  sm: "text-xs leading-4 font-semibold",
  md: "text-base leading-6 font-normal",
};

/** Bungkus label + kontrol + pesan bantuan/eror agar semua input konsisten. */
export function FieldShell({ id, label, required, hint, aside, error, children, className, labelSize = "sm" }: FieldShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className={cn("text-on-surface", LABEL_SIZE[labelSize])}>
          {label}
          {required && <span className="ml-1 text-primary">*</span>}
        </label>
        {aside && <span className="text-[11px] leading-[14px] text-on-surface-variant">{aside}</span>}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[11px] leading-[14px] font-semibold text-error">
          {error}
        </p>
      ) : (
        hint && <p className="text-[11px] leading-[14px] font-semibold text-on-surface-variant">{hint}</p>
      )}
    </div>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  hint?: ReactNode;
  aside?: ReactNode;
  error?: string;
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  containerClassName?: string;
  labelSize?: FieldShellProps["labelSize"];
};

export function TextField({
  label,
  hint,
  aside,
  error,
  leadingIcon,
  trailing,
  required,
  className,
  containerClassName,
  labelSize,
  ...props
}: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} aside={aside} error={error} className={containerClassName} labelSize={labelSize}>
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-on-surface-variant [&_svg]:size-4">
            {leadingIcon}
          </span>
        )}
        <input
          id={id}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            CONTROL_BASE,
            "h-11 px-4",
            Boolean(leadingIcon) && "pl-11",
            Boolean(trailing) && "pr-24",
            error && "border-error/60 bg-error-container/30",
            className,
          )}
          {...props}
        />
        {trailing && <span className="absolute top-1/2 right-3 -translate-y-1/2">{trailing}</span>}
      </div>
    </FieldShell>
  );
}

export interface SelectOption {
  value: string;
  label: string;
  /** Keterangan kecil di bawah label pada daftar pilihan. */
  description?: string;
}

type SelectFieldProps = {
  label: string;
  /** String biasa (nilai = label) atau objek { value, label, description }. */
  options: (string | SelectOption)[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  containerClassName?: string;
};

/** Radix Select tidak menerima value "" untuk item, jadi pilihan kosong ("tanpa label") dipetakan ke penanda ini. */
const KOSONG = "__kosong__";
const keRadix = (value: string) => (value === "" ? KOSONG : value);
const dariRadix = (value: string) => (value === KOSONG ? "" : value);

/** Dropdown formulir berbasis komponen Select shadcn/ui (lihat components/ui/select.tsx). */
export function SelectField({ label, options, value, onValueChange, placeholder = "Pilih…", hint, error, required, disabled, className, containerClassName }: SelectFieldProps) {
  const id = useId();
  const items = options.map((option) => (typeof option === "string" ? { value: option, label: option || "— Tanpa label —" } : option));
  return (
    <FieldShell id={id} label={label} required={required} hint={hint} error={error} className={containerClassName}>
      <Select value={value === "" && !items.some((item) => item.value === "") ? undefined : keRadix(value)} onValueChange={(next) => onValueChange(dariRadix(next))} disabled={disabled}>
        <SelectTrigger id={id} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? `${id}-error` : undefined} aria-required={required || undefined} className={className}>
          <SelectValue placeholder={placeholder}>{items.find((item) => item.value === value)?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value || KOSONG} value={keRadix(item.value)} description={item.description}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

export const controlBaseClass = CONTROL_BASE;
