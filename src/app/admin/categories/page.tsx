import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import type { CategoryItem } from "@/components/admin/categories/CategoryForm";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { createClient } from "@/lib/supabase/server";

async function getCategories() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: [] as CategoryItem[], dataUnavailable: true };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("id,name,slug,description,sort_order,is_active").order("sort_order", { ascending: true });

    if (error) {
      console.warn("[admin] categories read failed:", error.message);
      return { data: [] as CategoryItem[], dataUnavailable: true };
    }

    return { data: (data ?? []) as CategoryItem[], dataUnavailable: false };
  } catch {
    console.warn("[admin] unexpected error reading categories");
    return { data: [] as CategoryItem[], dataUnavailable: true };
  }
}

export default async function AdminCategoriesPage() {
  const { data: categories, dataUnavailable } = await getCategories();

  return (
    <AdminDashboardShell
      currentPath="/admin/categories"
      title="Categories"
      subtitle="Kelola kategori produk untuk integrasi taxonomy dan form products."
      dataUnavailable={dataUnavailable}
    >
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[#33414e]">Create Category</h3>
          <button type="submit" form="create-category-form" className="rounded-xl bg-[#e7000b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c9000a]">Create Category</button>
        </div>
        <CategoryForm mode="create" formId="create-category-form" showSubmit={false} />
      </section>

      <CategoryTable categories={categories} dataUnavailable={dataUnavailable} />
    </AdminDashboardShell>
  );
}
