import Link from "next/link";

import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { updateInquiryStatusAction } from "@/app/admin/inquiries/actions";
import { createClient } from "@/lib/supabase/server";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Homepage Banners", href: "/admin/homepage-banners" },
  { label: "Brands", href: "/admin/brands" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Products", href: "/admin/products" },
  { label: "Product Images", href: "#" },
  { label: "Company Settings", href: "#" },
  { label: "Inquiries", href: "/admin/inquiries" },
];

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function getInquiries(status: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { data: [], dataUnavailable: true };
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("inquiries")
      .select("id,name,company,email,phone,subject,message,source,status,created_at")
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.warn("[admin] inquiries read failed:", error.message);
      return { data: [], dataUnavailable: true };
    }

    return { data: data ?? [], dataUnavailable: false };
  } catch {
    console.warn("[admin] unexpected error reading inquiries");
    return { data: [], dataUnavailable: true };
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const statusParam = Array.isArray(params.status) ? params.status[0] : params.status;
  const selectedStatus = statusParam && ["new", "contacted", "closed", "all"].includes(statusParam) ? statusParam : "all";

  const { data: inquiries, dataUnavailable } = await getInquiries(selectedStatus);

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
                  item.href === "/admin/inquiries" ? "bg-blue-700 font-semibold text-white" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 space-y-4">
          <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">Inquiries</h2>
              <AdminLogoutButton />
            </div>
            <p className="mt-1 text-sm text-slate-500">Daftar inquiry yang masuk dari halaman publik dan status follow-up tim sales.</p>
            {dataUnavailable ? <p className="mt-2 text-xs text-amber-600">Data unavailable. Periksa policy RLS untuk tabel inquiries.</p> : null}
          </header>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", value: "all" },
                { label: "New", value: "new" },
                { label: "Contacted", value: "contacted" },
                { label: "Closed", value: "closed" },
              ].map((item) => (
                <Link
                  key={item.value}
                  href={`/admin/inquiries?status=${item.value}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    selectedStatus === item.value ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Belum ada inquiry.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDate(item.created_at)}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-600">{item.company ?? "-"}</p>
                        <p className="mt-1 text-xs text-slate-600">{item.email ?? "-"}</p>
                        <p className="text-xs text-slate-600">{item.phone ?? "-"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{item.subject ?? "(Tanpa subjek)"}</p>
                        <p className="mt-1 text-xs text-slate-500">Source: {item.source}</p>
                      </td>
                      <td className="max-w-sm px-4 py-3 text-slate-700">{item.message}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">{item.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <form action={updateInquiryStatusAction} className="flex flex-wrap gap-2">
                          <input type="hidden" name="id" value={item.id} />
                          <button name="next_status" value="new" className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
                            New
                          </button>
                          <button name="next_status" value="contacted" className="rounded border border-blue-300 px-2 py-1 text-xs text-blue-700 hover:bg-blue-50">
                            Contacted
                          </button>
                          <button name="next_status" value="closed" className="rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50">
                            Closed
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </div>
  );
}
