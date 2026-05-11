import Link from "next/link";

import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Homepage Banners", href: "/admin/homepage-banners" },
  { label: "Brands", href: "/admin/brands" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Products", href: "/admin/products" },
  { label: "Product Images", href: "/admin/product-images" },
  { label: "Company Settings", href: "/admin/company-settings" },
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
    <div className="min-h-screen bg-[#EAECED] text-slate-900">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col lg:min-h-screen lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-[290px] lg:shrink-0 lg:border-b-0 lg:border-r lg:px-5 lg:py-5">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-base font-bold text-slate-900">PT Cipta Solusi Techindo</h1>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">Admin Workspace</p>
            </div>
            <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100" aria-label="Collapse sidebar">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M7 6h10M7 12h10M7 18h10" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mt-4 space-y-5">
            <div>
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Main</p>
              <nav className="space-y-1">
                {navItems.slice(0, 1).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative block rounded-xl px-3 py-2.5 text-sm transition ${
                      item.href === currentPath
                        ? "bg-red-50 font-semibold text-[#e7000b] before:absolute before:left-0 before:top-2 before:h-6 before:w-1 before:rounded-r before:bg-[#e7000b]"
                        : "text-slate-700 hover:bg-[#EAECED] hover:text-[#e7000b]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Content Management</p>
              <nav className="space-y-1">
                {navItems.slice(1, 7).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative block rounded-xl px-3 py-2.5 text-sm transition ${
                      item.href === currentPath
                        ? "bg-red-50 font-semibold text-[#e7000b] before:absolute before:left-0 before:top-2 before:h-6 before:w-1 before:rounded-r before:bg-[#e7000b]"
                        : "text-slate-700 hover:bg-[#EAECED] hover:text-[#e7000b]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Sales / Inquiries</p>
              <nav className="space-y-1">
                {navItems.slice(7).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`relative block rounded-xl px-3 py-2.5 text-sm transition ${
                      item.href === currentPath
                        ? "bg-red-50 font-semibold text-[#e7000b] before:absolute before:left-0 before:top-2 before:h-6 before:w-1 before:rounded-r before:bg-[#e7000b]"
                        : "text-slate-700 hover:bg-[#EAECED] hover:text-[#e7000b]"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 bg-[#33414e] px-4 py-2 shadow-sm sm:px-6 lg:min-h-[68px] lg:px-8">
            <div className="flex flex-wrap items-center gap-2.5 lg:flex-nowrap">
              <div className="relative min-w-[220px] flex-1">
                <input
                  type="text"
                  placeholder="Search here..."
                  className="h-[44px] w-full rounded-xl border border-white/70 bg-white px-3.5 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-slate-500">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                  </svg>
                </span>
              </div>

              <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                {[
                  { key: "moon", badge: null },
                  { key: "bell", badge: "3" },
                  { key: "chat", badge: "2" },
                  { key: "fullscreen", badge: null },
                  { key: "grid", badge: null },
                ].map((item) => (
                  <button key={item.key} type="button" className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/35 bg-white/90 text-[18px] leading-none text-[#33414e] transition hover:border-[#e7000b]/35 hover:bg-red-50" aria-label={item.key}>
                    {item.key === "moon" ? <span className="translate-y-[-1px]">◐</span> : null}
                    {item.key === "bell" ? <span>🔔</span> : null}
                    {item.key === "chat" ? <span>✉</span> : null}
                    {item.key === "fullscreen" ? <span>⛶</span> : null}
                    {item.key === "grid" ? <span>◫</span> : null}
                    {item.badge ? (
                      <span className={`absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${item.key === "bell" ? "bg-orange-500" : "bg-[#e7000b]"}`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>

              <div className="hidden h-[44px] items-center gap-2.5 rounded-xl border border-white/30 bg-white/10 px-2.5 py-1 sm:flex">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#33414e]">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 19c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">Admin</p>
                  <p className="text-[11px] text-[#dbe5ec]">Administrator</p>
                </div>
              </div>

              <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/35 bg-white/90 text-[20px] leading-none text-[#33414e] transition hover:border-[#e7000b]/35 hover:bg-red-50" aria-label="settings">
                <span className="translate-y-[-1px]">⚙</span>
              </button>

              <AdminLogoutButton />
            </div>
          </header>

          <div className="space-y-4 p-4 sm:p-6 lg:p-8">
            <section className="rounded-3xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200/80">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                  <p className="text-sm text-slate-500">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Dashboard &gt; {title}</span>
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Live Supabase</span>
                </div>
              </div>
              {dataUnavailable ? (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Data unavailable. Kemungkinan env Supabase belum siap atau RLS belum mengizinkan operasi write/read.
                </p>
              ) : null}
            </section>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
