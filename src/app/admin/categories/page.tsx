import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { createClient } from "@/lib/supabase/server";

async function getCategories() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: [], dataUnavailable: true };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("categories").select("id,name,slug,description,sort_order,is_active").order("sort_order", { ascending: true });

    if (error) {
      console.warn("[admin] categories read failed:", error.message);
      return { data: [], dataUnavailable: true };
    }

    return { data: data ?? [], dataUnavailable: false };
  } catch {
    console.warn("[admin] unexpected error reading categories");
    return { data: [], dataUnavailable: true };
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
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Create Category</h3>
        <CategoryForm mode="create" />
      </section>

      <CategoryTable categories={categories} dataUnavailable={dataUnavailable} />
    </AdminDashboardShell>
  );
}
