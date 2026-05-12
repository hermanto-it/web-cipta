import Link from "next/link";

type HomeHeaderProps = {
  companyProfile: {
    name: string;
    phone: string;
    email: string;
  };
  categories: string[];
};

export function HomeHeader({ companyProfile, categories }: HomeHeaderProps) {
  const safeMailto = `mailto:${companyProfile.email}`;

  return (
    <>
      <div className="border-b border-slate-200 bg-[#33414e] text-xs sm:text-sm">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-2">
          <p className="text-[#7cbfdb]">Call us for free: {companyProfile.phone}</p>
          <a href="/inquiry" className="font-medium text-white hover:text-slate-200">Free Consultation for Business IT</a>
          <div className="flex items-center gap-4">
            <a href="/inquiry" className="text-[#7cbfdb] hover:text-[#a6d8eb]">Language</a>
            <a href="/inquiry" className="font-medium text-[#e7000b] hover:text-[#ff3b45]">My account</a>
          </div>
        </div>
      </div>

      <header className="border-b border-slate-300 bg-[#EAECED]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <Link href="/" className="text-2xl font-bold tracking-tight text-slate-900">{companyProfile.name}</Link>
            <div className="flex w-full rounded-xl border border-slate-300 bg-[#EAECED] transition-colors hover:border-[#e7000b] focus-within:border-[#e7000b] focus-within:ring-1 focus-within:ring-[#e7000b] xl:max-w-2xl">
              <select className="w-36 border-r border-slate-300 bg-[#EAECED] px-3 text-sm text-slate-600 outline-none transition-colors hover:border-r-[#e7000b] focus:border-r-[#e7000b]"><option>All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
              <input type="text" placeholder="Search for enterprise IT products" className="min-w-0 flex-1 border-l border-transparent bg-[#EAECED] px-4 py-3 text-sm outline-none transition-colors hover:border-l-[#e7000b] focus:border-l-[#e7000b]" />
              <button className="rounded-r-xl bg-[#e7000b] px-5 text-sm font-semibold text-white hover:bg-[#c9000a]">Search</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-4 xl:flex xl:items-start xl:gap-6">
              <div className="flex min-h-[64px] min-w-fit shrink-0 flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Sales</p>
                <p className="whitespace-nowrap font-semibold">{companyProfile.phone}</p>
              </div>
              <div className="flex min-h-[64px] min-w-fit shrink-0 flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Email</p>
                <a href={safeMailto} aria-label="Email sales" className="inline-flex items-center justify-center text-slate-700">
                  <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden="true">
                    <rect x="7" y="12" width="34" height="24" rx="4" stroke="#dc2626" strokeWidth="2.8" />
                    <path d="M10 15l14 11 14-11" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="16" y="19" width="16" height="11" rx="2" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.4" />
                    <text x="24" y="27" textAnchor="middle" fontSize="8" fontWeight="700" fill="#2563eb">@</text>
                  </svg>
                </a>
              </div>
              <div className="flex min-h-[64px] min-w-fit shrink-0 flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Account</p>
                <p className="whitespace-nowrap font-semibold">Sign In</p>
              </div>
              <div className="flex min-h-[64px] min-w-fit shrink-0 flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Cart</p>
                <p className="whitespace-nowrap font-semibold">2 Items</p>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
