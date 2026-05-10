"use client";

import { useMemo, useState, useTransition } from "react";

import { createProductAction, updateProductAction } from "@/app/admin/products/actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { AdminRichTextEditor } from "@/components/admin/AdminRichTextEditor";
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
  const [shortDescription, setShortDescription] = useState(initialData?.short_description ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");

  const taxonomyOptions = useMemo(() => {
    return taxonomies.filter((item) => {
      if (!brandId || !categoryId) return true;
      return item.brand_id === brandId && item.category_id === categoryId;
    });
  }, [taxonomies, brandId, categoryId]);

  const fieldClassName =
    "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none transition hover:border-[#e7000b]/60 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20";
  const textareaClassName =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none transition hover:border-[#e7000b]/60 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20";
  const sectionClassName = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70";
  const requiredMark = <span className="text-[#e7000b]">*</span>;

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
          setShortDescription("");
          setDescription("");
          onDone?.();
        });
      }}
    >
      {mode === "edit" ? <input type="hidden" name="id" defaultValue={initialData?.id} /> : null}

      <section className={sectionClassName}>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#33414e]">Basic Information</h4>
        <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Name {requiredMark}</span>
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
          <span className="mb-1 block font-medium text-slate-700">Slug {requiredMark}</span>
          <input
            name="slug"
            value={slugValue}
            required={mode === "edit"}
            onChange={(event) => setSlugValue(slugify(event.currentTarget.value))}
            className={fieldClassName}
            placeholder={mode === "create" ? "auto-generated from name" : "product-slug"}
          />
        </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Brand {requiredMark}</span>
          <select
            name="brand_id"
            required
            defaultValue={initialData?.brand_id ?? ""}
            onChange={(event) => setBrandId(event.currentTarget.value)}
            className={fieldClassName}
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
          <span className="mb-1 block font-medium text-slate-700">Category {requiredMark}</span>
          <select
            name="category_id"
            required
            defaultValue={initialData?.category_id ?? ""}
            onChange={(event) => setCategoryId(event.currentTarget.value)}
            className={fieldClassName}
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
          <span className="mb-1 block font-medium text-slate-700">Taxonomy (Optional)</span>
          <select name="taxonomy_id" defaultValue={initialData?.taxonomy_id ?? ""} className={fieldClassName}>
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
          <span className="mb-1 block font-medium text-slate-700">SKU</span>
          <input name="sku" defaultValue={initialData?.sku ?? ""} className={fieldClassName} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Currency</span>
          <input name="currency" defaultValue={initialData?.currency ?? "IDR"} className={fieldClassName} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Badge</span>
          <input name="badge" defaultValue={initialData?.badge ?? ""} className={fieldClassName} />
        </label>
        </div>
      </section>

      <section className={sectionClassName}>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#33414e]">Pricing &amp; Inventory</h4>
        <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Price</span>
          <input name="price" type="number" step="0.01" defaultValue={initialData?.price ?? ""} className={fieldClassName} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Compare At Price</span>
          <input name="compare_at_price" type="number" step="0.01" defaultValue={initialData?.compare_at_price ?? ""} className={fieldClassName} />
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Stock Quantity</span>
          <input name="stock_quantity" type="number" defaultValue={initialData?.stock_quantity ?? 0} className={fieldClassName} />
        </label>
        </div>
      </section>

      <section className={sectionClassName}>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#33414e]">Description</h4>
        <input type="hidden" name="short_description" value={shortDescription} />
        <input type="hidden" name="description" value={description} />
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminRichTextEditor
            label="Short Description"
            value={shortDescription}
            onChange={setShortDescription}
            placeholder="Ringkasan singkat produk"
            minHeightClassName="min-h-[140px]"
          />
          <AdminRichTextEditor
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Deskripsi lengkap produk"
            minHeightClassName="min-h-[160px]"
          />
        </div>
      </section>

      <section className={sectionClassName}>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#33414e]">Media &amp; SEO</h4>
        <ImageUploadField label="Primary Product Image" name="image_url" defaultValue={initialData?.primary_image_url ?? ""} folder="products" maxSizeMB={5} />
        <p className="mt-3 text-xs text-slate-500">SEO fields membantu Google dan search engine memahami halaman produk.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">SEO Title</span>
            <input name="seo_title" className={fieldClassName} placeholder="Title untuk mesin pencari" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Canonical URL (Optional)</span>
            <input name="canonical_url" className={fieldClassName} placeholder="https://domain.com/products/slug" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">SEO Description</span>
            <textarea name="seo_description" rows={2} className={textareaClassName} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">SEO Keywords</span>
            <input name="seo_keywords" className={fieldClassName} placeholder="server, workstation, storage" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">OG Title (Optional)</span>
            <input name="og_title" className={fieldClassName} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">OG Image URL (Optional)</span>
            <input name="og_image_url" className={fieldClassName} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">OG Description (Optional)</span>
            <textarea name="og_description" rows={2} className={textareaClassName} />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-500">Catatan: field SEO disiapkan di UI. Pastikan kolom database tersedia sebelum disimpan permanen.</p>
      </section>

      <section className={sectionClassName}>
        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#33414e]">Status</h4>
        <div className="grid gap-3 sm:grid-cols-5">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Sort Order</span>
          <input name="sort_order" type="number" defaultValue={initialData?.sort_order ?? 0} className={fieldClassName} />
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
        <button type="submit" disabled={pending} className="rounded-xl bg-[#e7000b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c9000a] disabled:opacity-60">
        {pending ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
        </button>
        {mode === "edit" ? <span className="text-xs text-slate-500">Gunakan tombol close pada panel edit untuk membatalkan perubahan.</span> : null}
      </div>
    </form>
  );
}
