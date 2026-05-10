import type { Metadata } from "next";

import { InquiryForm } from "@/app/inquiry/InquiryForm";

export const metadata: Metadata = {
  title: "Inquiry Konsultasi IT",
  description:
    "Kirim inquiry kebutuhan infrastruktur IT bisnis Anda untuk solusi PC Desktop, Laptop, Workstation, Server, Storage, dan Networking.",
};

export default function InquiryPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Public Inquiry</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Konsultasi Infrastruktur IT Bisnis</h1>
        <p className="mt-2 text-sm text-slate-600">
          Isi kebutuhan Anda, tim kami akan menghubungi untuk rekomendasi solusi server, storage, networking, endpoint, dan security.
        </p>
        <InquiryForm />
      </div>
    </main>
  );
}
