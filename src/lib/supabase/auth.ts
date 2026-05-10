import { createClient as createServerClient } from "@/lib/supabase/server";

export function isSupabaseAuthReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getAuthenticatedAdmin() {
  if (!isSupabaseAuthReady()) {
    return { user: null, admin: null, error: "Supabase env belum tersedia." };
  }

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { user: null, admin: null, error: userError?.message ?? "User belum login." };
    }

    let admin = null;
    let adminError = null;

    const byUserId = await supabase
      .from("admin_users")
      .select("id,email,role,is_active,user_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    admin = byUserId.data;
    adminError = byUserId.error;

    if (!admin && !adminError && user.email) {
      const byEmail = await supabase
        .from("admin_users")
        .select("id,email,role,is_active,user_id")
        .ilike("email", user.email)
        .eq("is_active", true)
        .maybeSingle();

      admin = byEmail.data;
      adminError = byEmail.error;
    }

    if (adminError || !admin) {
      if (adminError) {
        console.warn("[auth] admin validation query failed:", {
          message: adminError.message,
          code: adminError.code,
          hint: adminError.hint,
          details: adminError.details,
        });
      }
      return { user, admin: null, error: adminError?.message ?? "Akses admin ditolak." };
    }

    return { user, admin, error: null };
  } catch {
    return { user: null, admin: null, error: "Gagal memvalidasi akses admin." };
  }
}
