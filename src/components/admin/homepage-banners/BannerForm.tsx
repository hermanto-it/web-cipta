"use client";

import { useState, useTransition } from "react";

import { createBannerAction, updateBannerAction } from "@/app/admin/homepage-banners/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type Placement =
  | "hero"
  | "side_promo"
  | "middle_promo"
  | "bottom_cta"
  | "benefit_free_delivery"
  | "benefit_support_247"
  | "benefit_payment"
  | "benefit_reliable"
  | "benefit_guarantee";

export type BannerItem = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  placement: Placement;
  badge: string | null;
  price_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type BannerFormProps = {
  mode: "create" | "edit";
  initialData?: BannerItem;
  onDone?: () => void;
  formId?: string;
  showSubmit?: boolean;
};

const placementOptions: Array<{ value: Placement; label: string }> = [
  { value: "hero", label: "hero" },
  { value: "middle_promo", label: "middle_promo" },
  { value: "bottom_cta", label: "bottom_cta" },
  { value: "benefit_free_delivery", label: "Benefit - Free Delivery" },
  { value: "benefit_support_247", label: "Benefit - Support 24/7" },
  { value: "benefit_payment", label: "Benefit - Payment" },
  { value: "benefit_reliable", label: "Benefit - Reliable" },
  { value: "benefit_guarantee", label: "Benefit - Guarantee" },
];

export function BannerForm({ mode, initialData, onDone, formId, showSubmit = true }: BannerFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [placementValue, setPlacementValue] = useState<Placement>(initialData?.placement ?? "hero");
  const [imageFieldResetKey, setImageFieldResetKey] = useState(0);
  const fieldClassName = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition hover:border-[#e7000b]/60 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20";
  const placementRecommendedSize: Record<Placement, string> = {
    hero: "1920x700 px (alternatif: 1600x600 px)",
    side_promo: "Display 300x202 px (upload disarankan 900x606 px)",
    middle_promo: "1400x360 px",
    bottom_cta: "1400x320 px",
    benefit_free_delivery: "900x320 px",
    benefit_support_247: "900x320 px",
    benefit_payment: "900x320 px",
    benefit_reliable: "900x320 px",
    benefit_guarantee: "900x320 px",
  };
  const placementSelectOptions = mode === "edit" && initialData?.placement === "side_promo"
    ? [{ value: "side_promo" as Placement, label: "side_promo (legacy)" }, ...placementOptions]
    : placementOptions;

  return (
    <form
      id={formId}
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        const form = event.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
          const result = mode === "create" ? await createBannerAction(formData) : await updateBannerAction(formData);

          if (!result.ok) {
            setError(result.error ?? "Terjadi kesalahan.");
            return;
          }

          if (mode === "create") {
            form.reset();
            setPlacementValue("hero");
            setImageFieldResetKey((current) => current + 1);
            setSuccess("Banner berhasil dibuat.");
          } else {
            setSuccess("Banner berhasil diperbarui.");
          }

          onDone?.();
        });
      }}
    >
      {mode === "edit" ? <input type="hidden" name="id" defaultValue={initialData?.id} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Title *</span>
          <input name="title" required defaultValue={initialData?.title ?? ""} className={fieldClassName} />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">Placement *</span>
          <select name="placement" required value={placementValue} onChange={(event) => setPlacementValue(event.currentTarget.value as Placement)} className={fieldClassName}>
            {placementSelectOptions.map((placement) => (
              <option key={placement.value} value={placement.value}>
                {placement.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Subtitle</span>
          <input name="subtitle" defaultValue={initialData?.subtitle ?? ""} className={fieldClassName} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Badge</span>
          <input name="badge" defaultValue={initialData?.badge ?? ""} className={fieldClassName} />
        </label>
      </div>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Description</span>
        <textarea name="description" rows={3} defaultValue={initialData?.description ?? ""} className={fieldClassName} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <ImageUploadField
          key={`${mode}-${imageFieldResetKey}`}
          label="Banner Image"
          name="image_url"
          defaultValue={initialData?.image_url ?? ""}
          folder="banners"
          maxSizeMB={5}
        />
        <label className="text-sm">
          <span className="mb-1 block font-medium">Price Text</span>
          <input name="price_text" defaultValue={initialData?.price_text ?? ""} className={fieldClassName} />
        </label>
      </div>
      <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600 ring-1 ring-slate-200/70">
        <p className="font-medium text-amber-700">Side promo sudah tidak digunakan di homepage baru. Gunakan placement hero untuk hero slider utama.</p>
        <p className="font-semibold text-slate-700">Recommended: {placementRecommendedSize[placementValue]}</p>
        <p>Hero Slider: 1920x700 px | Alternatif Hero: 1600x600 px</p>
        <p>Middle Promo: 1400x360 px | Bottom CTA: 1400x320 px | Benefit image: 900x320 px</p>
        <p>Format: WebP/JPG/PNG, max 1-2MB</p>
        <p>Untuk Hero, hindari teks terlalu besar di dalam gambar jika teks sudah diisi dari admin, karena teks database akan tampil di atas banner.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm sm:col-span-1">
          <span className="mb-1 block font-medium">CTA Label</span>
          <input name="cta_label" defaultValue={initialData?.cta_label ?? ""} className={fieldClassName} />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">CTA Href</span>
          <input name="cta_href" defaultValue={initialData?.cta_href ?? ""} className={fieldClassName} />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">SEO Title</span>
          <input name="seo_title" defaultValue={initialData?.seo_title ?? ""} className={fieldClassName} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Canonical URL</span>
          <input name="canonical_url" defaultValue={initialData?.canonical_url ?? ""} className={fieldClassName} />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">SEO Description</span>
          <textarea name="seo_description" rows={2} defaultValue={initialData?.seo_description ?? ""} className={fieldClassName} />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">SEO Keywords</span>
          <input name="seo_keywords" defaultValue={initialData?.seo_keywords ?? ""} className={fieldClassName} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">OG Title</span>
          <input name="og_title" defaultValue={initialData?.og_title ?? ""} className={fieldClassName} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">OG Image URL</span>
          <input name="og_image_url" defaultValue={initialData?.og_image_url ?? ""} className={fieldClassName} />
        </label>
        <label className="text-sm sm:col-span-2">
          <span className="mb-1 block font-medium">OG Description</span>
          <textarea name="og_description" rows={2} defaultValue={initialData?.og_description ?? ""} className={fieldClassName} />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Sort Order</span>
          <input name="sort_order" type="number" defaultValue={initialData?.sort_order ?? 0} className={fieldClassName} />
        </label>
        <label className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
          <input name="is_active" type="checkbox" defaultChecked={initialData?.is_active ?? true} className="h-4 w-4" />
          Active
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      {showSubmit ? <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-[#e7000b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c9000a] disabled:opacity-60"
      >
        {pending ? "Saving..." : mode === "create" ? "Create Banner" : "Update Banner"}
      </button> : null}
    </form>
  );
}
