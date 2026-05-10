import { createClient as createBrowserClient } from "@/lib/supabase/client";

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
