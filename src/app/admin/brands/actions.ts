"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { isValidSlug, slugify } from "@/lib/utils/slugify";

function asNullableText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseSortOrder(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function refreshAdminPages() {
  revalidatePath("/admin");
  revalidatePath("/admin/brands");
}

export async function createBrandAction(formData: FormData) {
  const name = asNullableText(formData.get("name"));
  const rawSlug = asNullableText(formData.get("slug"));
  const slug = rawSlug ? slugify(rawSlug) : slugify(name ?? "");

  if (!name) {
    return { ok: false, error: "Name wajib diisi." };
  }

  if (!slug) {
    return { ok: false, error: "Slug wajib diisi atau name harus valid untuk generate slug." };
  }

  if (!isValidSlug(slug)) {
    return { ok: false, error: "Slug harus lowercase, memakai tanda minus, dan tanpa spasi." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("brands").insert({
      name,
      slug,
      description: asNullableText(formData.get("description")),
      logo_url: asNullableText(formData.get("logo_url")),
      sort_order: parseSortOrder(formData.get("sort_order")),
      is_active: formData.get("is_active") === "on",
    });

    if (error) {
      console.warn("[admin] create brand failed:", error.message);
      return { ok: false, error: error.message };
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal membuat brand." };
  }
}

export async function updateBrandAction(formData: FormData) {
  const id = asNullableText(formData.get("id"));
  const name = asNullableText(formData.get("name"));
  const rawSlug = asNullableText(formData.get("slug"));
  const slug = rawSlug ? slugify(rawSlug) : "";

  if (!id) {
    return { ok: false, error: "Brand ID tidak valid." };
  }

  if (!name) {
    return { ok: false, error: "Name wajib diisi." };
  }

  if (!slug) {
    return { ok: false, error: "Slug wajib diisi." };
  }

  if (!isValidSlug(slug)) {
    return { ok: false, error: "Slug harus lowercase, memakai tanda minus, dan tanpa spasi." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("brands")
      .update({
        name,
        slug,
        description: asNullableText(formData.get("description")),
        logo_url: asNullableText(formData.get("logo_url")),
        sort_order: parseSortOrder(formData.get("sort_order")),
        is_active: formData.get("is_active") === "on",
      })
      .eq("id", id);

    if (error) {
      console.warn("[admin] update brand failed:", error.message);
      return { ok: false, error: error.message };
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengubah brand." };
  }
}

export async function deleteBrandAction(formData: FormData) {
  const id = asNullableText(formData.get("id"));

  if (!id) {
    return { ok: false, error: "Brand ID tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("brands").delete().eq("id", id);

    if (error) {
      console.warn("[admin] delete brand failed:", error.message);
      return { ok: false, error: error.message };
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal menghapus brand." };
  }
}

export async function toggleBrandActiveAction(formData: FormData) {
  const id = asNullableText(formData.get("id"));
  const nextActive = formData.get("next_active") === "true";

  if (!id) {
    return { ok: false, error: "Brand ID tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("brands").update({ is_active: nextActive }).eq("id", id);

    if (error) {
      console.warn("[admin] toggle brand failed:", error.message);
      return { ok: false, error: error.message };
    }

    refreshAdminPages();
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengubah status brand." };
  }
}
