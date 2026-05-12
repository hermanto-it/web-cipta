"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const placements = [
  "hero",
  "side_promo",
  "middle_promo",
  "bottom_cta",
  "benefit_free_delivery",
  "benefit_support_247",
  "benefit_payment",
  "benefit_reliable",
  "benefit_guarantee",
] as const;

type Placement = (typeof placements)[number];

function asNullableText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePlacement(value: FormDataEntryValue | null): Placement | null {
  if (typeof value !== "string") return null;
  return placements.includes(value as Placement) ? (value as Placement) : null;
}

function parseSortOrder(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function refreshAdminPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/homepage-banners");
}

export async function createBannerAction(formData: FormData) {
  const title = asNullableText(formData.get("title"));
  const placement = parsePlacement(formData.get("placement"));

  if (!title) {
    return { ok: false, error: "Title wajib diisi." };
  }

  if (!placement) {
    return { ok: false, error: "Placement wajib dipilih." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("homepage_banners").insert({
      title,
      subtitle: asNullableText(formData.get("subtitle")),
      description: asNullableText(formData.get("description")),
      image_url: asNullableText(formData.get("image_url")),
      cta_label: asNullableText(formData.get("cta_label")),
      cta_href: asNullableText(formData.get("cta_href")),
      placement,
      badge: asNullableText(formData.get("badge")),
      price_text: asNullableText(formData.get("price_text")),
      seo_title: asNullableText(formData.get("seo_title")),
      seo_description: asNullableText(formData.get("seo_description")),
      seo_keywords: asNullableText(formData.get("seo_keywords")),
      og_title: asNullableText(formData.get("og_title")),
      og_description: asNullableText(formData.get("og_description")),
      og_image_url: asNullableText(formData.get("og_image_url")),
      canonical_url: asNullableText(formData.get("canonical_url")),
      sort_order: parseSortOrder(formData.get("sort_order")),
      is_active: formData.get("is_active") === "on",
    });

    if (error) {
      console.warn("[admin] create banner failed:", error.message);
      return { ok: false, error: error.message };
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal membuat banner." };
  }
}

export async function updateBannerAction(formData: FormData) {
  const id = asNullableText(formData.get("id"));
  const title = asNullableText(formData.get("title"));
  const placement = parsePlacement(formData.get("placement"));

  if (!id) {
    return { ok: false, error: "Banner ID tidak valid." };
  }

  if (!title) {
    return { ok: false, error: "Title wajib diisi." };
  }

  if (!placement) {
    return { ok: false, error: "Placement wajib dipilih." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("homepage_banners")
      .update({
        title,
        subtitle: asNullableText(formData.get("subtitle")),
        description: asNullableText(formData.get("description")),
        image_url: asNullableText(formData.get("image_url")),
        cta_label: asNullableText(formData.get("cta_label")),
        cta_href: asNullableText(formData.get("cta_href")),
        placement,
        badge: asNullableText(formData.get("badge")),
        price_text: asNullableText(formData.get("price_text")),
        seo_title: asNullableText(formData.get("seo_title")),
        seo_description: asNullableText(formData.get("seo_description")),
        seo_keywords: asNullableText(formData.get("seo_keywords")),
        og_title: asNullableText(formData.get("og_title")),
        og_description: asNullableText(formData.get("og_description")),
        og_image_url: asNullableText(formData.get("og_image_url")),
        canonical_url: asNullableText(formData.get("canonical_url")),
        sort_order: parseSortOrder(formData.get("sort_order")),
        is_active: formData.get("is_active") === "on",
      })
      .eq("id", id);

    if (error) {
      console.warn("[admin] update banner failed:", error.message);
      return { ok: false, error: error.message };
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengubah banner." };
  }
}

export async function deleteBannerAction(formData: FormData) {
  const id = asNullableText(formData.get("id"));

  if (!id) {
    return { ok: false, error: "Banner ID tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("homepage_banners").delete().eq("id", id);

    if (error) {
      console.warn("[admin] delete banner failed:", error.message);
      return { ok: false, error: error.message };
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menghapus banner." };
  }
}

export async function toggleBannerActiveAction(formData: FormData) {
  const id = asNullableText(formData.get("id"));
  const nextActive = formData.get("next_active") === "true";

  if (!id) {
    return { ok: false, error: "Banner ID tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("homepage_banners").update({ is_active: nextActive }).eq("id", id);

    if (error) {
      console.warn("[admin] toggle banner failed:", error.message);
      return { ok: false, error: error.message };
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengubah status banner." };
  }
}
