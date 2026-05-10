import { BannerForm } from "@/components/admin/homepage-banners/BannerForm";
import type { BannerItem } from "@/components/admin/homepage-banners/BannerForm";
import { BannerTable } from "@/components/admin/homepage-banners/BannerTable";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { createClient } from "@/lib/supabase/server";

async function getHomepageBanners() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: [] as BannerItem[], dataUnavailable: true };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("homepage_banners")
      .select("id,title,subtitle,description,image_url,cta_label,cta_href,placement,badge,price_text,sort_order,is_active")
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("[admin] homepage banners read failed:", error.message);
      return { data: [] as BannerItem[], dataUnavailable: true };
    }

    return { data: (data ?? []) as BannerItem[], dataUnavailable: false };
  } catch {
    console.warn("[admin] unexpected error reading homepage banners");
    return { data: [] as BannerItem[], dataUnavailable: true };
  }
}

export default async function AdminHomepageBannersPage() {
  const { data: banners, dataUnavailable } = await getHomepageBanners();

  return (
    <AdminDashboardShell
      currentPath="/admin/homepage-banners"
      title="Homepage Banners"
      subtitle="Kelola konten banner untuk hero, promo samping, promo tengah, dan CTA bawah."
      dataUnavailable={dataUnavailable}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Create Banner</h3>
        <BannerForm mode="create" />
      </section>

      <BannerTable banners={banners} dataUnavailable={dataUnavailable} />
    </AdminDashboardShell>
  );
}
