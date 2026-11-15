import { cleanup } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

// next/image butuh konfigurasi server Next.js; di jsdom cukup <img> biasa dengan src & alt yang sama.
vi.mock("next/image", () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => createElement("img", { src, alt, className }),
}));

// URL.createObjectURL tidak tersedia di jsdom.
if (!URL.createObjectURL) {
  URL.createObjectURL = () => "blob:pratinjau-uji";
  URL.revokeObjectURL = () => undefined;
}
