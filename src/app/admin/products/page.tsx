import Link from "next/link";

import { ProductForm } from "@/components/admin/products/ProductForm";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Homepage Banners", href: "/admin/homepage-banners" },
  { label: "Brands", href: "/admin/brands" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Products", href: "/admin/products" },
  { label: "Product Images", href: "#" },
  { label: "Company Settings", href: "#" },
  { label: "Inquiries", href: "#" },
];

async function getPageData() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      products: [],
      brands: [],
      categories: [],
      taxonomies: [],
      dataUnavailable: true,
    };
  }

  try {
    const supabase = await createClient();
    const [productsRes, brandsRes, categoriesRes, taxonomyRes] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id,brand_id,category_id,taxonomy_id,sku,name,slug,short_description,description,price,compare_at_price,currency,stock_quantity,is_featured,is_best_seller,is_promo,is_active,badge,sort_order,brand:brands(name),category:categories(name),taxonomy:product_taxonomy(name)",
        )
        .order("sort_order", { ascending: true }),
      supabase.from("brands").select("id,name").order("sort_order", { ascending: true }),
      supabase.from("categories").select("id,name").order("sort_order", { ascending: true }),
      supabase.from("product_taxonomy").select("id,name,brand_id,category_id").eq("is_active", true).order("sort_order", { ascending: true }),
    ]);

    if (productsRes.error || brandsRes.error || categoriesRes.error || taxonomyRes.error) {
      const message = productsRes.error?.message || brandsRes.error?.message || categoriesRes.error?.message || taxonomyRes.error?.message;
      console.warn("[admin] products page read failed:", message);
      return { products: [], brands: [], categories: [], taxonomies: [], dataUnavailable: true };
    }

    const products = (productsRes.data ?? []).map((item) => ({
      ...item,
      brand_name: (item.brand as { name?: string } | null)?.name ?? "Unknown Brand",
      category_name: (item.category as { name?: string } | null)?.name ?? "Unknown Category",
      taxonomy_name: (item.taxonomy as { name?: string } | null)?.name ?? null,
    }));

    return {
      products,
      brands: brandsRes.data ?? [],
      categories: categoriesRes.data ?? [],
      taxonomies: taxonomyRes.data ?? [],
      dataUnavailable: false,
    };
  } catch {
    console.warn("[admin] unexpected error reading products page data");
    return { products: [], brands: [], categories: [], taxonomies: [], dataUnavailable: true };
  }
}

export default async function AdminProductsPage() {
  const { products, brands, categories, taxonomies, dataUnavailable } = await getPageData();

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
                  item.href === "/admin/products" ? "bg-blue-700 font-semibold text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 space-y-4">
          <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <h2 className="text-xl font-bold">Products</h2>
            <p className="mt-1 text-sm text-slate-500">Kelola produk ecommerce lengkap dengan relasi brand, category, dan taxonomy.</p>
            {dataUnavailable ? (
              <p className="mt-2 text-xs text-amber-600">
                Data unavailable. Kemungkinan env Supabase belum siap atau RLS belum mengizinkan operasi write/read anon.
              </p>
            ) : null}
          </header>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold">Create Product</h3>
            <ProductForm mode="create" brands={brands} categories={categories} taxonomies={taxonomies} />
          </section>

          <ProductTable products={products} brands={brands} categories={categories} taxonomies={taxonomies} dataUnavailable={dataUnavailable} />
        </main>
      </div>
    </div>
  );
}
