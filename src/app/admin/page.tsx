import { createClient } from "@/lib/supabase/server";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";

type SummaryItem = {
  label: string;
  value: number;
  dataUnavailable: boolean;
};

async function getCount(table: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { count: 0, dataUnavailable: true };
  }

  try {
    const supabase = await createClient();
    const { count, error } = await supabase.from(table).select("id", { count: "exact", head: true });

    if (error) {
      console.warn(`[admin] failed reading ${table} count:`, error.message);
      return { count: 0, dataUnavailable: true };
    }

    return { count: count ?? 0, dataUnavailable: false };
  } catch {
    console.warn(`[admin] unexpected error reading ${table} count`);
    return { count: 0, dataUnavailable: true };
  }
}

export default async function AdminPage() {
  const [brands, categories, products, banners, inquiries] = await Promise.all([
    getCount("brands"),
    getCount("categories"),
    getCount("products"),
    getCount("homepage_banners"),
    getCount("inquiries"),
  ]);

  const summaries: SummaryItem[] = [
    { label: "Total Brands", value: brands.count, dataUnavailable: brands.dataUnavailable },
    { label: "Total Categories", value: categories.count, dataUnavailable: categories.dataUnavailable },
    { label: "Total Products", value: products.count, dataUnavailable: products.dataUnavailable },
    { label: "Total Homepage Banners", value: banners.count, dataUnavailable: banners.dataUnavailable },
    { label: "Total Inquiries", value: inquiries.count, dataUnavailable: inquiries.dataUnavailable },
  ];

  return (
    <AdminDashboardShell currentPath="/admin" title="Dashboard Overview" subtitle="Monitor data ecommerce dan operasional admin secara real-time.">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {summaries.map((item) => (
          <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
            {item.dataUnavailable ? <p className="mt-1 text-xs text-amber-600">Data unavailable</p> : <p className="mt-1 text-xs text-emerald-600">Live from Supabase</p>}
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Next Development Steps</h3>
        <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          {[
            "Implement list and table view yang konsisten di seluruh menu.",
            "Lengkapi form create/edit/delete dengan validasi yang seragam.",
            "Integrasikan pengelolaan product images lebih detail per produk.",
            "Perkuat role-based workflow dan audit action admin.",
          ].map((item) => (
            <p key={item} className="flex items-start gap-2">
              <span className="mt-0.5 text-[#DB1A1A]">✓</span>
              <span>{item}</span>
            </p>
          ))}
        </div>
      </section>
    </AdminDashboardShell>
  );
}
