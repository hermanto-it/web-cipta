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
      className="h-10 rounded-xl border border-[#e7000b] bg-[#e7000b] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#c9000a] disabled:opacity-60"
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
