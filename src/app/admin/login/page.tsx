"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { signOutAdminClient, signInAdminWithPassword } from "@/lib/supabase/auth-client";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [socialInfo, setSocialInfo] = useState<string | null>(null);

  const initialError = searchParams.get("error");

  return (
    <AdminAuthShell title="Log In" subtitle="Admin Dashboard PT Cipta Solusi Techindo">
      {initialError === "access_denied" ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Akses admin ditolak. Akun tidak terdaftar atau tidak aktif.</p> : null}
      {initialError === "env_missing" ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">Supabase env belum tersedia.</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <form
          className="mt-4 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            setSocialInfo(null);

            const formData = new FormData(event.currentTarget);
            const email = String(formData.get("email") ?? "").trim();
            const password = String(formData.get("password") ?? "");

            startTransition(async () => {
              const { error: loginError } = await signInAdminWithPassword(email, password);
              if (loginError) {
                setError(loginError.message);
                return;
              }

              const supabase = createClient();
              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (!user) {
                setError("Gagal memuat data user.");
                return;
              }

              let admin = null;
              let adminError = null;

              const byUserId = await supabase
                .from("admin_users")
                .select("id,is_active")
                .eq("user_id", user.id)
                .eq("is_active", true)
                .maybeSingle();

              admin = byUserId.data;
              adminError = byUserId.error;

              if (!admin && !adminError && user.email) {
                const byEmail = await supabase
                  .from("admin_users")
                  .select("id,is_active")
                  .ilike("email", user.email)
                  .eq("is_active", true)
                  .maybeSingle();

                admin = byEmail.data;
                adminError = byEmail.error;
              }

              if (adminError || !admin) {
                if (adminError) {
                  console.warn("[admin-login] admin_users check failed:", {
                    message: adminError.message,
                    code: adminError.code,
                    hint: adminError.hint,
                    details: adminError.details,
                  });
                }
                await signOutAdminClient();
                setError("Akses admin ditolak. Akun tidak terdaftar atau tidak aktif.");
                return;
              }

              router.replace("/admin");
              router.refresh();
            });
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block font-medium">Phone number *</span>
            <input
              name="email"
              type="email"
              required
              placeholder="Your email"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 transition hover:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Password *</span>
            <input
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 transition hover:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </label>

          <div className="-mt-1 text-right">
            <Link href="/admin/forgot-password" className="text-sm font-medium text-slate-700 hover:text-red-600">
              Forgot password ?
            </Link>
          </div>

          <button type="submit" disabled={pending} className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
            {pending ? "Signing in..." : "Login"}
          </button>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t you have an account?{" "}
            <a href="#" title="Contact administrator" className="font-medium text-blue-700 hover:text-red-600">
              Register
            </a>
          </p>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-500">Or login with</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSocialInfo("Social login belum diaktifkan untuk admin.")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-red-500 hover:text-red-600"
            >
              <span className="text-base font-bold">f</span>
              <span>Facebook</span>
            </button>
            <button
              type="button"
              onClick={() => setSocialInfo("Social login belum diaktifkan untuk admin.")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-red-500 hover:text-red-600"
            >
              <span className="text-base font-bold">G</span>
              <span>Google</span>
            </button>
          </div>

          {socialInfo ? <p className="text-center text-xs text-slate-500">{socialInfo}</p> : null}
      </form>
    </AdminAuthShell>
  );
}
