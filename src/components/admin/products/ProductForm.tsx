"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

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
  tax_rate: number | null;
  tax_amount: number | null;
  final_price: number | null;
  is_tax_included: boolean;
  currency: string;
  stock_quantity: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_promo: boolean;
  is_active: boolean;
  badge: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
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
  formId?: string;
  showSubmit?: boolean;
};

const COMPANY_NAME = "PT Cipta Solusi Techindo";
const FALLBACK_SITE_URL = "https://domain.com";

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function limitText(input: string, max = 160) {
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1).trimEnd()}...`;
}

function parseNumber(text: string) {
  if (text.trim().length === 0) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatIdr(value: number | null) {
  if (value === null || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

export function ProductForm({ mode, initialData, brands, categories, taxonomies, onDone, formId, showSubmit = true }: ProductFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formResetKey, setFormResetKey] = useState(0);

  const [nameValue, setNameValue] = useState(initialData?.name ?? "");
  const [slugValue, setSlugValue] = useState(initialData?.slug ?? "");
  const [brandId, setBrandId] = useState(initialData?.brand_id ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [taxonomyId, setTaxonomyId] = useState(initialData?.taxonomy_id ?? "");
  const [skuValue, setSkuValue] = useState(initialData?.sku ?? "");
  const [shortDescription, setShortDescription] = useState(initialData?.short_description ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [primaryImageUrl, setPrimaryImageUrl] = useState(initialData?.primary_image_url ?? "");

  const [priceInput, setPriceInput] = useState(initialData?.price?.toString() ?? "");
  const [compareAtPriceInput, setCompareAtPriceInput] = useState(initialData?.compare_at_price?.toString() ?? "");
  const [taxRateInput, setTaxRateInput] = useState((initialData?.tax_rate ?? 11).toString());
  const [isTaxIncluded, setIsTaxIncluded] = useState(initialData?.is_tax_included ?? false);

  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonical_url ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description ?? "");
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seo_keywords ?? "");
  const [ogTitle, setOgTitle] = useState(initialData?.og_title ?? "");
  const [ogImageUrl, setOgImageUrl] = useState(initialData?.og_image_url ?? "");
  const [ogDescription, setOgDescription] = useState(initialData?.og_description ?? "");

  const [seoTitleManual, setSeoTitleManual] = useState(Boolean(initialData?.seo_title));
  const [canonicalUrlManual, setCanonicalUrlManual] = useState(Boolean(initialData?.canonical_url));
  const [seoDescriptionManual, setSeoDescriptionManual] = useState(Boolean(initialData?.seo_description));
  const [seoKeywordsManual, setSeoKeywordsManual] = useState(Boolean(initialData?.seo_keywords));
  const [ogTitleManual, setOgTitleManual] = useState(Boolean(initialData?.og_title));
  const [ogImageUrlManual, setOgImageUrlManual] = useState(Boolean(initialData?.og_image_url));
  const [ogDescriptionManual, setOgDescriptionManual] = useState(Boolean(initialData?.og_description));

  const resetFormState = () => {
    setSlugValue("");
    setNameValue("");
    setBrandId("");
    setCategoryId("");
    setTaxonomyId("");
    setSkuValue("");
    setShortDescription("");
    setDescription("");
    setPrimaryImageUrl("");
    setPriceInput("");
    setCompareAtPriceInput("");
    setTaxRateInput("11");
    setIsTaxIncluded(false);
    setSeoTitle("");
    setCanonicalUrl("");
    setSeoDescription("");
    setSeoKeywords("");
    setOgTitle("");
    setOgImageUrl("");
    setOgDescription("");
    setSeoTitleManual(false);
    setCanonicalUrlManual(false);
    setSeoDescriptionManual(false);
    setSeoKeywordsManual(false);
    setOgTitleManual(false);
    setOgImageUrlManual(false);
    setOgDescriptionManual(false);
    setFormResetKey((current) => current + 1);
  };

  const taxonomyOptions = useMemo(() => {
    return taxonomies.filter((item) => {
      if (!brandId || !categoryId) return true;
      return item.brand_id === brandId && item.category_id === categoryId;
    });
  }, [taxonomies, brandId, categoryId]);

  const brandName = brands.find((item) => item.id === brandId)?.name ?? "Brand";
  const categoryName = categories.find((item) => item.id === categoryId)?.name ?? "Category";
  const taxonomyName = taxonomies.find((item) => item.id === taxonomyId)?.name ?? "";

  const taxRateValue = parseNumber(taxRateInput) ?? 11;
  const enteredPrice = parseNumber(priceInput);
  const taxRateFraction = taxRateValue / 100;
  const basePrice = enteredPrice === null ? null : isTaxIncluded ? enteredPrice / (1 + taxRateFraction) : enteredPrice;
  const taxAmount = enteredPrice === null ? null : isTaxIncluded ? enteredPrice - (basePrice ?? 0) : enteredPrice * taxRateFraction;
  const finalPrice = enteredPrice === null ? null : isTaxIncluded ? enteredPrice : enteredPrice + (taxAmount ?? 0);

  const generatedSeoValues = useMemo(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE_URL;
    const normalizedSlug = slugValue.trim().length > 0 ? slugValue : slugify(nameValue);
    const generatedTitle = `${nameValue || "Produk"} | ${brandName} | ${COMPANY_NAME}`;
    const shortText = stripHtml(shortDescription);
    const longText = stripHtml(description);
    const generatedDescriptionSource =
      shortText ||
      longText ||
      `Dapatkan ${nameValue || "produk"} dari ${brandName} untuk kebutuhan ${categoryName} enterprise IT. Hubungi ${COMPANY_NAME} untuk konsultasi dan penawaran terbaik.`;
    const generatedDescription = limitText(generatedDescriptionSource, 160);
    const keywordItems = [nameValue, brandName, categoryName, taxonomyName, skuValue, "server enterprise", "infrastruktur IT", COMPANY_NAME]
      .map((value) => value.trim())
      .filter((value, index, self) => value.length > 0 && self.indexOf(value) === index);

    return {
      seoTitle: generatedTitle,
      canonicalUrl: `${siteUrl.replace(/\/$/, "")}/products/${normalizedSlug || "product-slug"}`,
      seoDescription: generatedDescription,
      seoKeywords: keywordItems.join(", "),
      ogTitle: generatedTitle,
      ogDescription: generatedDescription,
      ogImageUrl: primaryImageUrl.trim(),
    };
  }, [nameValue, brandName, categoryName, taxonomyName, skuValue, shortDescription, description, slugValue, primaryImageUrl]);

  const resolvedSeoTitle = seoTitleManual ? seoTitle : generatedSeoValues.seoTitle;
  const resolvedCanonicalUrl = canonicalUrlManual ? canonicalUrl : generatedSeoValues.canonicalUrl;
  const resolvedSeoDescription = seoDescriptionManual ? seoDescription : generatedSeoValues.seoDescription;
  const resolvedSeoKeywords = seoKeywordsManual ? seoKeywords : generatedSeoValues.seoKeywords;
  const resolvedOgTitle = ogTitleManual ? ogTitle : generatedSeoValues.ogTitle;
  const resolvedOgDescription = ogDescriptionManual ? ogDescription : generatedSeoValues.ogDescription;
  const resolvedOgImageUrl = ogImageUrlManual ? ogImageUrl : generatedSeoValues.ogImageUrl;

  const fieldClassName =
    "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none transition hover:border-[#e7000b]/60 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20";
  const textareaClassName =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none transition hover:border-[#e7000b]/60 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20";
  const sectionClassName = "rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70";
  const requiredMark = <span className="text-[#e7000b]">*</span>;

  return (
    <form
      key={`${mode}-${formResetKey}`}
      id={formId}
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        const formData = new FormData(event.currentTarget);
        const effectiveSlug = slugValue || slugify(nameValue);
        formData.set("slug", effectiveSlug);
        formData.set("seo_title", resolvedSeoTitle);
        formData.set("canonical_url", resolvedCanonicalUrl);
        formData.set("seo_description", resolvedSeoDescription);
        formData.set("seo_keywords", resolvedSeoKeywords);
        formData.set("og_title", resolvedOgTitle);
        formData.set("og_image_url", resolvedOgImageUrl);
        formData.set("og_description", resolvedOgDescription);
        formData.set("tax_rate", String(taxRateValue));
        formData.set("compare_at_price", compareAtPriceInput.trim());
        formData.set("tax_amount", taxAmount === null ? "" : String(taxAmount));
        formData.set("final_price", finalPrice === null ? "" : String(finalPrice));
        formData.set("is_tax_included", isTaxIncluded ? "on" : "off");

        startTransition(async () => {
          const result = mode === "create" ? await createProductAction(formData) : await updateProductAction(formData);
          if (!result.ok) {
            setError(result.error ?? "Terjadi kesalahan.");
            return;
          }

          if (mode === "create") {
            resetFormState();
            setSuccess("Product berhasil dibuat.");
          } else {
            setSuccess("Product berhasil diperbarui.");
          }
          router.refresh();
          onDone?.();
        });
      }}
    >
      {mode === "edit" ? <input type="hidden" name="id" defaultValue={initialData?.id} /> : null}

      <section className={sectionClassName}>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#33414e]">Basic Information</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Name {requiredMark}</span>
            <input
              name="name"
              required
              value={nameValue}
              className={fieldClassName}
              onChange={(event) => {
                const next = event.currentTarget.value;
                setNameValue(next);
                if (mode === "create") setSlugValue(slugify(next));
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
            <select name="brand_id" required value={brandId} onChange={(event) => setBrandId(event.currentTarget.value)} className={fieldClassName}>
              <option value="">Select brand</option>
              {brands.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Category {requiredMark}</span>
            <select name="category_id" required value={categoryId} onChange={(event) => setCategoryId(event.currentTarget.value)} className={fieldClassName}>
              <option value="">Select category</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Taxonomy (Optional)</span>
            <select name="taxonomy_id" value={taxonomyId} onChange={(event) => setTaxonomyId(event.currentTarget.value)} className={fieldClassName}>
              <option value="">No taxonomy</option>
              {taxonomyOptions.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">SKU</span>
            <input name="sku" value={skuValue} onChange={(event) => setSkuValue(event.currentTarget.value)} className={fieldClassName} />
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
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#33414e]">Pricing &amp; Inventory</h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Price</span>
            <input name="price" type="number" step="0.01" value={priceInput} onChange={(event) => setPriceInput(event.currentTarget.value)} className={fieldClassName} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Compare At Price</span>
            <input name="compare_at_price" type="number" step="0.01" value={compareAtPriceInput} onChange={(event) => setCompareAtPriceInput(event.currentTarget.value)} className={fieldClassName} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tax Rate / PPN %</span>
            <input name="tax_rate" type="number" step="0.01" value={taxRateInput} onChange={(event) => setTaxRateInput(event.currentTarget.value)} className={fieldClassName} />
          </label>
          <label className="mt-7 inline-flex items-center gap-2 text-sm font-medium sm:col-span-3">
            <input name="is_tax_included" type="checkbox" checked={isTaxIncluded} onChange={(event) => setIsTaxIncluded(event.currentTarget.checked)} className="h-4 w-4" />
            Harga sudah termasuk PPN
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Tax Amount / Nilai PPN (readonly)</span>
            <input name="tax_amount" type="number" value={taxAmount === null ? "" : taxAmount.toFixed(2)} readOnly className={`${fieldClassName} bg-slate-50`} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Final Price (readonly)</span>
            <input name="final_price" type="number" value={finalPrice === null ? "" : finalPrice.toFixed(2)} readOnly className={`${fieldClassName} bg-slate-50`} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Stock Quantity</span>
            <input name="stock_quantity" type="number" defaultValue={initialData?.stock_quantity ?? 0} className={fieldClassName} />
          </label>
        </div>
        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200/70">
          <p>Harga dasar: {formatIdr(basePrice)}</p>
          <p>PPN {taxRateValue}%: {formatIdr(taxAmount)}</p>
          <p className="font-semibold">Final price: {formatIdr(finalPrice)}</p>
        </div>
        <p className="mt-2 text-xs text-slate-500">Price dapat diisi sebagai harga sebelum PPN atau harga sudah termasuk PPN. Sistem akan menghitung PPN 11% dan Final Price otomatis.</p>
      </section>

      <section className={sectionClassName}>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#33414e]">Description</h4>
        <input type="hidden" name="short_description" value={shortDescription} />
        <input type="hidden" name="description" value={description} />
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminRichTextEditor label="Short Description" value={shortDescription} onChange={setShortDescription} placeholder="Ringkasan singkat produk" minHeightClassName="min-h-[140px]" />
          <AdminRichTextEditor label="Description" value={description} onChange={setDescription} placeholder="Deskripsi lengkap produk" minHeightClassName="min-h-[160px]" />
        </div>
      </section>

      <section className={sectionClassName}>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#33414e]">Media &amp; SEO</h4>
        <ImageUploadField label="Primary Product Image" name="image_url" defaultValue={initialData?.primary_image_url ?? ""} folder="products" maxSizeMB={5} onValueChange={setPrimaryImageUrl} />
        <p className="mt-2 text-xs text-slate-500">Rekomendasi Product Card: 1200x800 px (rasio 3:2), format PNG/WebP/JPG max 1-2MB, dan usahakan objek produk memenuhi 80-90% area gambar (hindari whitespace terlalu besar).</p>
        <p className="mt-3 text-xs text-slate-500">SEO fields otomatis dibuat dari nama produk, brand, category, taxonomy, SKU, dan gambar utama. Tetap bisa diedit manual.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">SEO Title</span>
            <input name="seo_title" value={resolvedSeoTitle} onChange={(event) => { setSeoTitle(event.currentTarget.value); setSeoTitleManual(true); }} className={fieldClassName} placeholder="Title untuk mesin pencari" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Canonical URL (Optional)</span>
            <input name="canonical_url" value={resolvedCanonicalUrl} onChange={(event) => { setCanonicalUrl(event.currentTarget.value); setCanonicalUrlManual(true); }} className={fieldClassName} placeholder="https://domain.com/products/slug" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">SEO Description</span>
            <textarea name="seo_description" rows={2} value={resolvedSeoDescription} onChange={(event) => { setSeoDescription(event.currentTarget.value); setSeoDescriptionManual(true); }} className={textareaClassName} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">SEO Keywords</span>
            <input name="seo_keywords" value={resolvedSeoKeywords} onChange={(event) => { setSeoKeywords(event.currentTarget.value); setSeoKeywordsManual(true); }} className={fieldClassName} placeholder="server, workstation, storage" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">OG Title (Optional)</span>
            <input name="og_title" value={resolvedOgTitle} onChange={(event) => { setOgTitle(event.currentTarget.value); setOgTitleManual(true); }} className={fieldClassName} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">OG Image URL (Optional)</span>
            <input name="og_image_url" value={resolvedOgImageUrl} onChange={(event) => { setOgImageUrl(event.currentTarget.value); setOgImageUrlManual(true); }} className={fieldClassName} />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium text-slate-700">OG Description (Optional)</span>
            <textarea name="og_description" rows={2} value={resolvedOgDescription} onChange={(event) => { setOgDescription(event.currentTarget.value); setOgDescriptionManual(true); }} className={textareaClassName} />
          </label>
        </div>
      </section>

      <section className={sectionClassName}>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#33414e]">Status</h4>
        <div className="grid gap-3 sm:grid-cols-5">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-700">Sort Order</span>
            <input name="sort_order" type="number" defaultValue={initialData?.sort_order ?? 0} className={fieldClassName} />
          </label>
          <label className="mt-7 inline-flex items-center gap-2 text-sm font-medium"><input name="is_active" type="checkbox" defaultChecked={initialData?.is_active ?? true} className="h-4 w-4" /> Active</label>
          <label className="mt-7 inline-flex items-center gap-2 text-sm font-medium"><input name="is_featured" type="checkbox" defaultChecked={initialData?.is_featured ?? false} className="h-4 w-4" /> Featured</label>
          <label className="mt-7 inline-flex items-center gap-2 text-sm font-medium"><input name="is_best_seller" type="checkbox" defaultChecked={initialData?.is_best_seller ?? false} className="h-4 w-4" /> Best Seller</label>
          <label className="mt-7 inline-flex items-center gap-2 text-sm font-medium"><input name="is_promo" type="checkbox" defaultChecked={initialData?.is_promo ?? false} className="h-4 w-4" /> Promo</label>
        </div>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      {showSubmit ? (
        <div className="sticky bottom-2 z-10 flex flex-wrap items-center gap-2 rounded-xl bg-white/95 px-2 py-2 backdrop-blur">
          <button type="submit" disabled={pending} className="rounded-xl bg-[#e7000b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c9000a] disabled:opacity-60">
            {pending ? "Saving..." : mode === "create" ? "Create Product" : "Update Product"}
          </button>
          {mode === "edit" ? <span className="text-xs text-slate-500">Gunakan tombol close pada panel edit untuk membatalkan perubahan.</span> : null}
        </div>
      ) : null}
    </form>
  );
}
