import { createClient as createBrowserClient } from "./client";

type BrandRow = {
  id: string;
  name: string;
  slug: string;
};

type TaxonomyRow = {
  id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
};

export type BrandCatalogNode = {
  name: string;
  children?: BrandCatalogNode[];
};

export function hasSupabasePublicEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getBrands() {
  if (!hasSupabasePublicEnv()) {
    return [] as BrandRow[];
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("brands")
      .select("id,name,slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("[supabase] getBrands failed:", error.message);
      return [] as BrandRow[];
    }

    return (data ?? []) as BrandRow[];
  } catch {
    console.warn("[supabase] getBrands unexpected error");
    return [] as BrandRow[];
  }
}

export async function getBrandCatalog(brandSlug: string) {
  if (!hasSupabasePublicEnv()) {
    return [] as BrandCatalogNode[];
  }

  try {
    const supabase = createBrowserClient();

    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("id,slug")
      .eq("slug", brandSlug)
      .maybeSingle();

    if (brandError || !brand) {
      if (brandError) {
        console.warn("[supabase] getBrandCatalog brand lookup failed:", brandError.message);
      }
      return [] as BrandCatalogNode[];
    }

    const { data: taxonomy, error: taxonomyError } = await supabase
      .from("product_taxonomy")
      .select("id,parent_id,name,sort_order")
      .eq("brand_id", brand.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (taxonomyError) {
      console.warn("[supabase] getBrandCatalog taxonomy failed:", taxonomyError.message);
      return [] as BrandCatalogNode[];
    }

    const rows = (taxonomy ?? []) as TaxonomyRow[];
    const map = new Map<string, BrandCatalogNode & { _id: string; _parent: string | null }>();

    rows.forEach((row) => {
      map.set(row.id, { _id: row.id, _parent: row.parent_id, name: row.name, children: [] });
    });

    const roots: BrandCatalogNode[] = [];
    map.forEach((node) => {
      if (!node._parent) {
        roots.push(node);
        return;
      }

      const parent = map.get(node._parent);
      if (parent) {
        parent.children = parent.children ?? [];
        parent.children.push(node);
      }
    });

    const stripMeta = (node: BrandCatalogNode & { _id?: string; _parent?: string | null }): BrandCatalogNode => ({
      name: node.name,
      ...(node.children && node.children.length > 0 ? { children: node.children.map((child) => stripMeta(child as BrandCatalogNode & { _id?: string; _parent?: string | null })) } : {}),
    });

    return roots.map((node) => stripMeta(node as BrandCatalogNode & { _id?: string; _parent?: string | null }));
  } catch {
    console.warn("[supabase] getBrandCatalog unexpected error");
    return [] as BrandCatalogNode[];
  }
}
