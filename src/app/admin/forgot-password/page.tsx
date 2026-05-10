"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { requestAdminPasswordReset } from "@/lib/supabase/auth-client";

export default function AdminForgotPasswordPage() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <AdminAuthShell title="Forgot Password" subtitle="Admin Dashboard PT Cipta Solusi Techindo">
      <p className="text-sm text-slate-500">Masukkan email admin untuk mengirim link reset password.</p>

      {message ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

      <form
          className="mt-4 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const email = String(formData.get("email") ?? "").trim();

            startTransition(async () => {
              await requestAdminPasswordReset(email, window.location.origin);
              setMessage("Jika email terdaftar, link reset password akan dikirim.");
            });
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input name="email" type="email" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          <button type="submit" disabled={pending} className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            {pending ? "Sending..." : "Send Reset Link"}
          </button>
      </form>

      <Link href="/admin/login" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:text-blue-800">
        Back to Login
      </Link>
    </AdminAuthShell>
  );
}
