import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { createClient } from "@/lib/supabase/server";

type CompanySetting = {
  key: string;
  value: Record<string, unknown>;
};

function asText(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

async function getCompanySettings() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: [], dataUnavailable: true };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("company_settings").select("key,value");

    if (error) {
      console.warn("[admin] company settings read failed:", error.message);
      return { data: [], dataUnavailable: true };
    }

    return { data: (data ?? []) as CompanySetting[], dataUnavailable: false };
  } catch {
    console.warn("[admin] unexpected error reading company settings");
    return { data: [], dataUnavailable: true };
  }
}

export default async function AdminCompanySettingsPage() {
  const { data: settings, dataUnavailable } = await getCompanySettings();
  const profile = settings.find((item) => item.key === "company_profile")?.value ?? {};
  const contact = settings.find((item) => item.key === "contact_info")?.value ?? {};
  const footer = settings.find((item) => item.key === "footer_settings")?.value ?? {};

  return (
    <AdminDashboardShell
      currentPath="/admin/company-settings"
      title="Company Settings"
      subtitle="Kelola informasi perusahaan, kontak, dan konfigurasi tampilan website."
      dataUnavailable={dataUnavailable}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Company Profile</h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Read-only</span>
        </div>

        <form className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Company Name</span>
            <input readOnly value={asText(profile.name)} className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Tagline</span>
            <input readOnly value={asText(profile.tagline)} className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input readOnly value={asText(contact.email)} className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Phone</span>
            <input readOnly value={asText(contact.phone)} className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Address</span>
            <textarea readOnly rows={3} value={asText(contact.address)} className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Footer Copyright</span>
            <input readOnly value={asText(footer.copyright_text)} className="h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700" />
          </label>
        </form>

        <p className="mt-3 text-xs text-slate-500">TODO: Tambahkan action update aman untuk `company_settings` setelah policy write admin siap.</p>
      </section>
    </AdminDashboardShell>
  );
}
