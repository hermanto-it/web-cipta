import { createClient } from "@/lib/supabase/server";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

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

  const navItems = [
    "Dashboard",
    "Homepage Banners",
    "Brands",
    "Categories",
    "Products",
    "Product Images",
    "Company Settings",
    "Inquiries",
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-5 lg:flex-row">
        <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72 lg:shrink-0">
          <h1 className="text-lg font-bold">PT Cipta Solusi Techindo</h1>
          <p className="mt-1 text-xs text-slate-500">Admin Dashboard</p>
          <nav className="mt-4 space-y-1">
            {navItems.map((item, index) => (
              <button
                key={item}
                type="button"
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  index === 0 ? "bg-blue-700 font-semibold text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 space-y-4">
          <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Dashboard Overview</h2>
                <p className="text-sm text-slate-500">Monitor data ecommerce dan persiapan modul CRUD.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Basic Foundation</span>
                <AdminLogoutButton />
              </div>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {summaries.map((item) => (
              <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
                {item.dataUnavailable ? <p className="mt-1 text-xs text-amber-600">Data unavailable</p> : <p className="mt-1 text-xs text-emerald-600">Live from Supabase</p>}
              </article>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold">Next Development Steps</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>- Implement list/table view per menu</p>
              <p>- Tambah create/edit/delete forms</p>
              <p>- Integrasi upload product images</p>
              <p>- Tambah auth + role-based access</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
