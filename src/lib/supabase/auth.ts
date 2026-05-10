import { createClient as createBrowserClient } from "@/lib/supabase/client";
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

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("id,email,role,is_active,user_id")
      .or(`user_id.eq.${user.id},email.eq.${user.email ?? ""}`)
      .eq("is_active", true)
      .maybeSingle();

    if (adminError || !admin) {
      return { user, admin: null, error: adminError?.message ?? "Akses admin ditolak." };
    }

    return { user, admin, error: null };
  } catch {
    return { user: null, admin: null, error: "Gagal memvalidasi akses admin." };
  }
}

export async function signInAdminWithPassword(email: string, password: string) {
  const supabase = createBrowserClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOutAdminClient() {
  const supabase = createBrowserClient();
  return supabase.auth.signOut();
}

export async function requestAdminPasswordReset(email: string, origin: string) {
  const supabase = createBrowserClient();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/admin/reset-password`,
  });
}

export async function updateAdminPassword(password: string) {
  const supabase = createBrowserClient();
  return supabase.auth.updateUser({ password });
}
