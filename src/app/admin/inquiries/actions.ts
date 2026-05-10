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

  if (!id) return;
  if (!allowedStatuses.includes(nextStatus as (typeof allowedStatuses)[number])) {
    return;
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("inquiries").update({ status: nextStatus }).eq("id", id);

    if (error) {
      console.warn("[admin] update inquiry status failed:", error.message);
      return;
    }

    revalidatePath("/admin");
    revalidatePath("/admin/inquiries");
    return;
  } catch {
    return;
  }
}
