import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const STROKE = {
  primary: "stroke-primary",
  secondary: "stroke-secondary",
  tertiary: "stroke-tertiary",
  error: "stroke-error",
  white: "stroke-white",
} as const;

interface ProgressRingProps {
  value: number;
  size?: number;
  thickness?: number;
  tone?: keyof typeof STROKE;
  label: string;
  /** Isi tengah lingkaran; default = persentase. */
  children?: ReactNode;
  trackClassName?: string;
  className?: string;
}

/** Cincin progres SVG (0–100) — dipakai untuk kelengkapan profil & skor keamanan. */
export function ProgressRing({ value, size = 96, thickness = 9, tone = "primary", label, children, trackClassName, className }: ProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - thickness) / 2;
  const keliling = 2 * Math.PI * radius;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={thickness} className={cn("stroke-surface-high", trackClassName)} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={keliling}
          strokeDashoffset={keliling * (1 - clamped / 100)}
          className={cn("transition-[stroke-dashoffset] duration-700", STROKE[tone])}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? <span className="font-serif text-xl font-bold">{clamped}%</span>}
      </span>
    </div>
  );
}
