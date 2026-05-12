import Link from "next/link";

type HomeFooterProps = {
  companyProfile: {
    name: string;
    description: string;
    phone: string;
    email: string;
  };
};

export function HomeFooter({ companyProfile }: HomeFooterProps) {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-200">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 py-10 md:grid-cols-3">
        <section>
          <h2 className="text-lg font-bold text-white">{companyProfile.name}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">{companyProfile.description}</p>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Navigasi</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><a href="/inquiry" className="hover:text-white">Inquiry</a></li>
            <li><a href="/admin/login" className="hover:text-white">Admin Login</a></li>
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Kontak</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><span className="text-slate-400">Telepon:</span> {companyProfile.phone}</li>
            <li><span className="text-slate-400">Email:</span> <a href={`mailto:${companyProfile.email}`} className="hover:text-white">{companyProfile.email}</a></li>
          </ul>
        </section>
      </div>
      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-400">
        {new Date().getFullYear()} {companyProfile.name}. All rights reserved.
      </div>
    </footer>
  );
}
