"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import { isValidSlug, slugify } from "@/lib/utils/slugify";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

function asNullableText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asRequiredText(value: FormDataEntryValue | null) {
  const parsed = asNullableText(value);
  return parsed ?? "";
}

function parseInteger(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseNumberOrNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  if (value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function refreshAdminPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
}

function validateProductPayload(payload: {
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  price: number | null;
  compareAtPrice: number | null;
  taxRate: number | null;
  taxAmount: number | null;
  finalPrice: number | null;
  stockQuantity: number;
}) {
  if (!payload.name) return "Name wajib diisi.";
  if (!payload.slug) return "Slug wajib diisi.";
  if (!isValidSlug(payload.slug)) return "Slug harus lowercase, memakai tanda minus, dan tanpa spasi.";
  if (!payload.brandId) return "Brand wajib dipilih.";
  if (!payload.categoryId) return "Category wajib dipilih.";
  if (payload.price !== null && Number.isNaN(payload.price)) return "Price harus numeric.";
  if (payload.compareAtPrice !== null && Number.isNaN(payload.compareAtPrice)) return "Compare at price harus numeric.";
  if (payload.taxRate !== null && Number.isNaN(payload.taxRate)) return "Tax rate harus numeric.";
  if (payload.taxAmount !== null && Number.isNaN(payload.taxAmount)) return "Tax amount harus numeric.";
  if (payload.finalPrice !== null && Number.isNaN(payload.finalPrice)) return "Final price harus numeric.";
  if (!Number.isInteger(payload.stockQuantity)) return "Stock quantity harus integer.";
  return null;
}

function mapInput(formData: FormData, mode: "create" | "edit") {
  const name = asRequiredText(formData.get("name"));
  const rawSlug = asNullableText(formData.get("slug"));
  const slug = rawSlug ? slugify(rawSlug) : mode === "create" ? slugify(name) : "";
  const brandId = asRequiredText(formData.get("brand_id"));
  const categoryId = asRequiredText(formData.get("category_id"));
  const taxonomyId = asNullableText(formData.get("taxonomy_id"));
  const price = parseNumberOrNull(formData.get("price"));
  const compareAtPrice = parseNumberOrNull(formData.get("compare_at_price"));
  const stockQuantity = parseInteger(formData.get("stock_quantity"), 0);
  const taxRate = parseNumberOrNull(formData.get("tax_rate"));
  const taxAmount = parseNumberOrNull(formData.get("tax_amount"));
  const finalPrice = parseNumberOrNull(formData.get("final_price"));
  const imageUrl = asNullableText(formData.get("image_url"));

  const productPayload: ProductInsert = {
    sku: asNullableText(formData.get("sku")),
    name,
    slug,
    brand_id: brandId,
    category_id: categoryId,
    taxonomy_id: taxonomyId,
    short_description: asNullableText(formData.get("short_description")),
    description: asNullableText(formData.get("description")),
    price,
    compare_at_price: compareAtPrice,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    final_price: finalPrice,
    is_tax_included: formData.get("is_tax_included") === "on",
    currency: asNullableText(formData.get("currency")) ?? "IDR",
    stock_quantity: stockQuantity,
    is_featured: formData.get("is_featured") === "on",
    is_best_seller: formData.get("is_best_seller") === "on",
    is_promo: formData.get("is_promo") === "on",
    is_active: formData.get("is_active") === "on",
    badge: asNullableText(formData.get("badge")),
    seo_title: asNullableText(formData.get("seo_title")),
    seo_description: asNullableText(formData.get("seo_description")),
    seo_keywords: asNullableText(formData.get("seo_keywords")),
    og_title: asNullableText(formData.get("og_title")),
    og_description: asNullableText(formData.get("og_description")),
    og_image_url: asNullableText(formData.get("og_image_url")),
    canonical_url: asNullableText(formData.get("canonical_url")),
    sort_order: parseInteger(formData.get("sort_order"), 0),
  };

  return {
    productPayload,
    image_url: imageUrl,
    validate: {
      name,
      slug,
      brandId,
      categoryId,
      price,
      compareAtPrice,
      taxRate,
      taxAmount,
      finalPrice,
      stockQuantity,
    },
  };
}

export async function createProductAction(formData: FormData) {
  const mapped = mapInput(formData, "create");
  const validationError = validateProductPayload(mapped.validate);
  if (validationError) return { ok: false, error: validationError };

  try {
    const supabase = await createClient();
    const payload: ProductInsert = mapped.productPayload;
    const imageUrl = mapped.image_url;

    const { data, error } = await supabase.from("products").insert(payload).select("id").single();

    if (error) {
      console.warn("[admin] create product failed:", error.message);
      return { ok: false, error: error.message };
    }

    if (imageUrl && data?.id) {
      const { error: imageError } = await supabase.from("product_images").insert({
        product_id: data.id,
        image_url: imageUrl,
        is_primary: true,
        sort_order: 0,
      });

      if (imageError) {
        console.warn("[admin] create product image failed:", imageError.message);
      }
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal membuat product." };
  }
}

export async function updateProductAction(formData: FormData) {
  const id = asNullableText(formData.get("id"));
  if (!id) return { ok: false, error: "Product ID tidak valid." };

  const mapped = mapInput(formData, "edit");
  const validationError = validateProductPayload(mapped.validate);
  if (validationError) return { ok: false, error: validationError };

  try {
    const supabase = await createClient();
    const payload: ProductUpdate = mapped.productPayload;
    const imageUrl = mapped.image_url;
    const { error } = await supabase.from("products").update(payload).eq("id", id);

    if (error) {
      console.warn("[admin] update product failed:", error.message);
      return { ok: false, error: error.message };
    }

    if (imageUrl) {
      const { data: existingImage, error: existingError } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", id)
        .eq("is_primary", true)
        .maybeSingle();

      if (existingError) {
        console.warn("[admin] read product primary image failed:", existingError.message);
      } else if (existingImage?.id) {
        const { error: updateImageError } = await supabase
          .from("product_images")
          .update({ image_url: imageUrl })
          .eq("id", existingImage.id);

        if (updateImageError) {
          console.warn("[admin] update product image failed:", updateImageError.message);
        }
      } else {
        const { error: insertImageError } = await supabase.from("product_images").insert({
          product_id: id,
          image_url: imageUrl,
          is_primary: true,
          sort_order: 0,
        });

        if (insertImageError) {
          console.warn("[admin] insert product image failed:", insertImageError.message);
        }
      }
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengubah product." };
  }
}

export async function deleteProductAction(formData: FormData) {
  const id = asNullableText(formData.get("id"));
  if (!id) return { ok: false, error: "Product ID tidak valid." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      console.warn("[admin] delete product failed:", error.message);
      return { ok: false, error: error.message };
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menghapus product." };
  }
}

const toggleFields = ["is_active", "is_featured", "is_best_seller", "is_promo"] as const;

export async function toggleProductFlagAction(formData: FormData) {
  const id = asNullableText(formData.get("id"));
  const field = asNullableText(formData.get("field"));
  const nextValue = formData.get("next_value") === "true";

  if (!id) return { ok: false, error: "Product ID tidak valid." };
  if (!field || !toggleFields.includes(field as (typeof toggleFields)[number])) {
    return { ok: false, error: "Field toggle tidak valid." };
  }

  try {
    const supabase = await createClient();
    const flagPayload: ProductUpdate = { [field]: nextValue };
    const { error } = await supabase.from("products").update(flagPayload).eq("id", id);

    if (error) {
      console.warn("[admin] toggle product flag failed:", error.message);
      return { ok: false, error: error.message };
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengubah status product." };
  }
}
