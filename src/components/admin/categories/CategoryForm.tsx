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
  formId?: string;
  showSubmit?: boolean;
};

export function CategoryForm({ mode, initialData, onDone, formId, showSubmit = true }: CategoryFormProps) {
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
            placeholder={mode === "create" ? "auto-generated from name" : "category-slug"}
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

      {showSubmit ? <button type="submit" disabled={pending} className="rounded-xl bg-[#e7000b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c9000a] disabled:opacity-60">
        {pending ? "Saving..." : mode === "create" ? "Create Category" : "Update Category"}
      </button> : null}
    </form>
  );
}
