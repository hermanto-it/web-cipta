import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { createProductImageAction, deleteProductImageAction, updateProductImageAction } from "@/app/admin/product-images/actions";
import { createClient } from "@/lib/supabase/server";

type ProductImageItem = {
  id: string;
  image_url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  product: { name?: string } | null;
  product_id: string;
};

async function getProductImages() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: [] as ProductImageItem[], dataUnavailable: true };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("product_images")
      .select("id,product_id,image_url,alt_text,is_primary,sort_order,product:products(name)")
      .order("sort_order", { ascending: true })
      .limit(30);

    if (error) {
      console.warn("[admin] product images read failed:", error.message);
      return { data: [] as ProductImageItem[], dataUnavailable: true };
    }

    return { data: (data ?? []) as ProductImageItem[], dataUnavailable: false };
  } catch {
    console.warn("[admin] unexpected error reading product images");
    return { data: [] as ProductImageItem[], dataUnavailable: true };
  }
}

async function getProducts() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [] as Array<{ id: string; name: string }>;
  }

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("id,name").eq("is_active", true).order("name", { ascending: true }).limit(200);
    return (data ?? []) as Array<{ id: string; name: string }>;
  } catch {
    return [] as Array<{ id: string; name: string }>;
  }
}

export default async function AdminProductImagesPage() {
  const { data: images, dataUnavailable } = await getProductImages();
  const products = await getProducts();

  return (
    <AdminDashboardShell
      currentPath="/admin/product-images"
      title="Product Images"
      subtitle="Kelola gambar produk untuk katalog ecommerce."
      dataUnavailable={dataUnavailable}
    >
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
        <h3 className="text-lg font-semibold text-slate-900">Create Product Image</h3>
        <form action={createProductImageAction} className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Product</span>
            <select name="product_id" required className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2">
              <option value="">Pilih product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Image URL</span>
            <input name="image_url" required className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Alt Text</span>
            <input name="alt_text" className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium">Sort Order</span>
            <input name="sort_order" type="number" defaultValue={0} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2" />
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-medium sm:col-span-2">
            <input name="is_primary" type="checkbox" className="h-4 w-4" /> Set as primary
          </label>
          <button type="submit" className="rounded-xl bg-[#e7000b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c9000a] sm:col-span-2">Create Product Image</button>
        </form>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Recent Product Images</h3>
        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Belum ada data gambar produk. Silakan tambahkan image dari halaman Products.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f8fafc] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Image URL</th>
                  <th className="px-3 py-2">Primary</th>
                  <th className="px-3 py-2">Sort Order</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {images.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 align-top hover:bg-[#EAECED]/55">
                    <td className="px-3 py-2 font-medium text-slate-800">{(item.product as { name?: string } | null)?.name ?? "Unknown Product"}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{item.image_url}</td>
                    <td className="px-3 py-2">{item.is_primary ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Yes</span> : "No"}</td>
                    <td className="px-3 py-2 text-slate-600">{item.sort_order}</td>
                    <td className="px-3 py-2">
                      <form action={updateProductImageAction} className="mb-2 grid gap-2">
                        <input type="hidden" name="id" value={item.id} />
                        <input name="image_url" defaultValue={item.image_url} className="h-8 rounded border border-slate-200 px-2 text-xs" />
                        <input name="alt_text" defaultValue={item.alt_text ?? ""} className="h-8 rounded border border-slate-200 px-2 text-xs" />
                        <input name="sort_order" type="number" defaultValue={item.sort_order} className="h-8 rounded border border-slate-200 px-2 text-xs" />
                        <label className="inline-flex items-center gap-1 text-xs">
                          <input name="is_primary" type="checkbox" defaultChecked={item.is_primary} className="h-3.5 w-3.5" /> Primary
                        </label>
                        <button type="submit" className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">Update</button>
                      </form>
                      <form action={deleteProductImageAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="rounded border border-red-300 px-2 py-1 text-xs text-[#e7000b] hover:bg-red-50">Delete</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminDashboardShell>
  );
}
