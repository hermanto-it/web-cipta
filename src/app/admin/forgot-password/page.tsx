"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { requestAdminPasswordReset } from "@/lib/supabase/auth";

export default function AdminForgotPasswordPage() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
        <p className="mt-1 text-sm text-slate-500">Masukkan email admin untuk mengirim link reset password.</p>

        {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}

        <form
          className="mt-4 grid gap-3"
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

          <button type="submit" disabled={pending} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            {pending ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <Link href="/admin/login" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:text-blue-800">
          Back to Login
        </Link>
      </div>
    </div>
  );
}
