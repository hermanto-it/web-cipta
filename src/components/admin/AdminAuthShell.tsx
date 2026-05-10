import Link from "next/link";

type AdminAuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AdminAuthShell({ title, subtitle, children }: AdminAuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="border-b border-slate-200 bg-white px-6 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-slate-600 sm:text-sm">
            <div>Call us for free: +62 811-9000-221</div>
            <div className="font-medium text-blue-800">Free Consultation for Business IT</div>
          </div>
        </div>
        <div className="border-b border-slate-200 bg-white px-6 py-5">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
            <div className="h-8 w-60 rounded bg-slate-200" />
            <div className="h-11 flex-1 rounded-xl border border-slate-300 bg-white" />
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-10 w-16 rounded bg-slate-200" />
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-6 xl:grid-cols-[260px_1fr_300px]">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="h-11 rounded-t-xl bg-red-600" />
            <div className="space-y-2 p-4">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="h-4 rounded bg-slate-200" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-72 rounded-xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="h-32 rounded-xl border border-slate-200 bg-white" />
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-36 rounded-xl border border-slate-200 bg-white" />
            <div className="h-36 rounded-xl border border-slate-200 bg-white" />
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-[calc(100%-2rem)] max-w-[480px] rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-2xl sm:px-7 sm:py-7">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            </div>
            <Link
              href="/"
              aria-label="Close login"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-xl leading-none text-slate-700 transition hover:border-red-500 hover:text-red-600"
            >
              ×
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
