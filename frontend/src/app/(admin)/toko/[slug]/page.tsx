import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { FreshOnNavigate } from "@/components/layout/FreshOnNavigate";
import { ApiError } from "@/lib/api/config";
import { getToko } from "@/lib/api/server";
import { requirePermission } from "@/lib/dal";
import { TokoForm } from "../components/form/TokoForm";
import { toFormValues } from "../components/form/formConfig";

/**
 * Ambil toko berdasarkan slug; 404 dari API diteruskan ke not-found.tsx.
 * Dipakai oleh generateMetadata DAN halaman → dibungkus `cache` dari React supaya dalam satu
 * request data toko cukup diambil sekali (tidak dobel ke Express).
 */
const loadToko = cache(async (slug: string) => {
  try {
    return await getToko(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: PageProps<"/toko/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const toko = await loadToko(slug);
  return { title: `Edit ${toko.nama}` };
}

/** Rute dinamis [slug]: /toko/toko-keramik-sari-asih membuka formulir edit toko tersebut. */
export default async function EditTokoPage({ params }: PageProps<"/toko/[slug]">) {
  await requirePermission("toko:update");
  const { slug } = await params;
  const toko = await loadToko(slug);

  return (
    <FreshOnNavigate>
      <TokoForm mode="edit" slug={toko.slug} initialValues={toFormValues(toko)} coverPhoto={toko.foto} stempel={toko.stempel} lastSaved={toko.diperbarui} />
    </FreshOnNavigate>
  );
}
