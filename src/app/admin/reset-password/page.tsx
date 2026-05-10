"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { AdminAuthShell } from "@/components/admin/AdminAuthShell";
import { updateAdminPassword } from "@/lib/supabase/auth-client";

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <AdminAuthShell title="Reset Password" subtitle="Admin Dashboard PT Cipta Solusi Techindo">
      <p className="text-sm text-slate-500">Masukkan password baru minimal 8 karakter.</p>

      {error ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p> : null}

      <form
          className="mt-4 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            setSuccess(null);

            const formData = new FormData(event.currentTarget);
            const password = String(formData.get("password") ?? "");
            const confirmPassword = String(formData.get("confirm_password") ?? "");

            if (password.length < 8) {
              setError("Password minimal 8 karakter.");
              return;
            }

            if (password !== confirmPassword) {
              setError("Password dan konfirmasi tidak sama.");
              return;
            }

            startTransition(async () => {
              const { error: updateError } = await updateAdminPassword(password);
              if (updateError) {
                setError(updateError.message);
                return;
              }

              setSuccess("Password berhasil diperbarui. Mengarahkan ke login...");
              setTimeout(() => {
                router.replace("/admin/login");
              }, 1200);
            });
          }}
        >
          <label className="text-sm">
            <span className="mb-1 block font-medium">New Password</span>
            <input name="password" type="password" required minLength={8} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Confirm Password</span>
            <input name="confirm_password" type="password" required minLength={8} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          <button type="submit" disabled={pending} className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            {pending ? "Updating..." : "Update Password"}
          </button>
      </form>

      <Link href="/admin/login" className="mt-3 inline-block text-sm font-medium text-blue-700 hover:text-blue-800">
        Back to Login
      </Link>
    </AdminAuthShell>
  );
}
