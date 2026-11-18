"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  icon?: ReactNode;
  className?: string;
}

/** Radix Select tidak menerima value "" untuk item; opsi "Semua …" (value "") dipetakan ke penanda ini. */
const SEMUA = "__semua__";

/** Dropdown filter bergaya "pill" (komponen Select shadcn/ui) dengan ikon di kiri. */
export function FilterSelect({ label, value, options, onChange, icon, className }: FilterSelectProps) {
  return (
    <Select value={value === "" ? SEMUA : value} onValueChange={(next) => onChange(next === SEMUA ? "" : next)}>
      <SelectTrigger aria-label={label} className={cn("border-outline-variant/40 bg-surface-lowest font-semibold", className)}>
        <span className="flex min-w-0 items-center gap-3">
          {icon && <span className="shrink-0 text-on-surface-variant [&_svg]:size-4">{icon}</span>}
          <span className="min-w-0 truncate">
            <SelectValue />
          </span>
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value || SEMUA} value={option.value || SEMUA}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
