"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Komponen Select ala shadcn/ui (struktur & API sama: Select, SelectTrigger, SelectValue,
 * SelectContent, SelectItem, ...) di atas Radix UI Select.
 *
 * Bedanya dengan <select> bawaan: daftar pilihan bisa diberi gaya sesuai tema (termasuk mode gelap),
 * bisa memuat keterangan per item, dan tetap aksesibel — navigasi panah, ketik untuk mencari,
 * Escape untuk menutup, serta peran ARIA listbox/option ditangani Radix.
 *
 * Warna memakai token tema panel (surface, primary, ...) alih-alih variabel bawaan shadcn.
 */
export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        "flex h-11 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-xl border border-transparent bg-surface-low px-4 text-left text-sm text-on-surface outline-none transition",
        "focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15 data-[state=open]:border-primary/40 data-[state=open]:bg-surface-lowest",
        "data-[placeholder]:text-on-surface-variant/70 disabled:cursor-not-allowed disabled:opacity-60",
        "aria-[invalid=true]:border-error/60 aria-[invalid=true]:bg-error-container/30",
        "[&>span]:min-w-0 [&>span]:truncate",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-4 shrink-0 text-on-surface-variant transition-transform duration-200 [[data-state=open]_&]:rotate-180" aria-hidden />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, position = "popper", ...props }: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        className={cn(
          "relative z-50 max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-lowest text-on-surface shadow-float",
          "data-[state=open]:animate-popover-in",
          position === "popper" && "w-full min-w-(--radix-select-trigger-width) data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex h-6 cursor-default items-center justify-center text-on-surface-variant">
          <ChevronUp className="size-4" aria-hidden />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className={cn("p-1.5", position === "popper" && "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex h-6 cursor-default items-center justify-center text-on-surface-variant">
          <ChevronDown className="size-4" aria-hidden />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectLabel({ className, ...props }: ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label className={cn("px-3 py-1.5 text-overline text-on-surface-variant", className)} {...props} />;
}

export function SelectItem({ className, children, description, ...props }: ComponentProps<typeof SelectPrimitive.Item> & { description?: string }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-pointer items-start gap-2 rounded-lg py-2 pr-8 pl-3 text-sm outline-none select-none",
        "data-[highlighted]:bg-surface-container data-[state=checked]:font-semibold data-[state=checked]:text-primary",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-col">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        {description && <span className="text-[11px] leading-4 font-normal text-on-surface-variant">{description}</span>}
      </span>
      <span className="absolute top-2.5 right-2.5 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-3.5" aria-hidden />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}

export function SelectSeparator({ className, ...props }: ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-outline-variant/40", className)} {...props} />;
}
