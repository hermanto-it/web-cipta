"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function asText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function asNullableText(value: FormDataEntryValue | null) {
  const text = asText(value);
  return text.length > 0 ? text : null;
}

function asSort(value: FormDataEntryValue | null) {
  const text = asText(value);
  const num = Number.parseInt(text, 10);
  return Number.isFinite(num) ? num : 0;
}

function refresh() {
  revalidatePath("/admin");
  revalidatePath("/admin/product-images");
  revalidatePath("/admin/products");
}

export async function createProductImageAction(formData: FormData) {
  const productId = asText(formData.get("product_id"));
  const imageUrl = asText(formData.get("image_url"));

  if (!productId || !imageUrl) {
    return { ok: false, error: "Product dan image wajib diisi." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("product_images").insert({
      product_id: productId,
      image_url: imageUrl,
      alt_text: asNullableText(formData.get("alt_text")),
      sort_order: asSort(formData.get("sort_order")),
      is_primary: formData.get("is_primary") === "on",
    });

    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menambah product image." };
  }
}

export async function updateProductImageAction(formData: FormData) {
  const id = asText(formData.get("id"));
  if (!id) return { ok: false, error: "Image ID tidak valid." };

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("product_images")
      .update({
        image_url: asText(formData.get("image_url")),
        alt_text: asNullableText(formData.get("alt_text")),
        sort_order: asSort(formData.get("sort_order")),
        is_primary: formData.get("is_primary") === "on",
      })
      .eq("id", id);

    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengubah product image." };
  }
}

export async function deleteProductImageAction(formData: FormData) {
  const id = asText(formData.get("id"));
  if (!id) return { ok: false, error: "Image ID tidak valid." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("product_images").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    refresh();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menghapus product image." };
  }
}
