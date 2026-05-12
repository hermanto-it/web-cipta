import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeHeader } from "@/components/home/HomeHeader";
import { createClient } from "@/lib/supabase/server";

type ProductRow = {
  id: string;
  brand_id: string;
  category_id: string;
  taxonomy_id: string | null;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  badge: string | null;
  price: number | null;
  final_price: number | null;
  compare_at_price: number | null;
  tax_rate: number | null;
  tax_amount: number | null;
  stock_quantity: number;
  is_tax_included: boolean;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
};

type ProductImageRow = {
  product_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
};

type NameRow = { id: string; name: string };

type CompanySettingsRow = { key: string; value: Record<string, string | boolean | number | null> };

type CompareRow = {
  id: string;
  category_id: string;
  taxonomy_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  final_price: number | null;
  price: number | null;
  badge: string | null;
};

type CompareCard = CompareRow & {
  image_url: string | null;
  chips: string[];
  highlight: string;
  emphasis: "current" | "standard";
};

function formatIDR(value: number | null) {
  if (value === null || Number.isNaN(value)) return "Hubungi kami";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function stripHtml(input: string | null | undefined) {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function unique(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter((item) => item.length > 0)));
}

function extractFeatureChips(sourceName: string, shortDescription: string, taxonomyName: string, badge: string | null) {
  const chips: string[] = [];
  if (taxonomyName) chips.push(taxonomyName);
  if (badge) chips.push(badge);

  const descParts = shortDescription
    .split(/[|,;]+/g)
    .map((part) => part.trim())
    .filter((part) => part.length >= 7)
    .slice(0, 4);
  chips.push(...descParts);

  const patternMatches = [
    sourceName.match(/\b\d+x\s+Intel\s+Xeon\s+[A-Za-z0-9\-+/ ]{3,30}/i)?.[0],
    sourceName.match(/\b\d+GB\s+DDR\d\b/i)?.[0],
    sourceName.match(/\b\d+x\s+[0-9.]+TB\s+NVMe(?:\s+U\.2)?\b/i)?.[0],
    sourceName.match(/\b\d+\s+Years?\s+ProSupport\b/i)?.[0],
  ].filter((item): item is string => Boolean(item));
  chips.push(...patternMatches);

  return unique(chips).slice(0, 6);
}

function sanitizeDescriptionHtml(input: string | null | undefined) {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "")
    .trim();
}

function formatDescriptionContent(input: string | null | undefined) {
  const sanitized = sanitizeDescriptionHtml(input);
  if (!sanitized) return "";

  const hasHtmlTag = /<\/?[a-z][\s\S]*>/i.test(sanitized);
  if (hasHtmlTag) return sanitized;

  const lines = sanitized
    .split(/\r?\n/g)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return "";
  if (lines.length === 1) return `<p>${lines[0]}</p>`;

  const [first, ...rest] = lines;
  const listItems = rest.map((line) => `<li>${line.replace(/^[-*•]\s*/, "")}</li>`).join("");
  return `<p>${first}</p><ul>${listItems}</ul>`;
}

async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id,brand_id,category_id,taxonomy_id,name,slug,sku,short_description,description,badge,price,final_price,compare_at_price,tax_rate,tax_amount,stock_quantity,is_tax_included,seo_title,seo_description,og_image_url")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProductRow;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: "Product Not Found | PT Cipta Solusi Techindo",
      description: "Detail produk tidak ditemukan.",
    };
  }

  const supabase = await createClient();
  const { data: imageRows } = await supabase
    .from("product_images")
    .select("image_url,is_primary,sort_order")
    .eq("product_id", product.id)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .limit(1);

  const primaryImage = (imageRows?.[0] as { image_url?: string } | undefined)?.image_url ?? null;
  const title = product.seo_title || `${product.name} | PT Cipta Solusi Techindo`;
  const description = product.seo_description || stripHtml(product.short_description) || "Solusi infrastruktur IT enterprise untuk kebutuhan bisnis Anda.";
  const ogImage = product.og_image_url || primaryImage;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const fallbackCategories = ["PC Desktop", "Laptop", "Workstation", "Server", "Storage", "Networking", "Accessories"];
  let headerCategories = [...fallbackCategories];
  let companyProfile = {
    name: "PT Cipta Solusi Techindo",
    description: "Penyedia perangkat, solusi, dan layanan infrastruktur IT enterprise untuk bisnis modern.",
    phone: "+62 811-9000-221",
    email: "sales@cst.co.id",
  };

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [imagesRes, categoriesRes, brandsRes, taxonomiesRes, settingsRes, compareRes] = await Promise.all([
    supabase.from("product_images").select("product_id,image_url,is_primary,sort_order").eq("product_id", product.id).order("is_primary", { ascending: false }).order("sort_order", { ascending: true }),
    supabase.from("categories").select("id,name").eq("is_active", true),
    supabase.from("brands").select("id,name").eq("is_active", true),
    supabase.from("product_taxonomy").select("id,name").eq("is_active", true),
    supabase.from("company_settings").select("key,value").in("key", ["company_profile", "contact_info"]),
    supabase
      .from("products")
      .select("id,brand_id,category_id,taxonomy_id,name,slug,short_description,final_price,price,badge")
      .eq("is_active", true)
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .order("is_featured", { ascending: false })
      .order("is_best_seller", { ascending: false })
      .order("sort_order", { ascending: true })
      .limit(12),
  ]);

  const categories = (categoriesRes.data ?? []) as NameRow[];
  const brands = (brandsRes.data ?? []) as NameRow[];
  const taxonomies = (taxonomiesRes.data ?? []) as NameRow[];

  if (categories.length > 0) {
    headerCategories = categories.map((item) => item.name);
  }

  if (!settingsRes.error && (settingsRes.data ?? []).length > 0) {
    const settings = settingsRes.data as CompanySettingsRow[];
    const profile = settings.find((row) => row.key === "company_profile")?.value;
    const contact = settings.find((row) => row.key === "contact_info")?.value;
    companyProfile = {
      name: typeof profile?.name === "string" ? profile.name : companyProfile.name,
      description: typeof profile?.description === "string" ? profile.description : companyProfile.description,
      phone: typeof contact?.phone === "string" ? contact.phone : companyProfile.phone,
      email: typeof contact?.email === "string" ? contact.email : companyProfile.email,
    };
  }

  const categoryName = categories.find((item) => item.id === product.category_id)?.name ?? "General";
  const brandName = brands.find((item) => item.id === product.brand_id)?.name ?? "Unknown Brand";
  const taxonomyName = product.taxonomy_id ? taxonomies.find((item) => item.id === product.taxonomy_id)?.name ?? "General" : "General";

  const productImages = (imagesRes.data ?? []) as ProductImageRow[];
  const galleryImages = productImages.slice(0, 4);
  const primaryImage = galleryImages[0]?.image_url ?? null;

  const comparePool = (compareRes.data ?? []) as CompareRow[];
  const shortDescription = stripHtml(product.short_description) || stripHtml(product.description);
  const productChips = extractFeatureChips(product.name, shortDescription, taxonomyName, product.badge);
  const descriptionHtml = formatDescriptionContent(product.description);

  const prioritizedCompare = comparePool
    .sort((a, b) => {
      const aTax = a.taxonomy_id && a.taxonomy_id === product.taxonomy_id ? 1 : 0;
      const bTax = b.taxonomy_id && b.taxonomy_id === product.taxonomy_id ? 1 : 0;
      return bTax - aTax;
    })
    .slice(0, 2);

  const compareCandidates: CompareRow[] = [
    ...prioritizedCompare,
    {
      id: product.id,
      category_id: product.category_id,
      taxonomy_id: product.taxonomy_id,
      name: product.name,
      slug: product.slug,
      short_description: product.short_description,
      final_price: product.final_price,
      price: product.price,
      badge: product.badge,
    },
  ];

  const compareIds = compareCandidates.map((item) => item.id);
  const { data: compareImageRows } = await supabase
    .from("product_images")
    .select("product_id,image_url,is_primary,sort_order")
    .in("product_id", compareIds)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });

  const compareImageMap = (compareImageRows ?? []).reduce<Map<string, string>>((acc, row) => {
    const image = row as ProductImageRow;
    if (!acc.has(image.product_id)) acc.set(image.product_id, image.image_url);
    return acc;
  }, new Map<string, string>());

  const compareCards: CompareCard[] = compareCandidates.map((item) => {
    const isCurrent = item.id === product.id;
    return {
      ...item,
      image_url: compareImageMap.get(item.id) ?? null,
      chips: extractFeatureChips(item.name, stripHtml(item.short_description), taxonomyName, item.badge).slice(0, 4),
      highlight: isCurrent ? "Current Product / High Density Performance" : item.taxonomy_id === product.taxonomy_id ? "Balanced Enterprise Performance" : "Cost-Efficient Virtualization",
      emphasis: isCurrent ? "current" : "standard",
    };
  });

  const effectivePrice = product.final_price ?? product.price;

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-slate-900">
      <HomeHeader companyProfile={companyProfile} categories={headerCategories} />

      <main className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-7">
        <nav className="text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-700">Home</Link> <span className="px-1">/</span>
          <span>{categoryName}</span> <span className="px-1">/</span>
          <span className="font-semibold text-[#0f2f57]">{product.name}</span>
        </nav>

        <section className="grid gap-6 lg:grid-cols-[42%_58%]">
          <div className="space-y-4">
            <article className="rounded-2xl border border-[#dbe5f1] bg-white p-4 shadow-sm">
              <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-[#dbe5f1] bg-[#f8fbff] sm:h-[360px] lg:h-[410px]">
                <button aria-label="Zoom product image" className="absolute right-3 top-3 z-10 rounded-md border border-[#bfd2e7] bg-white/90 p-1.5 text-[#0f3a66] shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20L16.65 16.65" />
                    <path d="M11 8v6" />
                    <path d="M8 11h6" />
                  </svg>
                </button>
              {primaryImage ? (
                  <Image src={primaryImage} alt={product.name} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-contain object-center p-4" />
              ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">No Image Available</div>
              )}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {galleryImages.length > 0 ? (
                  galleryImages.map((image, index) => (
                    <div key={`${image.product_id}-${image.sort_order}-${index}`} className={`relative aspect-[4/3] overflow-hidden rounded-lg border bg-[#f8fbff] ${index === 0 ? "border-[#2f6fb4] ring-1 ring-[#2f6fb4]/30" : "border-[#dbe5f1]"}`}>
                      <Image src={image.image_url} alt={`${product.name} ${index + 1}`} fill sizes="16vw" className="object-contain object-center p-1.5" />
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 rounded-lg border border-[#dbe5f1] bg-[#f8fbff] px-3 py-4 text-center text-xs text-slate-500">Thumbnail belum tersedia.</div>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-[#dbe5f1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    product.is_tax_included
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                  }`}
                >
                  {product.is_tax_included ? "Include PPN" : "Exclude PPN"}
                </span>
              </div>
              <p className="mt-1 text-3xl font-extrabold text-[#0f2f57]">{formatIDR(effectivePrice)}</p>
              {product.compare_at_price ? <p className="mt-1 text-sm text-slate-400 line-through">{formatIDR(product.compare_at_price)}</p> : null}
              <p className="mt-1 text-xs font-medium text-slate-600">Stock: {product.stock_quantity} unit</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <Link href={`/inquiry?product=${product.slug}`} className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#0f3a66] to-[#1a5a99] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95">Request Quotation</Link>
                <Link href="/inquiry" className="inline-flex items-center justify-center rounded-lg border border-[#0f3a66] px-4 py-2.5 text-sm font-semibold text-[#0f3a66] hover:bg-[#f2f8ff]">Contact Sales</Link>
              </div>
              <div className="mt-4 rounded-lg border border-[#dbe5f1] bg-[#f8fbff] p-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-[#0f3a66]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Enterprise-Grade Performance
                </p>
                <p className="mt-1 text-xs text-slate-600">Powerful, reliable, and scalable infrastructure for your business-critical workloads.</p>
              </div>
            </article>
          </div>

          <article className="rounded-2xl border border-[#dbe5f1] bg-white p-5 shadow-sm">
            <p className="inline-flex rounded-full border border-[#d2e3f6] bg-[#edf4fb] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1f4f82]">{categoryName}</p>
            <h1 className="mt-3 text-2xl font-bold leading-tight text-[#0f2f57] sm:text-[2rem]">{product.name}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {productChips.length > 0 ? productChips.map((chip) => (
                <span key={chip} className="rounded-full border border-[#d2e3f6] bg-[#f3f8ff] px-3 py-1 text-xs font-medium text-[#1f4f82]">{chip}</span>
              )) : <span className="rounded-full border border-[#d2e3f6] bg-[#f3f8ff] px-3 py-1 text-xs font-medium text-[#1f4f82]">Enterprise Ready</span>}
            </div>
            <p className="mt-4 text-base font-semibold leading-7 text-slate-800">{shortDescription || "Produk enterprise untuk kebutuhan performa tinggi, reliability, dan scalability bisnis modern."}</p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#0f2f57]">Specifications</h2>
              {descriptionHtml ? (
                <div
                  className="product-spec-content mt-3 text-[15px] leading-7 text-slate-700 [&_p]:mb-3 [&_p]:leading-7 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_li]:mb-1.5 [&_li]:pl-1 [&_li]:leading-7 [&_strong]:font-semibold [&_strong]:text-slate-950 [&_b]:font-semibold [&_b]:text-slate-950 [&_h1]:mb-3 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-slate-950 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-950 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-950 [&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-50 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_td]:border [&_td]:border-slate-300 [&_td]:px-2 [&_td]:py-1.5"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-slate-600">Spesifikasi produk belum tersedia. Silakan hubungi tim PT Cipta Solusi Techindo untuk detail konfigurasi.</p>
              )}
            </div>

          </article>
        </section>

        <section className="rounded-2xl border border-[#dbe5f1] bg-white p-5 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "100% Original Product", text: `Garansi resmi ${brandName}` },
              { title: "ProSupport Included", text: "Enterprise support you can trust" },
              { title: "Fast & Secure Delivery", text: "Pengiriman aman ke seluruh Indonesia" },
              { title: "Best Performance", text: "Optimized for your business" },
            ].map((item) => (
              <article key={item.title} className="rounded-xl border border-[#dbe5f1] bg-[#f8fbff] px-4 py-3">
                <p className="text-sm font-bold text-[#0f2f57]">{item.title}</p>
                <p className="mt-1 text-xs text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#dbe5f1] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-[#0f2f57]">Compare Product Variants</h2>
          <p className="mt-1 text-sm text-slate-600">Choose the best {categoryName} for your workload.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {compareCards.length > 0 ? (
              compareCards.map((item) => (
                <article key={item.id} className={`rounded-2xl border p-4 shadow-sm ${item.emphasis === "current" ? "border-[#2f6fb4] ring-1 ring-[#2f6fb4]/25" : "border-[#dbe5f1]"}`}>
                  <p className="inline-flex rounded-full border border-[#d2e3f6] bg-[#f3f8ff] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#1f4f82]">{categoryName}</p>
                  <div className="relative mt-3 h-36 overflow-hidden rounded-lg border border-[#dbe5f1] bg-[#f8fbff]">
                    {item.image_url ? <Image src={item.image_url} alt={item.name} fill sizes="(min-width:1024px) 20vw, 100vw" className="object-contain p-2" /> : <div className="flex h-full items-center justify-center text-xs text-slate-500">No Image</div>}
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-bold text-[#0f2f57]">{item.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.chips.slice(0, 4).map((chip) => (
                      <span key={`${item.id}-${chip}`} className="rounded-full border border-[#dbe5f1] bg-white px-2 py-0.5 text-[11px] text-slate-600">{chip}</span>
                    ))}
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs text-slate-600">{stripHtml(item.short_description) || "Enterprise-ready configuration"}</p>
                  <div className="mt-3 rounded-lg bg-[#f3f8ff] px-3 py-2 text-xs font-medium text-[#1f4f82]">{item.highlight}</div>
                  <p className="mt-3 text-base font-bold text-[#0f3a66]">{formatIDR(item.final_price ?? item.price)}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link href={`/products/${item.slug}`} className="inline-flex items-center justify-center rounded-lg bg-[#0f3a66] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d3358]">View Details</Link>
                    <Link href={`/inquiry?product=${item.slug}`} className="inline-flex items-center justify-center rounded-lg border border-[#0f3a66] px-3 py-2 text-xs font-semibold text-[#0f3a66] hover:bg-[#f2f8ff]">Request Quotation</Link>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">Belum ada varian pembanding untuk produk ini.</p>
            )}
          </div>
        </section>
      </main>

      <HomeFooter companyProfile={companyProfile} />
    </div>
  );
}
