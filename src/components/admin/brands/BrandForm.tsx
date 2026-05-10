"use client";

import { useState, useTransition } from "react";

import { createBrandAction, updateBrandAction } from "@/app/admin/brands/actions";
import { slugify } from "@/lib/utils/slugify";

export type BrandItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  sort_order: number;
  is_active: boolean;
};

type BrandFormProps = {
  mode: "create" | "edit";
  initialData?: BrandItem;
  onDone?: () => void;
};

export function BrandForm({ mode, initialData, onDone }: BrandFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slugValue, setSlugValue] = useState(initialData?.slug ?? "");

  return (
    <form
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <span className="mt-1 block text-xs text-slate-500">Format: lowercase, tanpa spasi, gunakan tanda minus.</span>
        </label>
      </div>

      <label className="text-sm">
        <span className="mb-1 block font-medium">Description</span>
        <textarea name="description" rows={3} defaultValue={initialData?.description ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Logo URL</span>
          <input name="logo_url" defaultValue={initialData?.logo_url ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Sort Order</span>
          <input name="sort_order" type="number" defaultValue={initialData?.sort_order ?? 0} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
      </div>

      <label className="inline-flex items-center gap-2 text-sm font-medium">
        <input name="is_active" type="checkbox" defaultChecked={initialData?.is_active ?? true} className="h-4 w-4" />
        Active
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button type="submit" disabled={pending} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
        {pending ? "Saving..." : mode === "create" ? "Create Brand" : "Update Brand"}
      </button>
    </form>
  );
}
