"use client";

import { useState, useTransition } from "react";

import { createBrandAction, updateBrandAction } from "@/app/admin/brands/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { slugify } from "@/lib/utils/slugify";

export type BrandItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
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

type BrandFormProps = {
  mode: "create" | "edit";
  initialData?: BrandItem;
  onDone?: () => void;
  formId?: string;
  showSubmit?: boolean;
};

export function BrandForm({ mode, initialData, onDone, formId, showSubmit = true }: BrandFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slugValue, setSlugValue] = useState(initialData?.slug ?? "");
  const fieldClassName = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition hover:border-[#e7000b]/60 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20";

  return (
    <form
      id={formId}
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        if (!formData.get("slug") && formData.get("name")) {
          formData.set("slug", slugify(String(formData.get("name"))));
        }

        startTransition(async () => {
          const result = mode === "create" ? await createBrandAction(formData) : await updateBrandAction(formData);

          if (!result.ok) {
            setError(result.error ?? "Terjadi kesalahan.");
            return;
          }

          event.currentTarget.reset();
          setSlugValue("");
          onDone?.();
        });
      }}
    >
      {mode === "edit" ? <input type="hidden" name="id" defaultValue={initialData?.id} /> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Name *</span>
          <input
            name="name"
            required
            defaultValue={initialData?.name ?? ""}
            className={fieldClassName}
            onChange={(event) => {
              if (mode === "create") {
                setSlugValue(slugify(event.currentTarget.value));
              }
            }}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">Slug *</span>
          <input
            name="slug"
            required={mode === "edit"}
            value={slugValue}
            onChange={(event) => setSlugValue(slugify(event.currentTarget.value))}
            placeholder={mode === "create" ? "auto-generated from name" : "brand-slug"}
            className={fieldClassName}
          />
          <span className="mt-1 block text-xs text-slate-500">Format: lowercase, tanpa spasi, gunakan tanda minus.</span>
        </label>
      </div>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Description</span>
        <textarea name="description" rows={3} defaultValue={initialData?.description ?? ""} className={fieldClassName} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <ImageUploadField label="Logo Brand" name="logo_url" defaultValue={initialData?.logo_url ?? ""} folder="brands" maxSizeMB={3} />
        <label className="text-sm">
          <span className="mb-1 block font-medium">Sort Order</span>
          <input name="sort_order" type="number" defaultValue={initialData?.sort_order ?? 0} className={fieldClassName} />
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

      <label className="inline-flex items-center gap-2 text-sm font-medium">
        <input name="is_active" type="checkbox" defaultChecked={initialData?.is_active ?? true} className="h-4 w-4" />
        Active
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {showSubmit ? <button type="submit" disabled={pending} className="rounded-xl bg-[#e7000b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c9000a] disabled:opacity-60">
        {pending ? "Saving..." : mode === "create" ? "Create Brand" : "Update Brand"}
      </button> : null}
    </form>
  );
}
