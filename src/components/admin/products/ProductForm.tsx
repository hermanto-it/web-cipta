"use client";

import { useMemo, useState, useTransition } from "react";

import { createProductAction, updateProductAction } from "@/app/admin/products/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminMarkdownEditor } from "@/components/admin/AdminMarkdownEditor";
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
  primary_image_url?: string | null;
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
      className="grid gap-4"
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

      <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Basic Information</h4>
        <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Name *</span>
          <input
            name="name"
            required
            defaultValue={initialData?.name ?? ""}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]"
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
            className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]"
            placeholder={mode === "create" ? "auto-generated from name" : "product-slug"}
          />
        </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Brand *</span>
          <select
            name="brand_id"
            required
            defaultValue={initialData?.brand_id ?? ""}
            onChange={(event) => setBrandId(event.currentTarget.value)}
            className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]"
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
            className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]"
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
          <select name="taxonomy_id" defaultValue={initialData?.taxonomy_id ?? ""} className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]">
            <option value="">No taxonomy</option>
            {taxonomyOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">SKU</span>
          <input name="sku" defaultValue={initialData?.sku ?? ""} className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Currency</span>
          <input name="currency" defaultValue={initialData?.currency ?? "IDR"} className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Badge</span>
          <input name="badge" defaultValue={initialData?.badge ?? ""} className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" />
        </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Pricing &amp; Inventory</h4>
        <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Price</span>
          <input name="price" type="number" step="0.01" defaultValue={initialData?.price ?? ""} className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Compare At Price</span>
          <input name="compare_at_price" type="number" step="0.01" defaultValue={initialData?.compare_at_price ?? ""} className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Stock Quantity</span>
          <input name="stock_quantity" type="number" defaultValue={initialData?.stock_quantity ?? 0} className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" />
        </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Description</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminMarkdownEditor
            label="Short Description"
            name="short_description"
            defaultValue={initialData?.short_description ?? ""}
            placeholder="Ringkasan singkat produk"
            rows={5}
          />
          <AdminMarkdownEditor
            label="Description"
            name="description"
            defaultValue={initialData?.description ?? ""}
            placeholder="Deskripsi lengkap produk"
            rows={5}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Media &amp; SEO</h4>
        <ImageUploadField label="Primary Product Image" name="image_url" defaultValue={initialData?.primary_image_url ?? ""} folder="products" maxSizeMB={5} />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">SEO Title</span>
            <input name="seo_title" className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" placeholder="Title untuk mesin pencari" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Canonical URL (Optional)</span>
            <input name="canonical_url" className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" placeholder="https://domain.com/products/slug" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">SEO Description</span>
            <textarea name="seo_description" rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">SEO Keywords</span>
            <input name="seo_keywords" className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" placeholder="server, workstation, storage" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">OG Title (Optional)</span>
            <input name="og_title" className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">OG Image URL (Optional)</span>
            <input name="og_image_url" className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">OG Description (Optional)</span>
            <textarea name="og_description" rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-500">Catatan: field SEO disiapkan di UI. Pastikan kolom database tersedia sebelum disimpan permanen.</p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">Status</h4>
        <div className="grid gap-3 sm:grid-cols-5">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Sort Order</span>
          <input name="sort_order" type="number" defaultValue={initialData?.sort_order ?? 0} className="h-10 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none transition focus:border-[#DB1A1A] focus:ring-1 focus:ring-[#DB1A1A]" />
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
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-[#DB1A1A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b91515] disabled:opacity-60">
        {pending ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
        </button>
        {mode === "edit" ? <span className="text-xs text-slate-500">Gunakan tombol close pada panel edit untuk membatalkan perubahan.</span> : null}
      </div>
    </form>
  );
}
