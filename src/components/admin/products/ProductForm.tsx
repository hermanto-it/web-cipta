"use client";

import { useMemo, useState, useTransition } from "react";

import { createProductAction, updateProductAction } from "@/app/admin/products/actions";
import { slugify } from "@/lib/utils/slugify";

export type ProductOption = { id: string; name: string };
export type TaxonomyOption = { id: string; name: string; brand_id: string; category_id: string };

export type ProductItem = {
  id: string;
  brand_id: string;
  category_id: string;
  taxonomy_id: string | null;
  sku: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  compare_at_price: number | null;
  currency: string;
  stock_quantity: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_promo: boolean;
  is_active: boolean;
  badge: string | null;
  sort_order: number;
};

type ProductFormProps = {
  mode: "create" | "edit";
  initialData?: ProductItem;
  brands: ProductOption[];
  categories: ProductOption[];
  taxonomies: TaxonomyOption[];
  onDone?: () => void;
};

export function ProductForm({ mode, initialData, brands, categories, taxonomies, onDone }: ProductFormProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slugValue, setSlugValue] = useState(initialData?.slug ?? "");
  const [brandId, setBrandId] = useState(initialData?.brand_id ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");

  const taxonomyOptions = useMemo(() => {
    return taxonomies.filter((item) => {
      if (!brandId || !categoryId) return true;
      return item.brand_id === brandId && item.category_id === categoryId;
    });
  }, [taxonomies, brandId, categoryId]);

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
          const result = mode === "create" ? await createProductAction(formData) : await updateProductAction(formData);
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
            value={slugValue}
            required={mode === "edit"}
            onChange={(event) => setSlugValue(slugify(event.currentTarget.value))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder={mode === "create" ? "auto-generated from name" : "product-slug"}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Brand *</span>
          <select
            name="brand_id"
            required
            defaultValue={initialData?.brand_id ?? ""}
            onChange={(event) => setBrandId(event.currentTarget.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select brand</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">Category *</span>
          <select
            name="category_id"
            required
            defaultValue={initialData?.category_id ?? ""}
            onChange={(event) => setCategoryId(event.currentTarget.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="">Select category</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium">Taxonomy (Optional)</span>
          <select name="taxonomy_id" defaultValue={initialData?.taxonomy_id ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">No taxonomy</option>
            {taxonomyOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">SKU</span>
          <input name="sku" defaultValue={initialData?.sku ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Currency</span>
          <input name="currency" defaultValue={initialData?.currency ?? "IDR"} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Badge</span>
          <input name="badge" defaultValue={initialData?.badge ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Price</span>
          <input name="price" type="number" step="0.01" defaultValue={initialData?.price ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Compare At Price</span>
          <input name="compare_at_price" type="number" step="0.01" defaultValue={initialData?.compare_at_price ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Stock Quantity</span>
          <input name="stock_quantity" type="number" defaultValue={initialData?.stock_quantity ?? 0} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Short Description</span>
          <textarea name="short_description" rows={2} defaultValue={initialData?.short_description ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Description</span>
          <textarea name="description" rows={2} defaultValue={initialData?.description ?? ""} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Sort Order</span>
          <input name="sort_order" type="number" defaultValue={initialData?.sort_order ?? 0} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="mt-7 inline-flex items-center gap-2 text-sm font-medium">
          <input name="is_active" type="checkbox" defaultChecked={initialData?.is_active ?? true} className="h-4 w-4" /> Active
        </label>
        <label className="mt-7 inline-flex items-center gap-2 text-sm font-medium">
          <input name="is_featured" type="checkbox" defaultChecked={initialData?.is_featured ?? false} className="h-4 w-4" /> Featured
        </label>
        <label className="mt-7 inline-flex items-center gap-2 text-sm font-medium">
          <input name="is_best_seller" type="checkbox" defaultChecked={initialData?.is_best_seller ?? false} className="h-4 w-4" /> Best Seller
        </label>
        <label className="mt-7 inline-flex items-center gap-2 text-sm font-medium">
          <input name="is_promo" type="checkbox" defaultChecked={initialData?.is_promo ?? false} className="h-4 w-4" /> Promo
        </label>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button type="submit" disabled={pending} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
        {pending ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
      </button>
    </form>
  );
}
