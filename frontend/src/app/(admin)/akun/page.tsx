import type { Metadata } from "next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Eyebrow, PageHeader } from "@/components/ui/PageHeader";
import { UnduhCsvButton } from "@/components/ui/UnduhCsvButton";
import { RIWAYAT_AKUN } from "@/data/aktivitas";
import { getAkunList } from "@/lib/api/server";
import { requirePermission } from "@/lib/dal";
import { AccountActivityLog } from "./components/AccountActivityLog";
import { AkunManager } from "./components/AkunManager";
import { AkunStats } from "./components/AkunStats";
import { SalinTautanDaftarButton } from "./components/SalinTautanDaftarButton";
import { SupportCard } from "./components/SupportCard";
import { FreshOnNavigate } from "@/components/layout/FreshOnNavigate";

export const metadata: Metadata = { title: "Kelola Akun Pengrajin" };

export default async function KelolaAkunPage() {
  await requirePermission("akun:read");
  const { data, ringkasan } = await getAkunList();

  return (
    <FreshOnNavigate>
      <PageHeader
        eyebrow={
          <div className="flex flex-col gap-3">
            <Breadcrumb items={[{ label: "Beranda", href: "/dashboard" }, { label: "Kelola Akun" }]} />
            <Eyebrow tone="secondary">Manajemen Hak Akses &amp; Pengguna</Eyebrow>
          </div>
        }
        title="Kelola Akun Pengrajin & Anggota"
        description="Atur hak akses login pengrajin sentra keramik Dinoyo, verifikasi akun toko baru, reset kata sandi, dan status keaktifan dalam paguyuban."
        actions={
          <>
            {/* NIK sengaja tidak diekspor: data kependudukan sensitif tidak boleh tersebar lewat berkas. */}
            <UnduhCsvButton
              namaBerkas="data-akun-pengrajin"
              baris={[
                ["Nama", "Email", "Toko", "Lokasi", "Peran", "WhatsApp", "Status", "Terakhir Aktif"],
                ...data.map((a) => [a.nama, a.email, a.toko, a.lokasi, a.peran, a.whatsapp, a.status, a.terakhirAktif]),
              ]}
            >
              Unduh Data Akun
            </UnduhCsvButton>
            <SalinTautanDaftarButton />
          </>
        }
      />
      <AkunStats ringkasan={ringkasan} />
      <AkunManager initialAkun={data} total={ringkasan.total} />
      {/* Riwayat login & perubahan akses (data statis sementara) */}
      <AccountActivityLog riwayat={RIWAYAT_AKUN} />
      <SupportCard />
    </FreshOnNavigate>
  );
}
