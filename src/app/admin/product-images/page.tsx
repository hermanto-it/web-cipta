import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import { createClient } from "@/lib/supabase/server";

async function getProductImages() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: [], dataUnavailable: true };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("product_images")
      .select("id,image_url,is_primary,sort_order,product:products(name)")
      .order("sort_order", { ascending: true })
      .limit(30);

    if (error) {
      console.warn("[admin] product images read failed:", error.message);
      return { data: [], dataUnavailable: true };
    }

    return { data: data ?? [], dataUnavailable: false };
  } catch {
    console.warn("[admin] unexpected error reading product images");
    return { data: [], dataUnavailable: true };
  }
}

export default async function AdminProductImagesPage() {
  const { data: images, dataUnavailable } = await getProductImages();

  return (
    <AdminDashboardShell
      currentPath="/admin/product-images"
      title="Product Images"
      subtitle="Kelola gambar produk untuk katalog ecommerce."
      dataUnavailable={dataUnavailable}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Upload & Gallery</h3>
        <p className="mt-1 text-sm text-slate-500">Panel ini siap untuk pengelolaan upload, primary image, dan urutan galeri per produk.</p>
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">TODO: Integrasi upload massal + reorder image per product.</div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Recent Product Images</h3>
        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">Belum ada data gambar produk. Silakan tambahkan image dari halaman Products.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Image URL</th>
                  <th className="px-3 py-2">Primary</th>
                  <th className="px-3 py-2">Sort Order</th>
                </tr>
              </thead>
              <tbody>
                {images.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 align-top">
                    <td className="px-3 py-2 font-medium text-slate-800">{(item.product as { name?: string } | null)?.name ?? "Unknown Product"}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{item.image_url}</td>
                    <td className="px-3 py-2">{item.is_primary ? <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Yes</span> : "No"}</td>
                    <td className="px-3 py-2 text-slate-600">{item.sort_order}</td>
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
