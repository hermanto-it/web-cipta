import { BrandForm } from "@/components/admin/brands/BrandForm";
import type { BrandItem } from "@/components/admin/brands/BrandForm";
import { BrandTable } from "@/components/admin/brands/BrandTable";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { createClient } from "@/lib/supabase/server";

async function getBrands() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: [] as BrandItem[], dataUnavailable: true };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("brands")
      .select("id,name,slug,description,logo_url,sort_order,is_active")
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("[admin] brands read failed:", error.message);
      return { data: [] as BrandItem[], dataUnavailable: true };
    }

    return { data: (data ?? []) as BrandItem[], dataUnavailable: false };
  } catch {
    console.warn("[admin] unexpected error reading brands");
    return { data: [] as BrandItem[], dataUnavailable: true };
  }
}

export default async function AdminBrandsPage() {
  const { data: brands, dataUnavailable } = await getBrands();

  return (
    <AdminDashboardShell
      currentPath="/admin/brands"
      title="Brands"
      subtitle="Kelola data brand ecommerce untuk katalog produk dan taxonomy."
      dataUnavailable={dataUnavailable}
    >
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[#33414e]">Create Brand</h3>
          <button type="submit" form="create-brand-form" className="rounded-xl bg-[#e7000b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c9000a]">Create Brand</button>
        </div>
        <BrandForm mode="create" formId="create-brand-form" showSubmit={false} />
      </section>

      <BrandTable brands={brands} dataUnavailable={dataUnavailable} />
    </AdminDashboardShell>
  );
}
