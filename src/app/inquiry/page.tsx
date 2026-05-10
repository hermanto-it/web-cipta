"use client";

import { useState, useTransition } from "react";

import { submitInquiryAction } from "@/app/inquiry/actions";

export default function InquiryPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Public Inquiry</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Konsultasi Infrastruktur IT Bisnis</h1>
        <p className="mt-2 text-sm text-slate-600">
          Isi kebutuhan Anda, tim kami akan menghubungi untuk rekomendasi solusi server, storage, networking, endpoint, dan security.
        </p>

        <form
          className="mt-6 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            setSuccess(null);

            const formData = new FormData(event.currentTarget);

            startTransition(async () => {
              const result = await submitInquiryAction(formData);

              if (!result.ok) {
                setError(result.error ?? "Terjadi kesalahan.");
                return;
              }

              event.currentTarget.reset();
              setSuccess("Inquiry berhasil dikirim. Tim kami akan segera menghubungi Anda.");
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Nama *</span>
              <input name="name" required className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Nama lengkap" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Perusahaan</span>
              <input name="company" className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Nama perusahaan" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium">Email</span>
              <input name="email" type="email" className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="nama@perusahaan.com" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">No. Telepon</span>
              <input name="phone" className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="08xxxxxxxxxx" />
            </label>
          </div>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Subjek</span>
            <input name="subject" className="w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Contoh: Upgrade server kantor pusat" />
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Kebutuhan Anda *</span>
            <textarea
              name="message"
              required
              rows={6}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholder="Jelaskan kebutuhan proyek, jumlah user, lokasi, dan target implementasi."
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

          <button type="submit" disabled={pending} className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
            {pending ? "Mengirim..." : "Kirim Inquiry"}
          </button>
        </form>
      </div>
    </main>
  );
}
