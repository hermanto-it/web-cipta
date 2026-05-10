"use client";

import { useState, useTransition } from "react";

import { createCategoryAction, updateCategoryAction } from "@/app/admin/categories/actions";
import { slugify } from "@/lib/utils/slugify";

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
};

type CategoryFormProps = {
  mode: "create" | "edit";
  initialData?: CategoryItem;
  onDone?: () => void;
};

export function CategoryForm({ mode, initialData, onDone }: CategoryFormProps) {
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
          const result = mode === "create" ? await createCategoryAction(formData) : await updateCategoryAction(formData);

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
            placeholder={mode === "create" ? "auto-generated from name" : "category-slug"}
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
          <span className="mb-1 block font-medium">Sort Order</span>
          <input name="sort_order" type="number" defaultValue={initialData?.sort_order ?? 0} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
          <input name="is_active" type="checkbox" defaultChecked={initialData?.is_active ?? true} className="h-4 w-4" />
          Active
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button type="submit" disabled={pending} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
        {pending ? "Saving..." : mode === "create" ? "Create Category" : "Update Category"}
      </button>
    </form>
  );
}
