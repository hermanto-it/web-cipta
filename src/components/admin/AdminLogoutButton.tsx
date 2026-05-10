"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { signOutAdminClient } from "@/lib/supabase/auth-client";

export function AdminLogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await signOutAdminClient();
        setLoading(false);
        router.replace("/admin/login");
      }}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
