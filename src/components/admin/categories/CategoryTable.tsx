"use client";

import { useState, useTransition } from "react";

import { deleteCategoryAction, toggleCategoryActiveAction } from "@/app/admin/categories/actions";
import { CategoryForm, type CategoryItem } from "@/components/admin/categories/CategoryForm";

type CategoryTableProps = {
  categories: CategoryItem[];
  dataUnavailable: boolean;
};

export function CategoryTable({ categories, dataUnavailable }: CategoryTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Categories</h3>
        {dataUnavailable ? <span className="text-xs text-amber-600">Data unavailable</span> : null}
      </div>

      {error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">Belum ada category.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Sort</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-slate-100 align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{category.name}</p>
                    {category.description ? <p className="text-xs text-slate-500">{category.description}</p> : null}
                  </td>
                  <td className="px-3 py-3 text-slate-700">{category.slug}</td>
                  <td className="px-3 py-3 text-slate-700">{category.sort_order}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => {
                        setError(null);
                        startTransition(async () => {
                          const formData = new FormData();
                          formData.set("id", category.id);
                          formData.set("next_active", String(!category.is_active));
                          const result = await toggleCategoryActiveAction(formData);
                          if (!result.ok) {
                            setError(result.error ?? "Gagal mengubah status category.");
                          }
                        });
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${category.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId((current) => (current === category.id ? null : category.id))}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-50"
                      >
                        {editingId === category.id ? "Close" : "Edit"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (!window.confirm("Hapus category ini?")) {
                            return;
                          }

                          setError(null);
                          startTransition(async () => {
                            const formData = new FormData();
                            formData.set("id", category.id);
                            const result = await deleteCategoryAction(formData);
                            if (!result.ok) {
                              setError(result.error ?? "Gagal menghapus category.");
                            }
                          });
                        }}
                        className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                    {editingId === category.id ? (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <CategoryForm mode="edit" initialData={category} onDone={() => setEditingId(null)} />
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
