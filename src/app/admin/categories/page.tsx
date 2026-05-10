import Link from "next/link";

import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Homepage Banners", href: "/admin/homepage-banners" },
  { label: "Brands", href: "/admin/brands" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Products", href: "#" },
  { label: "Product Images", href: "#" },
  { label: "Company Settings", href: "#" },
  { label: "Inquiries", href: "#" },
];

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
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-5 lg:flex-row">
        <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72 lg:shrink-0">
          <h1 className="text-lg font-bold">PT Cipta Solusi Techindo</h1>
          <p className="mt-1 text-xs text-slate-500">Admin Dashboard</p>
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  item.href === "/admin/categories" ? "bg-blue-700 font-semibold text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 space-y-4">
          <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-xl font-bold">Categories</h2>
            <p className="mt-1 text-sm text-slate-500">Kelola kategori produk untuk integrasi taxonomy dan form Products.</p>
            {dataUnavailable ? (
              <p className="mt-2 text-xs text-amber-600">
                Data unavailable. Kemungkinan env Supabase belum siap atau RLS belum mengizinkan operasi write/read anon.
              </p>
            ) : null}
          </header>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold">Create Category</h3>
            <CategoryForm mode="create" />
          </section>

          <CategoryTable categories={categories} dataUnavailable={dataUnavailable} />
        </main>
      </div>
    </div>
  );
}
