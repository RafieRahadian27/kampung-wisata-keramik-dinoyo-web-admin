import { CircleHelp } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";

export function SyncHelpCard() {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-secondary-container/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex min-w-0 items-start gap-4">
        <IconTile tone="solid-secondary">
          <CircleHelp />
        </IconTile>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-on-surface">Pusat Bantuan Sinkronisasi WhatsApp Pengrajin</h2>
          <p className="text-xs leading-[18px] text-on-surface-variant">
            Tombol &quot;Tanya Pengrajin&quot; di setiap karya memakai nomor WhatsApp pada profil toko. Pastikan nomornya aktif dan hanya berisi angka (08…/62…).
          </p>
        </div>
      </div>
      <ButtonLink href="/toko" variant="secondary" className="self-start sm:self-center">
        Periksa Kontak Toko
      </ButtonLink>
    </section>
  );
}
