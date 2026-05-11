"use client";

import { useState, useTransition } from "react";

import { createBannerAction, updateBannerAction } from "@/app/admin/homepage-banners/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type Placement = "hero" | "side_promo" | "middle_promo" | "bottom_cta";

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

const placementOptions: Placement[] = ["hero", "side_promo", "middle_promo", "bottom_cta"];

export function BannerForm({ mode, initialData, onDone, formId, showSubmit = true }: BannerFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fieldClassName = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition hover:border-[#e7000b]/60 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20";

  return (
    <form
      id={formId}
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          const result = mode === "create" ? await createBannerAction(formData) : await updateBannerAction(formData);

          if (!result.ok) {
            setError(result.error ?? "Terjadi kesalahan.");
            return;
          }

          event.currentTarget.reset();
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
          <select name="placement" required defaultValue={initialData?.placement ?? "hero"} className={fieldClassName}>
            {placementOptions.map((placement) => (
              <option key={placement} value={placement}>
                {placement}
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
        <ImageUploadField label="Banner Image" name="image_url" defaultValue={initialData?.image_url ?? ""} folder="banners" maxSizeMB={5} />
        <label className="text-sm">
          <span className="mb-1 block font-medium">Price Text</span>
          <input name="price_text" defaultValue={initialData?.price_text ?? ""} className={fieldClassName} />
        </label>
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
          <span className="mb-1 block font-medium">Sort Order</span>
          <input name="sort_order" type="number" defaultValue={initialData?.sort_order ?? 0} className={fieldClassName} />
        </label>
        <label className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
          <input name="is_active" type="checkbox" defaultChecked={initialData?.is_active ?? true} className="h-4 w-4" />
          Active
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

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
