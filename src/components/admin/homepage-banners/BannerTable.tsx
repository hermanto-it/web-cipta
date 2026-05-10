"use client";

import { useState, useTransition } from "react";

import { deleteBannerAction, toggleBannerActiveAction } from "@/app/admin/homepage-banners/actions";
import { BannerForm, type BannerItem } from "@/components/admin/homepage-banners/BannerForm";

type BannerTableProps = {
  banners: BannerItem[];
  dataUnavailable: boolean;
};

export function BannerTable({ banners, dataUnavailable }: BannerTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Homepage Banners</h3>
        {dataUnavailable ? <span className="text-xs text-amber-600">Data unavailable</span> : null}
      </div>

      {error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      {banners.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">Belum ada banner.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Placement</th>
                <th className="px-3 py-2">Sort</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id} className="border-b border-slate-100 align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{banner.title}</p>
                    {banner.subtitle ? <p className="text-xs text-slate-500">{banner.subtitle}</p> : null}
                  </td>
                  <td className="px-3 py-3 text-slate-700">{banner.placement}</td>
                  <td className="px-3 py-3 text-slate-700">{banner.sort_order}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setError(null);
                        startTransition(async () => {
                          const formData = new FormData();
                          formData.set("id", banner.id);
                          formData.set("next_active", String(!banner.is_active));
                          const result = await toggleBannerActiveAction(formData);
                          if (!result.ok) {
                            setError(result.error ?? "Gagal mengubah status banner.");
                          }
                        });
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${banner.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                    >
                      {banner.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setEditingId((current) => (current === banner.id ? null : banner.id))} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-50">
                        {editingId === banner.id ? "Close" : "Edit"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (!window.confirm("Hapus banner ini?")) {
                            return;
                          }

                          setError(null);
                          startTransition(async () => {
                            const formData = new FormData();
                            formData.set("id", banner.id);
                            const result = await deleteBannerAction(formData);
                            if (!result.ok) {
                              setError(result.error ?? "Gagal menghapus banner.");
                            }
                          });
                        }}
                        className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                    {editingId === banner.id ? (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <BannerForm mode="edit" initialData={banner} onDone={() => setEditingId(null)} />
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
