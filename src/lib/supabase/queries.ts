import { createClient as createBrowserClient } from "./client";

type BrandRow = {
  id: string;
  name: string;
  slug: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type ProductRow = {
  name: string;
  slug: string;
  price: number | null;
  final_price: number | null;
  compare_at_price: number | null;
  badge: string | null;
  category: { name: string } | { error: true } | null;
};

type BannerRow = {
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  placement:
    | "hero"
    | "side_promo"
    | "middle_promo"
    | "bottom_cta"
    | "benefit_free_delivery"
    | "benefit_support_247"
    | "benefit_payment"
    | "benefit_reliable"
    | "benefit_guarantee";
  badge: string | null;
  price_text: string | null;
  sort_order: number;
};

type SectionRow = {
  section_key: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  sort_order: number;
};

type CompanySettingRow = {
  key: string;
  value: Record<string, string | boolean | number | null>;
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

export async function getCategories() {
  if (!hasSupabasePublicEnv()) {
    return [] as CategoryRow[];
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,slug")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("[supabase] getCategories failed:", error.message);
      return [] as CategoryRow[];
    }

    return (data ?? []) as CategoryRow[];
  } catch {
    console.warn("[supabase] getCategories unexpected error");
    return [] as CategoryRow[];
  }
}

function formatIDR(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function mapProductRow(row: ProductRow) {
  const effectivePrice = row.final_price ?? row.price;
  const categoryName = row.category && "name" in row.category ? row.category.name : "General";
  return {
    name: row.name,
    category: categoryName,
    newPrice: formatIDR(effectivePrice) ?? "-",
    oldPrice: formatIDR(row.compare_at_price),
    save:
      row.compare_at_price && effectivePrice && row.compare_at_price > effectivePrice
        ? `Save ${Math.round(((row.compare_at_price - effectivePrice) / row.compare_at_price) * 100)}%`
        : "Promo",
    price: formatIDR(effectivePrice) ?? "-",
    badge: row.badge ?? "Promo",
  };
}

export async function getFeaturedProducts() {
  if (!hasSupabasePublicEnv()) {
    return [] as ReturnType<typeof mapProductRow>[];
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("products")
      .select("name,slug,price,final_price,compare_at_price,badge,category:categories(name)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .limit(8);

    if (error) {
      console.warn("[supabase] getFeaturedProducts failed:", error.message);
      return [];
    }

    return ((data ?? []) as ProductRow[]).map(mapProductRow);
  } catch {
    console.warn("[supabase] getFeaturedProducts unexpected error");
    return [];
  }
}

export async function getBestSellerProducts() {
  if (!hasSupabasePublicEnv()) {
    return [] as ReturnType<typeof mapProductRow>[];
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("products")
      .select("name,slug,price,final_price,compare_at_price,badge,category:categories(name)")
      .eq("is_active", true)
      .eq("is_best_seller", true)
      .order("sort_order", { ascending: true })
      .limit(10);

    if (error) {
      console.warn("[supabase] getBestSellerProducts failed:", error.message);
      return [];
    }

    return ((data ?? []) as ProductRow[]).map(mapProductRow);
  } catch {
    console.warn("[supabase] getBestSellerProducts unexpected error");
    return [];
  }
}

export async function getHomepageBanners() {
  if (!hasSupabasePublicEnv()) {
    return [] as BannerRow[];
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("homepage_banners")
      .select("title,subtitle,description,image_url,cta_label,cta_href,placement,badge,price_text,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("[supabase] getHomepageBanners failed:", error.message);
      return [] as BannerRow[];
    }

    return (data ?? []) as BannerRow[];
  } catch {
    console.warn("[supabase] getHomepageBanners unexpected error");
    return [] as BannerRow[];
  }
}

export async function getHomepageSections() {
  if (!hasSupabasePublicEnv()) {
    return [] as SectionRow[];
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("section_key,title,subtitle,description,sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.warn("[supabase] getHomepageSections failed:", error.message);
      return [] as SectionRow[];
    }

    return (data ?? []) as SectionRow[];
  } catch {
    console.warn("[supabase] getHomepageSections unexpected error");
    return [] as SectionRow[];
  }
}

export async function getCompanySettings() {
  if (!hasSupabasePublicEnv()) {
    return [] as CompanySettingRow[];
  }

  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("company_settings")
      .select("key,value")
      .in("key", ["company_profile", "contact_info", "social_links", "header_settings", "footer_settings", "seo_settings"]);

    if (error) {
      console.warn("[supabase] getCompanySettings failed:", error.message);
      return [] as CompanySettingRow[];
    }

    return (data ?? []) as CompanySettingRow[];
  } catch {
    console.warn("[supabase] getCompanySettings unexpected error");
    return [] as CompanySettingRow[];
  }
}
