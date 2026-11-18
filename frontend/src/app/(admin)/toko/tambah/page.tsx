import type { Metadata } from "next";
import { requirePermission } from "@/lib/dal";
import { TokoForm } from "../components/form/TokoForm";
import { EMPTY_TOKO_FORM } from "../components/form/formConfig";
import { FreshOnNavigate } from "@/components/layout/FreshOnNavigate";

export const metadata: Metadata = { title: "Tambah Toko Baru" };

export default async function TambahTokoPage() {
  await requirePermission("toko:create");
  return (
    <FreshOnNavigate>
      <TokoForm mode="create" initialValues={EMPTY_TOKO_FORM} />
    </FreshOnNavigate>
  );
}
