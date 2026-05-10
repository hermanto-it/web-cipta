"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

const allowedStatuses = ["new", "contacted", "closed"] as const;

function asText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export async function updateInquiryStatusAction(formData: FormData) {
  const id = asText(formData.get("id"));
  const nextStatus = asText(formData.get("next_status"));

  if (!id) return { ok: false, error: "Inquiry ID tidak valid." };
  if (!allowedStatuses.includes(nextStatus as (typeof allowedStatuses)[number])) {
    return { ok: false, error: "Status inquiry tidak valid." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").update({ status: nextStatus }).eq("id", id);

    if (error) {
      console.warn("[admin] update inquiry status failed:", error.message);
      return { ok: false, error: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/admin/inquiries");
    return { ok: true };
  } catch {
    return { ok: false, error: "Gagal mengubah status inquiry." };
  }
}
