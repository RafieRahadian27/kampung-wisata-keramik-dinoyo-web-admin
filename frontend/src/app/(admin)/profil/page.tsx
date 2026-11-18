import type { Metadata } from "next";
import { History } from "lucide-react";
import { ActivityTimeline } from "@/components/ui/ActivityTimeline";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getProfil } from "@/lib/api/server";
import { requirePermission } from "@/lib/dal";
import { GantiPasswordForm } from "./components/GantiPasswordForm";
import { NamaTampilanForm } from "./components/NamaTampilanForm";
import { ProfilCard } from "./components/ProfilCard";
import { ProfilHero } from "./components/ProfilHero";
import { SesiAktifCard } from "./components/SesiAktifCard";
import { SkorKeamananCard } from "./components/SkorKeamananCard";
import { TipsKeamananCard } from "./components/TipsKeamananCard";
import { FreshOnNavigate } from "@/components/layout/FreshOnNavigate";

export const metadata: Metadata = { title: "Profil & Keamanan Akun" };

/** Profil pengguna sendiri: data akun, nama tampilan, skor keamanan, kata sandi, perangkat, dan riwayat aktivitas. */
export default async function ProfilPage() {
  await requirePermission("profil:update");
  const profil = await getProfil();

  return (
    <FreshOnNavigate>
      <ProfilHero profil={profil} />
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-7">
          <ProfilCard profil={profil} />
          <NamaTampilanForm sapaan={profil.sapaan} />
          <section className="flex flex-col gap-5 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-8">
            <SectionTitle title="Riwayat Aktivitas" description={`${profil.statistik.totalAktivitas} tindakan tercatat di audit log`} icon={<History />} />
            <ActivityTimeline aktivitas={profil.aktivitas} empty="Belum ada tindakan yang tercatat untuk akun ini." />
          </section>
        </div>
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-5">
          <SkorKeamananCard keamanan={profil.keamanan} />
          <GantiPasswordForm username={profil.username} email={profil.email} />
          <SesiAktifCard sesi={profil.sesi} />
          <TipsKeamananCard />
        </div>
      </div>
    </FreshOnNavigate>
  );
}
