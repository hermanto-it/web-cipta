"use client";

import { useState, useTransition } from "react";

import { deleteBrandAction, toggleBrandActiveAction } from "@/app/admin/brands/actions";
import { BrandForm, type BrandItem } from "@/components/admin/brands/BrandForm";

type BrandTableProps = {
  brands: BrandItem[];
  dataUnavailable: boolean;
};

export function BrandTable({ brands, dataUnavailable }: BrandTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Brands</h3>
        {dataUnavailable ? <span className="text-xs text-amber-600">Data unavailable</span> : null}
      </div>

      {error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      {brands.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">Belum ada brand.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Sort</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-b border-slate-100 align-top hover:bg-[#EAECED]/55">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{brand.name}</p>
                    {brand.description ? <p className="text-xs text-slate-500">{brand.description}</p> : null}
                  </td>
                  <td className="px-3 py-3 text-slate-700">{brand.slug}</td>
                  <td className="px-3 py-3 text-slate-700">{brand.sort_order}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setError(null);
                        startTransition(async () => {
                          const formData = new FormData();
                          formData.set("id", brand.id);
                          formData.set("next_active", String(!brand.is_active));
                          const result = await toggleBrandActiveAction(formData);
                          if (!result.ok) {
                            setError(result.error ?? "Gagal mengubah status brand.");
                          }
                        });
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${brand.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {brand.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId((current) => (current === brand.id ? null : brand.id))}
                        className="rounded-lg border border-slate-400 px-3 py-1 text-xs font-medium text-[#33414e] transition hover:bg-[#33414e] hover:text-white"
                      >
                        {editingId === brand.id ? "Close" : "Edit"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (!window.confirm("Hapus brand ini?")) {
                            return;
                          }

                          setError(null);
                          startTransition(async () => {
                            const formData = new FormData();
                            formData.set("id", brand.id);
                            const result = await deleteBrandAction(formData);
                            if (!result.ok) {
                              setError(result.error ?? "Gagal menghapus brand.");
                            }
                          });
                        }}
                        className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-[#e7000b] transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                    {editingId === brand.id ? (
                      <div className="mt-3 rounded-xl bg-[#f8fafc] p-3 ring-1 ring-slate-200/70">
                        <BrandForm mode="edit" initialData={brand} onDone={() => setEditingId(null)} />
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
