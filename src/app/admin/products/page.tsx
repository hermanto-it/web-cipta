import { ProductForm } from "@/components/admin/products/ProductForm";
import type { ProductItem, ProductOption, TaxonomyOption } from "@/components/admin/products/ProductForm";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { createClient } from "@/lib/supabase/server";

type ProductTableItem = ProductItem & {
  brand_name: string;
  category_name: string;
  taxonomy_name: string | null;
};

async function getPageData() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      products: [] as ProductTableItem[],
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
          "id,brand_id,category_id,taxonomy_id,sku,name,slug,short_description,description,price,compare_at_price,tax_rate,tax_amount,final_price,is_tax_included,currency,stock_quantity,is_featured,is_best_seller,is_promo,is_active,badge,seo_title,seo_description,seo_keywords,og_title,og_description,og_image_url,canonical_url,sort_order,brand:brands(name),category:categories(name),taxonomy:product_taxonomy(name),images:product_images(image_url,is_primary)",
        )
        .order("sort_order", { ascending: true }),
      supabase.from("brands").select("id,name").order("sort_order", { ascending: true }),
      supabase.from("categories").select("id,name").order("sort_order", { ascending: true }),
      supabase.from("product_taxonomy").select("id,name,brand_id,category_id").eq("is_active", true).order("sort_order", { ascending: true }),
    ]);

    if (productsRes.error || brandsRes.error || categoriesRes.error || taxonomyRes.error) {
      const message = productsRes.error?.message || brandsRes.error?.message || categoriesRes.error?.message || taxonomyRes.error?.message;
      console.warn("[admin] products page read failed:", message);
      return { products: [] as ProductTableItem[], brands: [] as ProductOption[], categories: [] as ProductOption[], taxonomies: [] as TaxonomyOption[], dataUnavailable: true };
    }

    const products: ProductTableItem[] = (productsRes.data ?? []).map((item) => ({
      ...item,
      brand_name: (item.brand as { name?: string } | null)?.name ?? "Unknown Brand",
      category_name: (item.category as { name?: string } | null)?.name ?? "Unknown Category",
      taxonomy_name: (item.taxonomy as { name?: string } | null)?.name ?? null,
      primary_image_url:
        ((item.images as unknown as Array<{ image_url?: string; is_primary?: boolean }> | null) ?? []).find((image) => image.is_primary)?.image_url ??
        null,
    })) as ProductTableItem[];

    return {
      products,
      brands: (brandsRes.data ?? []) as ProductOption[],
      categories: (categoriesRes.data ?? []) as ProductOption[],
      taxonomies: (taxonomyRes.data ?? []) as TaxonomyOption[],
      dataUnavailable: false,
    };
  } catch {
    console.warn("[admin] unexpected error reading products page data");
    return { products: [] as ProductTableItem[], brands: [] as ProductOption[], categories: [] as ProductOption[], taxonomies: [] as TaxonomyOption[], dataUnavailable: true };
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
      <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-base font-semibold text-[#33414e]">Create Product</h4>
          <button
            type="submit"
            form="create-product-form"
            className="rounded-xl bg-[#e7000b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c9000a]"
          >
            Create Product
          </button>
        </div>
        <ProductForm formId="create-product-form" showSubmit={false} mode="create" brands={brands} categories={categories} taxonomies={taxonomies} />
      </section>

      <ProductTable products={products} brands={brands} categories={categories} taxonomies={taxonomies} dataUnavailable={dataUnavailable} />
    </AdminDashboardShell>
  );
}
