"use client";

import { Banknote, Camera, CircleAlert, Check, CircleCheck, CircleDashed, ImagePlus, Lightbulb, Package, Palette, RefreshCw, Save, Scale, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button } from "@/components/ui/Button";
import { FieldShell, SelectField, TextField } from "@/components/ui/FormField";
import { FormSection } from "@/components/ui/FormSection";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { useToast } from "@/context/ToastContext";
import { invalidateCache } from "@/lib/actions/cache";
import { produkApi } from "@/lib/api/client";
import { CACHE_TAGS } from "@/lib/api/config";
import { cn, formatRupiah } from "@/lib/utils";
import { FOTO_ACCEPT, FOTO_MAX_BYTES, formatBytes, validateFoto } from "@/lib/validation/upload";
import type { HargaPasar, ProdukFormValues } from "@/types";
import { STATUS_PRODUK_TONE } from "../produkTone";
import {
  BAHAN_SARAN,
  emptyProdukForm,
  LABEL_KOLOM,
  LABEL_SARAN,
  type ProdukFormErrors,
  STATUS_PRODUK_OPTIONS,
  TEKNIK_OPTIONS,
  validateProdukForm,
} from "./produkFormConfig";

const FOTO_BAWAAN = "/images/sampul-galeri.jpg";

interface ProdukFormProps {
  toko: { slug: string; nama: string; lokasiGang: string }[];
  kategori: string[];
  /** Acuan harga per kategori dari seluruh sentra (GET /produk/harga-pasar). */
  hargaPasar: HargaPasar[];
}

const TIPS_FOTO = [
  "Gunakan cahaya alami dari jendela, hindari lampu kuning.",
  "Latar polos (kain putih/krem) agar warna glasir terlihat jelas.",
  "Foto rasio persegi 1:1, produk memenuhi sekitar 70% bingkai.",
  "Tambahkan foto detail tekstur atau tanda tangan pengrajin.",
];

/** Object URL untuk pratinjau lokal; dibersihkan saat berkas berganti agar tidak bocor memori. */
function usePreview(file: File | null) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => void (url && URL.revokeObjectURL(url)), [url]);
  return url;
}

/**
 * Formulir Tambah Produk. Alur simpan: data produk → POST /produk (SKU dibuat server),
 * lalu foto (bila dipilih) diunggah ke Vercel Blob. Gagal unggah tidak membatalkan produk.
 */
export function ProdukForm({ toko, kategori, hargaPasar }: ProdukFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [values, setValues] = useState<ProdukFormValues>(() => emptyProdukForm(toko[0]?.slug ?? "", kategori[0] ?? ""));
  // Validasi langsung: error sebuah kolom baru tampil setelah kolom itu disentuh (blur/dipilih)
  // atau setelah tombol Simpan ditekan — tidak memarahi pengguna sebelum sempat mengetik.
  const [touched, setTouched] = useState<ReadonlySet<keyof ProdukFormValues>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoError, setFotoError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const preview = usePreview(foto);

  const cek = validateProdukForm(values);
  const errors: ProdukFormErrors = Object.fromEntries(Object.entries(cek).filter(([field]) => submitted || touched.has(field as keyof ProdukFormValues)));
  const jumlahError = Object.values(cek).filter(Boolean).length;

  const sentuh = (field: keyof ProdukFormValues) => setTouched((current) => (current.has(field) ? current : new Set(current).add(field)));
  const update = <K extends keyof ProdukFormValues>(field: K, value: ProdukFormValues[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };
  /** Untuk dropdown: memilih = menyentuh, jadi errornya langsung dievaluasi. */
  const pilih = <K extends keyof ProdukFormValues>(field: K, value: ProdukFormValues[K]) => {
    update(field, value);
    sentuh(field);
  };

  const handleFoto = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;
    const error = validateFoto(picked);
    setFotoError(error);
    if (!error) setFoto(picked);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (jumlahError > 0) {
      showToast(`${jumlahError} kolom belum valid. Periksa yang ditandai merah.`, "error");
      // Tunggu render berikutnya (aria-invalid baru terpasang) lalu fokus ke kolom bermasalah pertama.
      requestAnimationFrame(() => {
        const pertama = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
        pertama?.scrollIntoView({ behavior: "smooth", block: "center" });
        pertama?.focus({ preventScroll: true });
      });
      return;
    }

    setSubmitting(true);
    let produkId: number;
    let message: string | undefined;
    try {
      const response = await produkApi.create(values);
      produkId = response.data.id;
      message = response.message;
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Gagal menyimpan produk", "error");
      setSubmitting(false);
      return;
    }

    let uploadError: string | undefined;
    if (foto) {
      try {
        await produkApi.uploadFoto(produkId, foto);
      } catch (error) {
        uploadError = error instanceof Error ? error.message : "Foto gagal diunggah.";
      }
    }

    try {
      await invalidateCache([CACHE_TAGS.produk, CACHE_TAGS.toko, CACHE_TAGS.dashboard, CACHE_TAGS.beranda, CACHE_TAGS.laporanToko]);
    } catch {
      // Cache hanya akan segar sedikit lebih lambat.
    }

    if (uploadError) showToast(`Produk tersimpan, tetapi foto gagal diunggah: ${uploadError}`, "error");
    else showToast(message ?? "Produk berhasil ditambahkan.");
    router.push("/produk");
  };

  const tokoTerpilih = toko.find((item) => item.slug === values.tokoSlug);
  const pasar = hargaPasar.find((item) => item.kategori === values.kategori);

  // Status tiap langkah dihitung dari aturan validasi yang sama dengan saat simpan.
  const daftarCek = [
    { label: "Nama produk", ok: !cek.nama },
    { label: "Kategori & toko", ok: !cek.kategori && !cek.tokoSlug },
    { label: "Teknik pembuatan", ok: !cek.teknik },
    { label: "Bahan", ok: !cek.bahan },
    { label: "Harga jual", ok: !cek.harga },
    { label: "Stok & lokasi", ok: !cek.stok && !cek.lokasiStok },
    { label: "Foto produk (disarankan)", ok: foto !== null },
  ];
  const persenForm = Math.round((daftarCek.filter((item) => item.ok).length / daftarCek.length) * 100);
  const langkah = [
    { label: "Identitas Produk", ok: !cek.nama && !cek.kategori && !cek.teknik && !cek.bahan && !cek.tokoSlug },
    { label: "Harga & Stok", ok: !cek.harga && !cek.stok && !cek.lokasiStok },
    { label: "Foto Produk", ok: foto !== null },
  ];
  const posisiHarga =
    pasar && values.harga && pasar.termahal > pasar.termurah
      ? Math.min(100, Math.max(0, ((values.harga - pasar.termurah) / (pasar.termahal - pasar.termurah)) * 100))
      : null;
  const penilaianHarga = !pasar || !values.harga ? null : values.harga < pasar.termurah ? "di bawah" : values.harga > pasar.termahal ? "di atas" : "dalam";
  const fotoUrl = preview ?? FOTO_BAWAAN;

  if (toko.length === 0) {
    return (
      <div className="rounded-2xl bg-surface-lowest p-10 text-center shadow-card">
        <h1 className="font-serif text-2xl font-bold text-on-surface">Belum ada toko untuk diisi produk</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Akun Anda belum tertaut ke toko mana pun. Hubungi admin paguyuban.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <Breadcrumb items={[{ label: "Kelola Produk", href: "/produk", icon: <Palette /> }, { label: "Tambah Produk Baru" }]} />
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="font-serif text-[28px] leading-9 font-bold text-on-surface sm:text-[32px] sm:leading-10">Tambah Produk ke Katalog</h1>
            <p className="max-w-2xl text-sm leading-[22px] text-on-surface-variant">
              Daftarkan karya keramik baru beserta harga, stok, dan fotonya. Kode SKU dibuat otomatis setelah produk tersimpan.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button variant="tonal" size="lg" onClick={() => router.back()} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" size="lg" isLoading={submitting}>
              {!submitting && <Save className="size-4" aria-hidden />}
              Simpan Produk
            </Button>
          </div>
        </div>
      </header>

      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Langkah pengisian">
        {langkah.map((item, index) => (
          <li
            key={item.label}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3 transition",
              item.ok ? "border-secondary/40 bg-secondary-container/40" : "border-outline-variant/40 bg-surface-lowest",
            )}
          >
            <span
              className={cn(
                "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                item.ok ? "bg-secondary text-on-secondary" : "bg-surface-high text-on-surface-variant",
              )}
            >
              {item.ok ? <Check className="size-4" aria-hidden /> : index + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] text-on-surface-variant">Langkah {index + 1}</span>
              <span className="block text-sm font-semibold text-on-surface">{item.label}</span>
            </span>
          </li>
        ))}
      </ol>

      {submitted && jumlahError > 0 && (
        <div role="alert" className="flex animate-dialog-in gap-3 rounded-2xl border border-error/30 bg-error-container/40 p-4">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-error" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-error">{jumlahError} kolom perlu diperbaiki sebelum produk bisa disimpan</p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface">
              {(Object.keys(cek) as (keyof ProdukFormValues)[]).map((field) => (
                <li key={field}>
                  <strong>{LABEL_KOLOM[field]}:</strong> {cek[field]}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <FormSection title="Identitas Produk" description="Nama karya, kategori katalog, dan proses pembuatannya" icon={<Package />}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {toko.length > 1 ? (
                <SelectField
                  label="Toko Pemilik"
                  required
                  options={toko.map((item) => ({ value: item.slug, label: item.nama, description: item.lokasiGang }))}
                  value={values.tokoSlug}
                  onValueChange={(slug) => pilih("tokoSlug", slug)}
                  placeholder="Pilih toko"
                  error={errors.tokoSlug}
                />
              ) : (
                <TextField label="Toko Pemilik" value={`${toko[0].nama} — ${toko[0].lokasiGang}`} readOnly hint="Produk otomatis masuk ke toko Anda." />
              )}
              <SelectField
                label="Kategori"
                required
                options={kategori}
                value={values.kategori}
                onValueChange={(value) => pilih("kategori", value)}
                placeholder="Pilih kategori"
                error={errors.kategori}
              />
              <TextField
                label="Nama Produk"
                required
                containerClassName="md:col-span-2"
                placeholder="mis. Cangkir Kopi Celadon Matte"
                maxLength={120}
                value={values.nama}
                onChange={(event) => update("nama", event.target.value)}
                onBlur={() => sentuh("nama")}
                aside={`${values.nama.length}/120`}
                error={errors.nama}
              />
              <SelectField
                label="Teknik Pembuatan"
                required
                options={TEKNIK_OPTIONS}
                value={values.teknik}
                onValueChange={(value) => pilih("teknik", value)}
                placeholder="Pilih teknik pembuatan"
                hint="Daftar resmi paguyuban — agar katalog seragam dan mudah difilter."
                error={errors.teknik}
              />
              <TextField
                label="Bahan"
                required
                list="saran-bahan"
                placeholder="mis. High-fired Stoneware"
                maxLength={80}
                value={values.bahan}
                onChange={(event) => update("bahan", event.target.value)}
                onBlur={() => sentuh("bahan")}
                error={errors.bahan}
              />
              <SelectField
                label="Label Etalase (opsional)"
                options={LABEL_SARAN}
                value={values.badge}
                onValueChange={(value) => update("badge", value)}
                hint="Kosongkan bila tidak perlu label khusus."
              />
            </div>
            <datalist id="saran-bahan">
              {BAHAN_SARAN.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </FormSection>

          <FormSection title="Harga & Stok" description="Harga jual, ketersediaan, dan lokasi penyimpanan di galeri" icon={<Banknote />}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <TextField
                label="Harga Jual (Rp)"
                required
                inputMode="numeric"
                placeholder="85000"
                value={values.harga ? String(values.harga) : ""}
                onChange={(event) => update("harga", Number(event.target.value.replace(/\D/g, "").slice(0, 9)) || 0)}
                onBlur={() => sentuh("harga")}
                hint={
                  values.harga
                    ? `${formatRupiah(values.harga)}${penilaianHarga ? ` • ${penilaianHarga} rentang pasar` : ""}`
                    : pasar
                      ? `Rata-rata kategori ini: ${formatRupiah(pasar.rataRata)}`
                      : "Tanpa titik atau koma."
                }
                error={errors.harga}
              />
              <TextField
                label="Catatan Harga (opsional)"
                placeholder="mis. Margin Paguyuban 10%"
                maxLength={80}
                value={values.catatanHarga}
                onChange={(event) => update("catatanHarga", event.target.value)}
                onBlur={() => sentuh("catatanHarga")}
                error={errors.catatanHarga}
              />
              <FieldShell id="status-stok" label="Status Stok" required className="md:col-span-2">
                <div id="status-stok" role="radiogroup" aria-label="Status stok" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {STATUS_PRODUK_OPTIONS.map((option) => {
                    const active = values.status === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => pilih("status", option.value)}
                        className={cn(
                          "flex flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition",
                          active ? "border-secondary bg-secondary-container/60" : "border-outline-variant/50 bg-surface-lowest hover:bg-surface-low",
                        )}
                      >
                        <span className="text-sm font-semibold text-on-surface">{option.label}</span>
                        <span className="text-xs text-on-surface-variant">{option.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </FieldShell>
              <TextField
                label={values.status === "preorder" ? "Slot Pre-order" : "Jumlah Stok (pcs)"}
                inputMode="numeric"
                placeholder="0"
                disabled={values.status === "habis"}
                value={values.status === "habis" ? "0" : values.stok ? String(values.stok) : ""}
                onChange={(event) => update("stok", Number(event.target.value.replace(/\D/g, "").slice(0, 6)) || 0)}
                onBlur={() => sentuh("stok")}
                error={errors.stok}
              />
              <TextField
                label="Lokasi Stok"
                required
                placeholder="mis. Rak A-12 Galeri"
                maxLength={80}
                value={values.lokasiStok}
                onChange={(event) => update("lokasiStok", event.target.value)}
                onBlur={() => sentuh("lokasiStok")}
                error={errors.lokasiStok}
              />
            </div>
            {values.harga > 0 && values.stok > 0 && values.status !== "habis" && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary-fixed/50 px-4 py-3">
                <span className="text-xs text-on-surface-variant">
                  Estimasi nilai stok ({values.stok} × {formatRupiah(values.harga)})
                </span>
                <span className="font-serif text-xl font-bold text-primary">{formatRupiah(values.harga * values.stok)}</span>
              </div>
            )}
          </FormSection>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <section aria-label="Kelengkapan formulir" className="flex flex-col gap-4 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-6">
            <div className="flex items-center gap-4">
              <ProgressRing value={persenForm} tone={persenForm === 100 ? "secondary" : "primary"} size={80} label="Kelengkapan formulir" />
              <div>
                <p className="font-serif text-xl font-semibold text-on-surface">Kelengkapan Formulir</p>
                <p className="text-xs text-on-surface-variant">{persenForm === 100 ? "Siap disimpan ke katalog." : "Lengkapi kolom yang belum dicentang."}</p>
              </div>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              {daftarCek.map((item) => (
                <li key={item.label} className={cn("flex items-center gap-2 text-sm", item.ok ? "text-on-surface" : "text-on-surface-variant")}>
                  {item.ok ? <CircleCheck className="size-4 shrink-0 text-secondary" aria-hidden /> : <CircleDashed className="size-4 shrink-0 text-tertiary" aria-hidden />}
                  {item.label}
                </li>
              ))}
            </ul>
          </section>
          <FormSection title="Foto Produk" description={`JPG, PNG, atau WebP • maks. ${formatBytes(FOTO_MAX_BYTES)}`} icon={<ImagePlus />}>
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-surface-high">
              <Image src={fotoUrl} alt="Pratinjau foto produk" fill sizes="(min-width: 1280px) 420px, 100vw" className="object-cover" unoptimized={fotoUrl.startsWith("blob:")} />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-linear-to-t from-black/70 to-transparent p-4">
                <p className="min-w-0 truncate text-xs font-semibold text-white">
                  {foto ? `${foto.name} • ${formatBytes(foto.size)}` : "Foto bawaan — unggah foto karya Anda"}
                </p>
                <div className="flex shrink-0 gap-2">
                  {foto && (
                    <button
                      type="button"
                      onClick={() => setFoto(null)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/60"
                    >
                      <X className="size-3.5" aria-hidden />
                      Batal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-black/40 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/60"
                  >
                    {foto ? <RefreshCw className="size-3.5" aria-hidden /> : <Upload className="size-3.5" aria-hidden />}
                    {foto ? "Ganti" : "Pilih Foto"}
                  </button>
                </div>
              </div>
            </div>
            <input ref={fileRef} type="file" accept={FOTO_ACCEPT} className="sr-only" onChange={handleFoto} tabIndex={-1} aria-label="Unggah foto produk" />
            {fotoError && (
              <p role="alert" className="text-xs font-medium text-error">
                {fotoError}
              </p>
            )}
          </FormSection>

          <section aria-label="Acuan harga pasar" className="flex flex-col gap-4 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-6">
            <p className="flex items-center gap-2 font-serif text-xl font-semibold text-on-surface">
              <Scale className="size-5 text-primary" aria-hidden />
              Acuan Harga Pasar
            </p>
            {pasar ? (
              <>
                <p className="text-xs text-on-surface-variant">
                  Berdasarkan {pasar.jumlah} produk <strong className="text-on-surface">{pasar.kategori}</strong> di seluruh sentra Dinoyo.
                </p>
                <dl className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Termurah", value: pasar.termurah },
                    { label: "Rata-rata", value: pasar.rataRata },
                    { label: "Termahal", value: pasar.termahal },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl bg-surface-low px-2 py-2.5">
                      <dt className="text-[11px] text-on-surface-variant">{item.label}</dt>
                      <dd className="text-xs font-bold text-on-surface">{formatRupiah(item.value)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="relative mt-2 h-2.5 rounded-full bg-linear-to-r from-secondary/50 via-tertiary/50 to-primary/60">
                  {posisiHarga !== null && (
                    <span
                      className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface-lowest bg-primary shadow-card"
                      style={{ left: `${posisiHarga}%` }}
                      title="Harga Anda"
                    />
                  )}
                </div>
                <p className="text-xs text-on-surface-variant">
                  {penilaianHarga === null
                    ? "Isi harga jual untuk melihat posisinya terhadap pasar."
                    : penilaianHarga === "dalam"
                      ? "Harga Anda berada dalam rentang pasar, kompetitif."
                      : penilaianHarga === "di bawah"
                        ? "Harga Anda lebih murah dari semua produk sejenis. Pastikan tidak merugi."
                        : "Harga Anda di atas rentang pasar. Tonjolkan keunikan karya di nama dan label."}
                </p>
              </>
            ) : (
              <p className="rounded-xl bg-surface-low px-4 py-4 text-xs text-on-surface-variant">
                Belum ada produk {values.kategori ? <strong>{values.kategori}</strong> : "di kategori ini"} di sentra. Anda yang pertama!
              </p>
            )}
          </section>

          <section aria-label="Pratinjau kartu katalog" className="flex flex-col gap-3 rounded-2xl bg-surface-lowest p-5 shadow-card sm:p-6">
            <p className="text-overline text-on-surface-variant">Pratinjau di Katalog</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_PRODUK_TONE[values.status]}>{STATUS_PRODUK_OPTIONS.find((item) => item.value === values.status)?.label}</Badge>
              {values.badge && <Badge tone="tertiary">{values.badge}</Badge>}
            </div>
            <p className="font-serif text-xl leading-7 font-bold text-on-surface">{values.nama.trim() || "Nama produk"}</p>
            <p className="text-sm text-on-surface-variant">
              {values.kategori || "Kategori"} • {values.teknik.trim() || "Teknik"} • {values.bahan.trim() || "Bahan"}
            </p>
            <p className="font-serif text-2xl font-bold text-primary">{values.harga ? formatRupiah(values.harga) : "Rp —"}</p>
            <p className="text-xs text-on-surface-variant">{tokoTerpilih ? `${tokoTerpilih.nama} • SKU dibuat otomatis` : "Pilih toko"}</p>
          </section>

          <section aria-label="Tips foto produk" className="flex flex-col gap-3 rounded-2xl bg-tertiary-container/40 p-5 sm:p-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-on-surface">
              <Camera className="size-4 text-tertiary" aria-hidden />
              Tips Foto Produk yang Menarik
            </p>
            <ul className="flex flex-col gap-2">
              {TIPS_FOTO.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs leading-[18px] text-on-surface">
                  <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-tertiary" aria-hidden />
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </form>
  );
}
