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
      .select("id,title,subtitle,description,image_url,cta_label,cta_href,placement,badge,price_text,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,canonical_url,sort_order,is_active")
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
      subtitle="Kelola konten banner untuk hero slider, benefit image, promo tengah, dan CTA bawah."
      dataUnavailable={dataUnavailable}
    >
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[#33414e]">Create Banner</h3>
          <button type="submit" form="create-banner-form" className="rounded-xl bg-[#e7000b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c9000a]">Create Banner</button>
        </div>
        <BannerForm mode="create" formId="create-banner-form" showSubmit={false} />
      </section>

      <BannerTable banners={banners} dataUnavailable={dataUnavailable} />
    </AdminDashboardShell>
  );
}
