import Link from "next/link";

import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

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

type AdminDashboardShellProps = {
  currentPath: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  dataUnavailable?: boolean;
};

export function AdminDashboardShell({ currentPath, title, subtitle, children, dataUnavailable = false }: AdminDashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-4 px-4 py-5 lg:flex-row">
        <aside className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:w-72 lg:shrink-0 lg:overflow-y-auto">
          <h1 className="text-lg font-bold text-slate-900">PT Cipta Solusi Techindo</h1>
          <p className="mt-1 text-xs text-slate-500">Admin Dashboard</p>
          <nav className="mt-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  item.href === currentPath ? "bg-red-50 font-semibold text-[#DB1A1A]" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-4">
          <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                <p className="text-sm text-slate-500">{subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live Supabase</span>
                <AdminLogoutButton />
              </div>
            </div>
            {dataUnavailable ? (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Data unavailable. Kemungkinan env Supabase belum siap atau RLS belum mengizinkan operasi write/read.
              </p>
            ) : null}
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
