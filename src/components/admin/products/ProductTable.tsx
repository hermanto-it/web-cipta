"use client";

import { useMemo, useState, useTransition } from "react";

import { deleteProductAction, toggleProductFlagAction } from "@/app/admin/products/actions";
import { ProductForm, type ProductItem, type ProductOption, type TaxonomyOption } from "@/components/admin/products/ProductForm";

type ProductTableProps = {
  products: (ProductItem & { brand_name: string; category_name: string; taxonomy_name: string | null })[];
  brands: ProductOption[];
  categories: ProductOption[];
  taxonomies: TaxonomyOption[];
  dataUnavailable: boolean;
};

export function ProductTable({ products, brands, categories, taxonomies, dataUnavailable }: ProductTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return products.filter((item) => {
      const bySearch =
        search.trim().length === 0 ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.sku ?? "").toLowerCase().includes(search.toLowerCase());
      const byBrand = brandFilter === "all" || item.brand_id === brandFilter;
      const byCategory = categoryFilter === "all" || item.category_id === categoryFilter;
      const byStatus = statusFilter === "all" || (statusFilter === "active" ? item.is_active : !item.is_active);
      return bySearch && byBrand && byCategory && byStatus;
    });
  }, [products, search, brandFilter, categoryFilter, statusFilter]);

  const toggleFlag = (id: string, field: "is_active" | "is_featured" | "is_best_seller" | "is_promo", nextValue: boolean) => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", id);
      formData.set("field", field);
      formData.set("next_value", String(nextValue));
      const result = await toggleProductFlagAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Gagal mengubah status product.");
      }
    });
  };

  const formatRupiah = (value: number | null) => {
    const amount = value ?? 0;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-[#33414e]">Products List</h3>
        {dataUnavailable ? <span className="text-xs text-amber-600">Data unavailable</span> : null}
      </div>

      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        <input value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Search by name or SKU" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition hover:border-[#e7000b]/60 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20" />
        <select value={brandFilter} onChange={(event) => setBrandFilter(event.currentTarget.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition hover:border-[#e7000b]/60 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20">
          <option value="all">All Brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </select>
        <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.currentTarget.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition hover:border-[#e7000b]/60 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20">
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.currentTarget.value as "all" | "active" | "inactive")} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition hover:border-[#e7000b]/60 focus:border-[#e7000b] focus:ring-2 focus:ring-[#e7000b]/20">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error ? <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">Belum ada product atau hasil filter kosong.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Brand/Category</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Flags</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 align-top hover:bg-[#EAECED]/55">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">Slug: {product.slug}</p>
                    {product.sku ? <p className="text-xs text-slate-400">SKU: {product.sku}</p> : null}
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    <p>{product.brand_name}</p>
                    <p className="text-xs text-slate-500">{product.category_name}</p>
                    {product.taxonomy_name ? <p className="text-xs text-slate-400">{product.taxonomy_name}</p> : null}
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    <p className="font-semibold text-slate-800">{formatRupiah(product.final_price ?? product.price)}</p>
                    {product.compare_at_price ? <p className="text-xs text-slate-400 line-through">{formatRupiah(product.compare_at_price)}</p> : null}
                    <p className="text-xs text-slate-500">Stock: {product.stock_quantity}</p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      {([
                        ["is_active", "Active"],
                        ["is_featured", "Featured"],
                        ["is_best_seller", "Best Seller"],
                        ["is_promo", "Promo"],
                      ] as const).map(([field, label]) => {
                        const enabled = Boolean(product[field]);
                        return (
                          <button
                            key={`${product.id}-${field}`}
                            type="button"
                            disabled={pending}
                            onClick={() => toggleFlag(product.id, field, !enabled)}
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${enabled ? field === "is_active" ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-[#e7000b]" : "bg-slate-100 text-slate-500"}`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId((current) => (current === product.id ? null : product.id))}
                        className="rounded-lg border border-slate-400 px-3 py-1 text-xs font-medium text-[#33414e] transition hover:bg-[#33414e] hover:text-white"
                      >
                        {editingId === product.id ? "Close" : "Edit"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (!window.confirm("Hapus product ini?")) return;
                          setError(null);
                          startTransition(async () => {
                            const formData = new FormData();
                            formData.set("id", product.id);
                            const result = await deleteProductAction(formData);
                            if (!result.ok) setError(result.error ?? "Gagal menghapus product.");
                          });
                        }}
                        className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-[#e7000b] transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                    {editingId === product.id ? (
                      <div className="mt-3 rounded-xl bg-[#f8fafc] p-3 ring-1 ring-slate-200/70">
                        <ProductForm mode="edit" initialData={product} brands={brands} categories={categories} taxonomies={taxonomies} onDone={() => setEditingId(null)} />
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
