"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

function asText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function asNullableText(value: FormDataEntryValue | null) {
  const parsed = asText(value);
  return parsed.length > 0 ? parsed : null;
}

export async function submitInquiryAction(formData: FormData) {
  const name = asText(formData.get("name"));
  const company = asNullableText(formData.get("company"));
  const email = asNullableText(formData.get("email"));
  const phone = asNullableText(formData.get("phone"));
  const subject = asNullableText(formData.get("subject"));
  const message = asText(formData.get("message"));

  if (!name) return { ok: false, error: "Nama wajib diisi." };
  if (!message) return { ok: false, error: "Pesan wajib diisi." };
  if (!email && !phone) return { ok: false, error: "Isi minimal email atau nomor telepon." };
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Format email tidak valid." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").insert({
      name,
      company,
      email,
      phone,
      subject,
      message,
      source: "website",
      status: "new",
    });

    if (error) {
      console.warn("[inquiry] submit failed:", error.message);
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/inquiries");
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengirim inquiry." };
  }
}
