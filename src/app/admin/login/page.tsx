"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { signOutAdminClient, signInAdminWithPassword } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const initialError = searchParams.get("error");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-500">PT Cipta Solusi Techindo</p>

        {initialError === "access_denied" ? <p className="mt-3 text-sm text-red-600">Akses admin ditolak. Akun tidak terdaftar atau tidak aktif.</p> : null}
        {initialError === "env_missing" ? <p className="mt-3 text-sm text-amber-600">Supabase env belum tersedia.</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <form
          className="mt-4 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);

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

              const { data: admin, error: adminError } = await supabase
                .from("admin_users")
                .select("id,is_active")
                .or(`user_id.eq.${user.id},email.eq.${user.email ?? ""}`)
                .eq("is_active", true)
                .maybeSingle();

              if (adminError || !admin) {
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
            <span className="mb-1 block font-medium">Email</span>
            <input name="email" type="email" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Password</span>
            <input name="password" type="password" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          <button type="submit" disabled={pending} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            {pending ? "Signing in..." : "Login"}
          </button>
        </form>

        <Link href="/admin/forgot-password" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:text-blue-800">
          Forgot Password?
        </Link>
      </div>
    </div>
  );
}
