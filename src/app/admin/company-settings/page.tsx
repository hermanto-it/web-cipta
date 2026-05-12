import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { updateCompanySettingsAction } from "@/app/admin/company-settings/actions";
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
  const seo = settings.find((item) => item.key === "seo_settings")?.value ?? {};

  return (
    <AdminDashboardShell
      currentPath="/admin/company-settings"
      title="Company Settings"
      subtitle="Kelola informasi perusahaan, kontak, dan konfigurasi tampilan website."
      dataUnavailable={dataUnavailable}
    >
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Company Profile</h3>
          <button type="submit" form="company-settings-form" className="rounded-xl bg-[#e7000b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#c9000a]">Save Changes</button>
        </div>

        <form id="company-settings-form" action={updateCompanySettingsAction} className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Company Name</span>
            <input name="company_name" defaultValue={asText(profile.name)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Tagline</span>
            <input name="company_tagline" defaultValue={asText(profile.tagline)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Company Description</span>
            <textarea name="company_description" rows={3} defaultValue={asText(profile.description)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Email</span>
            <input name="contact_email" defaultValue={asText(contact.email)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Phone</span>
            <input name="contact_phone" defaultValue={asText(contact.phone)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Address</span>
            <textarea name="contact_address" rows={3} defaultValue={asText(contact.address)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">Footer Copyright</span>
            <input name="footer_copyright" defaultValue={asText(footer.copyright_text)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>

          <h4 className="mt-1 text-sm font-semibold text-slate-900 sm:col-span-2">SEO Settings</h4>
          <label className="text-sm">
            <span className="mb-1 block font-medium">SEO Title</span>
            <input name="seo_title" defaultValue={asText(seo.seo_title)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Canonical URL</span>
            <input name="canonical_url" defaultValue={asText(seo.canonical_url)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">SEO Description</span>
            <textarea name="seo_description" rows={2} defaultValue={asText(seo.seo_description)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">SEO Keywords</span>
            <input name="seo_keywords" defaultValue={asText(seo.seo_keywords)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">OG Title</span>
            <input name="og_title" defaultValue={asText(seo.og_title)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">OG Image URL</span>
            <input name="og_image_url" defaultValue={asText(seo.og_image_url)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block font-medium">OG Description</span>
            <textarea name="og_description" rows={2} defaultValue={asText(seo.og_description)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700" />
          </label>
        </form>
      </section>
    </AdminDashboardShell>
  );
}
