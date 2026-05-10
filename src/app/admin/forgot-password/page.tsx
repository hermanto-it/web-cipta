"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { requestAdminPasswordReset } from "@/lib/supabase/auth-client";

export default function AdminForgotPasswordPage() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <AdminAuthShell title="Forgot Password" subtitle="Admin Dashboard PT Cipta Solusi Techindo">
      <p className="text-sm text-slate-500">Masukkan email admin untuk menerima link reset password.</p>

      {message ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <form
        className="mt-4 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          setMessage(null);
          const formData = new FormData(event.currentTarget);
          const email = String(formData.get("email") ?? "").trim();

          startTransition(async () => {
            const { error: resetError } = await requestAdminPasswordReset(email, window.location.origin);
            if (resetError) {
              setError("Gagal mengirim link reset password. Coba lagi.");
              return;
            }
            setMessage("Jika email terdaftar, link reset password akan dikirim.");
          });
        }}
      >
        <label className="text-sm">
          <span className="mb-1 block font-medium">Email *</span>
          <input
            name="email"
            type="email"
            required
            placeholder="Your email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 transition hover:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </label>

        <button type="submit" disabled={pending} className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
          {pending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <Link href="/admin/login" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:text-red-600">
        Back to Login
      </Link>
    </AdminAuthShell>
  );
}
