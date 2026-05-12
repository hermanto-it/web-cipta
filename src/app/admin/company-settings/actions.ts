"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function asText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

async function upsertSetting(key: string, value: Record<string, unknown>) {
  const supabase = await createClient();
  return supabase.from("company_settings").upsert({ key, value }, { onConflict: "key" });
}

export async function updateCompanySettingsAction(formData: FormData) {
  try {
    const profile = {
      name: asText(formData.get("company_name")),
      tagline: asText(formData.get("company_tagline")),
      description: asText(formData.get("company_description")),
    };
    const contact = {
      email: asText(formData.get("contact_email")),
      phone: asText(formData.get("contact_phone")),
      address: asText(formData.get("contact_address")),
    };
    const footer = {
      copyright_text: asText(formData.get("footer_copyright")),
    };
    const seo = {
      seo_title: asText(formData.get("seo_title")),
      seo_description: asText(formData.get("seo_description")),
      seo_keywords: asText(formData.get("seo_keywords")),
      og_title: asText(formData.get("og_title")),
      og_description: asText(formData.get("og_description")),
      og_image_url: asText(formData.get("og_image_url")),
      canonical_url: asText(formData.get("canonical_url")),
    };

    const [profileRes, contactRes, footerRes, seoRes] = await Promise.all([
      upsertSetting("company_profile", profile),
      upsertSetting("contact_info", contact),
      upsertSetting("footer_settings", footer),
      upsertSetting("seo_settings", seo),
    ]);

    const firstError = profileRes.error ?? contactRes.error ?? footerRes.error ?? seoRes.error;
    if (firstError) {
      console.warn("[admin] update company settings failed:", firstError.message);
      return { ok: false, error: firstError.message };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/company-settings");
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengubah company settings." };
  }
}
