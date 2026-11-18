import {
  ChartColumnBig,
  ChartSpline,
  House,
  IdCard,
  LayoutGrid,
  type LucideIcon,
  PackagePlus,
  Palette,
  Store,
  UserCog,
  Warehouse,
} from "lucide-react";
import type { Permission } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Izin yang dibutuhkan agar menu tampil (hanya UI — penegakan ada di DAL & API). */
  izin: Permission;
  /** Rute lain yang tetap menandai menu ini aktif (mis. halaman edit toko). */
  matches?: RegExp;
}

/**
 * Menu sidebar. Setiap pengguna hanya melihat menu yang izinnya ia miliki:
 *   admin     → Dashboard, Kelola Toko, Tambah Toko, Kelola Produk, Tambah Produk, Akun, Laporan, Profil
 *   pengrajin → Dashboard Toko, Kelola Toko, Kelola Produk, Tambah Produk, Laporan Toko, Profil
 */
export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid, izin: "dashboard:read" },
  { label: "Dashboard Toko", href: "/beranda", icon: House, izin: "beranda:read" },
  { label: "Kelola Toko & Pengrajin", href: "/toko", icon: Store, izin: "toko:read", matches: /^\/toko\/(?!tambah)[^/]+/ },
  { label: "Tambah Toko", href: "/toko/tambah", icon: Warehouse, izin: "toko:create" },
  { label: "Kelola Produk", href: "/produk", icon: Palette, izin: "produk:read" },
  { label: "Tambah Produk", href: "/produk/tambah", icon: PackagePlus, izin: "produk:create" },
  { label: "Akun Pengrajin", href: "/akun", icon: IdCard, izin: "akun:read" },
  { label: "Laporan & Kunjungan", href: "/laporan", icon: ChartSpline, izin: "laporan:read" },
  { label: "Laporan Kunjungan Toko", href: "/laporan-toko", icon: ChartColumnBig, izin: "laporan-toko:read" },
  { label: "Profil & Keamanan Akun", href: "/profil", icon: UserCog, izin: "profil:update" },
];

/** Halaman awal sesuai peran: menu pertama yang boleh diakses pengguna. */
export function homePathFor(izin: Permission[]): string {
  return ADMIN_NAV.find((item) => izin.includes(item.izin))?.href ?? "/login";
}

export const PORTAL_PUBLIK_URL = "https://keramikdinoyo.id";
