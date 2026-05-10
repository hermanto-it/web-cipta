import { ProductForm } from "@/components/admin/products/ProductForm";
import type { ProductItem, ProductOption, TaxonomyOption } from "@/components/admin/products/ProductForm";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { createClient } from "@/lib/supabase/server";

async function getPageData() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      products: [] as ProductItem[],
      brands: [] as ProductOption[],
      categories: [] as ProductOption[],
      taxonomies: [] as TaxonomyOption[],
      dataUnavailable: true,
    };
  }

  try {
    const supabase = await createClient();
    const [productsRes, brandsRes, categoriesRes, taxonomyRes] = await Promise.all([
      supabase
        .from("products")
        .select(
          "id,brand_id,category_id,taxonomy_id,sku,name,slug,short_description,description,price,compare_at_price,currency,stock_quantity,is_featured,is_best_seller,is_promo,is_active,badge,sort_order,brand:brands(name),category:categories(name),taxonomy:product_taxonomy(name),images:product_images(image_url,is_primary)",
        )
        .order("sort_order", { ascending: true }),
      supabase.from("brands").select("id,name").order("sort_order", { ascending: true }),
      supabase.from("categories").select("id,name").order("sort_order", { ascending: true }),
      supabase.from("product_taxonomy").select("id,name,brand_id,category_id").eq("is_active", true).order("sort_order", { ascending: true }),
    ]);

    if (productsRes.error || brandsRes.error || categoriesRes.error || taxonomyRes.error) {
      const message = productsRes.error?.message || brandsRes.error?.message || categoriesRes.error?.message || taxonomyRes.error?.message;
      console.warn("[admin] products page read failed:", message);
      return { products: [] as ProductItem[], brands: [] as ProductOption[], categories: [] as ProductOption[], taxonomies: [] as TaxonomyOption[], dataUnavailable: true };
    }

    const products = (productsRes.data ?? []).map((item) => ({
      ...item,
      brand_name: (item.brand as { name?: string } | null)?.name ?? "Unknown Brand",
      category_name: (item.category as { name?: string } | null)?.name ?? "Unknown Category",
      taxonomy_name: (item.taxonomy as { name?: string } | null)?.name ?? null,
      primary_image_url:
        ((item.images as unknown as Array<{ image_url?: string; is_primary?: boolean }> | null) ?? []).find((image) => image.is_primary)?.image_url ??
        null,
    }));

    return {
      products: products as ProductItem[],
      brands: (brandsRes.data ?? []) as ProductOption[],
      categories: (categoriesRes.data ?? []) as ProductOption[],
      taxonomies: (taxonomyRes.data ?? []) as TaxonomyOption[],
      dataUnavailable: false,
    };
  } catch {
    console.warn("[admin] unexpected error reading products page data");
    return { products: [] as ProductItem[], brands: [] as ProductOption[], categories: [] as ProductOption[], taxonomies: [] as TaxonomyOption[], dataUnavailable: true };
  }
}

export default async function AdminProductsPage() {
  const { products, brands, categories, taxonomies, dataUnavailable } = await getPageData();

  return (
    <AdminDashboardShell
      currentPath="/admin/products"
      title="Products"
      subtitle="Kelola produk ecommerce lengkap dengan relasi brand, category, taxonomy, dan SEO."
      dataUnavailable={dataUnavailable}
    >
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Dashboard &gt; Products</p>
            <h3 className="mt-1 text-xl font-bold text-[#33414e]">Products</h3>
            <p className="mt-1 text-sm text-slate-500">Kelola produk ecommerce lengkap dengan relasi brand, category, taxonomy, dan SEO.</p>
          </div>
          <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-[#e7000b] ring-1 ring-[#e7000b]/20">Live Supabase</span>
        </div>
        <h4 className="mb-3 text-base font-semibold text-slate-900">Create Product</h4>
        <ProductForm mode="create" brands={brands} categories={categories} taxonomies={taxonomies} />
      </section>

      <ProductTable products={products} brands={brands} categories={categories} taxonomies={taxonomies} dataUnavailable={dataUnavailable} />
    </AdminDashboardShell>
  );
}
