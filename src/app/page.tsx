import Image from "next/image";

import { HeroSlider, type HeroSlide } from "@/components/home/HeroSlider";
import { HomepageProductCard, type HomepageProductCardData } from "@/components/home/HomepageProductCard";
import { createClient } from "@/lib/supabase/server";

type BannerRow = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
  cta_label: string | null;
  cta_href: string | null;
  placement: "hero" | "side_promo" | "middle_promo" | "bottom_cta" | "benefit_free_delivery" | "benefit_support_247" | "benefit_payment" | "benefit_reliable" | "benefit_guarantee";
  price_text: string | null;
  sort_order: number;
};

type BrandRow = { name: string };
type CategoryRow = { name: string };
type ProductDbRow = {
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  final_price: number | null;
  compare_at_price: number | null;
  badge: string | null;
  is_featured: boolean;
  is_best_seller: boolean;
  is_promo: boolean;
  category: { name?: string } | null;
  taxonomy: { name?: string } | null;
  images: Array<{ image_url?: string; is_primary?: boolean }> | null;
};
type CompanySettingsRow = { key: string; value: Record<string, string | boolean | number | null> };

const fallbackCategories = ["PC Desktop", "Laptop", "Workstation", "Server", "Storage", "Networking", "Accessories", "UPS & Power", "Software License", "Security Appliance"];
const fallbackDealProducts: HomepageProductCardData[] = [
  {
    name: "Dell PowerEdge R770 2x Intel Xeon 6515P, 128GB, 4x 15.36TB NVMe",
    slug: "",
    categoryLabel: "RACKMOUNT SERVERS",
    imageUrl: null,
    featureChips: ["2x Intel Xeon 6515P", "128GB DDR5", "4x 15.36TB NVMe", "3 Years ProSupport"],
    summary: "Dell PowerEdge R770 dirancang untuk kebutuhan enterprise, virtualisasi, aplikasi bisnis, dan infrastruktur modern yang scalable.",
    displayPrice: "Hubungi kami untuk penawaran",
    compareAtPrice: null,
    statusStrip: "Featured Product",
  },
  {
    name: "HPE ProLiant DL380 Gen11 Enterprise Server",
    slug: "",
    categoryLabel: "ENTERPRISE SERVER",
    imageUrl: null,
    featureChips: ["Intel Xeon Gen4", "DDR5 ECC", "NVMe Ready", "High Availability"],
    summary: "Server kelas enterprise dengan performa tinggi dan fleksibilitas untuk workload mission-critical.",
    displayPrice: "Hubungi kami untuk penawaran",
    compareAtPrice: null,
    statusStrip: "Enterprise Ready • Ideal for mission-critical workloads",
  },
];
const fallbackBestSellerGrid = ["Business Desktop PC", "Enterprise Laptop", "Rack Server", "NAS Storage", "Managed Switch", "Wireless Access Point", "Firewall Appliance", "UPS Battery Backup", "Workstation GPU", "Monitor Professional"];

const fallbackHeroSlide: HeroSlide = {
  id: "hero-fallback",
  title: "Enterprise IT Hardware",
  subtitle: "Infrastructure Ready for Business",
  description: "From endpoint hingga data center untuk operasional enterprise.",
  ctaLabel: "Shop now",
  ctaHref: "/inquiry",
  priceText: "From Rp 2.870.000",
  imageUrl: "/images/banner/hero_banner.png",
};

const benefitFallbacks = [
  { placement: "benefit_free_delivery", image: "/images/banner/free_delivery_1874x696px.png" },
  { placement: "benefit_support_247", image: "/images/banner/support_247_1746x690px.png" },
  { placement: "benefit_payment", image: "/images/banner/payment_1833x701px.png" },
  { placement: "benefit_reliable", image: "/images/banner/reliable_1749x700px.png" },
  { placement: "benefit_guarantee", image: "/images/banner/guarantee_2622x922px.png" },
] as const;

function formatIDR(value: number | null) {
  if (value === null || Number.isNaN(value)) return null;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
}

function stripHtml(input: string | null | undefined) {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function extractFeatureChips(product: ProductDbRow) {
  const textSource = stripHtml(product.short_description) || stripHtml(product.description) || product.name;
  const chunks = textSource
    .split(/[|,;\n]/g)
    .map((part) => part.trim())
    .filter((part) => part.length >= 8)
    .slice(0, 4);
  if (chunks.length > 0) return chunks;
  return product.name
    .split(/[,|]/g)
    .map((part) => part.trim())
    .filter((part) => part.length >= 6)
    .slice(0, 4);
}

function buildSummary(product: ProductDbRow) {
  const shortText = stripHtml(product.short_description);
  const longText = stripHtml(product.description);
  if (shortText) return shortText;
  if (longText) return longText;
  return `${product.name} dirancang untuk kebutuhan enterprise, virtualisasi, aplikasi bisnis, dan infrastruktur modern yang scalable.`;
}

function mapProductToHomepageCard(product: ProductDbRow): HomepageProductCardData {
  const imageUrl = (product.images ?? []).find((item) => item.is_primary)?.image_url ?? (product.images ?? [])[0]?.image_url ?? null;
  const categoryLabel = (product.taxonomy?.name || product.category?.name || "ENTERPRISE PRODUCT").toUpperCase();
  const effectivePrice = product.final_price ?? product.price;
  const statusStrip =
    product.badge || (product.is_featured ? "Featured Product" : product.is_best_seller ? "Best Seller" : product.is_promo ? "Special Offer" : "Enterprise Ready • Ideal for mission-critical workloads");

  return {
    name: product.name,
    slug: product.slug,
    categoryLabel,
    imageUrl,
    featureChips: extractFeatureChips(product),
    summary: buildSummary(product),
    displayPrice: formatIDR(effectivePrice) ?? "Hubungi kami untuk penawaran",
    compareAtPrice: formatIDR(product.compare_at_price),
    statusStrip,
  };
}

export default async function Home() {
  let brands: BrandRow[] = [{ name: "Dell Technologies" }, { name: "HPE" }, { name: "Lenovo" }, { name: "Asus" }, { name: "Synology" }, { name: "Supermicro" }, { name: "Mikrotik" }, { name: "Cisco" }, { name: "Fortinet" }, { name: "APC" }, { name: "Microsoft" }, { name: "VMware" }];
  let categories = [...fallbackCategories];
  let dealProducts = [...fallbackDealProducts];
  let bestSellerGrid = [...fallbackBestSellerGrid];
  let heroSlides: HeroSlide[] = [fallbackHeroSlide];
  let middlePromo = { title: "Upgrade & SAVE BIG on Enterprise IT Infrastructure", ctaLabel: "Shop now", description: "Banner Image", imageUrl: "", ctaHref: "/inquiry" };
  let bottomCta = {
    title: "Need Complete IT Infrastructure for Your Business?",
    description: "Konsultasikan kebutuhan server, storage, networking, endpoint, dan security untuk perusahaan Anda.",
    ctaLabel: "Konsultasi Sekarang",
    ctaHref: "/inquiry",
    imageUrl: "",
  };
  const benefitImages: Record<string, string> = {};
  let companyProfile = {
    name: "PT Cipta Solusi Techindo",
    description: "Penyedia perangkat, solusi, dan layanan infrastruktur IT enterprise untuk bisnis modern.",
    phone: "+62 811-9000-221",
    email: "sales@cst.co.id",
  };

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const supabase = await createClient();
      const [brandsRes, categoriesRes, featuredRes, bestSellerRes, bannersRes, settingsRes] = await Promise.all([
        supabase.from("brands").select("name").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("categories").select("name").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase
          .from("products")
          .select("name,slug,short_description,description,price,final_price,compare_at_price,badge,is_featured,is_best_seller,is_promo,category:categories(name),taxonomy:product_taxonomy(name),images:product_images(image_url,is_primary)")
          .eq("is_active", true)
          .order("is_featured", { ascending: false })
          .order("is_best_seller", { ascending: false })
          .order("is_promo", { ascending: false })
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false })
          .limit(9),
        supabase.from("products").select("name").eq("is_active", true).eq("is_best_seller", true).order("sort_order", { ascending: true }).limit(10),
        supabase.from("homepage_banners").select("id,title,subtitle,description,image_url,cta_label,cta_href,placement,price_text,sort_order").eq("is_active", true).order("sort_order", { ascending: true }),
        supabase.from("company_settings").select("key,value").in("key", ["company_profile", "contact_info"]),
      ]);

      if (!brandsRes.error && (brandsRes.data ?? []).length > 0) brands = brandsRes.data as BrandRow[];
      if (!categoriesRes.error && (categoriesRes.data ?? []).length > 0) categories = (categoriesRes.data as CategoryRow[]).map((row) => row.name);

      if (!featuredRes.error && (featuredRes.data ?? []).length > 0) {
        const rows = (featuredRes.data ?? []) as ProductDbRow[];
        dealProducts = rows.map(mapProductToHomepageCard);
      }

      if (!bestSellerRes.error && (bestSellerRes.data ?? []).length > 0) bestSellerGrid = (bestSellerRes.data as Array<{ name: string }>).map((row) => row.name);

      if (!bannersRes.error && (bannersRes.data ?? []).length > 0) {
        const bannerRows = bannersRes.data as BannerRow[];

        const heroRows = bannerRows.filter((row) => row.placement === "hero");
        if (heroRows.length > 0) {
          heroSlides = heroRows.map((row) => ({
            id: row.id,
            title: row.title,
            subtitle: row.subtitle ?? fallbackHeroSlide.subtitle,
            description: row.description ?? fallbackHeroSlide.description,
            ctaLabel: row.cta_label ?? fallbackHeroSlide.ctaLabel,
            ctaHref: (row.cta_href ?? "").trim() || "/inquiry",
            priceText: row.price_text ?? fallbackHeroSlide.priceText,
            imageUrl: row.image_url,
          }));
        }

        const middleRow = bannerRows.find((row) => row.placement === "middle_promo");
        if (middleRow) {
          middlePromo = {
            title: middleRow.title,
            ctaLabel: middleRow.cta_label ?? middlePromo.ctaLabel,
            description: middleRow.description ?? middlePromo.description,
            imageUrl: middleRow.image_url ?? "",
            ctaHref: (middleRow.cta_href ?? "").trim() || "/inquiry",
          };
        }

        const bottomRow = bannerRows.find((row) => row.placement === "bottom_cta");
        if (bottomRow) {
          bottomCta = {
            title: bottomRow.title,
            description: bottomRow.description ?? bottomCta.description,
            ctaLabel: bottomRow.cta_label ?? bottomCta.ctaLabel,
            ctaHref: (bottomRow.cta_href ?? "").trim() || "/inquiry",
            imageUrl: bottomRow.image_url ?? "",
          };
        }

        bannerRows.forEach((row) => {
          if (row.placement.startsWith("benefit_") && row.image_url) benefitImages[row.placement] = row.image_url;
        });
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
    } catch {
      console.warn("[homepage] gagal mengambil data server-side, menggunakan fallback final");
    }
  }

  const safeMailto = `mailto:${companyProfile.email}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Organization", name: companyProfile.name, url: siteUrl, email: companyProfile.email, telephone: companyProfile.phone, address: { "@type": "PostalAddress", addressCountry: "ID" } }) }} />
      <div className="border-b border-slate-200 bg-[#33414e] text-xs sm:text-sm">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-2">
          <p className="text-[#7cbfdb]">Call us for free: {companyProfile.phone}</p>
          <a href="/inquiry" className="font-medium text-white hover:text-slate-200">Free Consultation for Business IT</a>
          <div className="flex items-center gap-4">
            <a href="/inquiry" className="text-[#7cbfdb] hover:text-[#a6d8eb]">Language</a>
            <a href="/inquiry" className="font-medium text-[#e7000b] hover:text-[#ff3b45]">My account</a>
          </div>
        </div>
      </div>

      <header className="border-b border-slate-300 bg-[#EAECED]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{companyProfile.name}</h1>
            <div className="flex w-full rounded-xl border border-slate-300 bg-[#EAECED] transition-colors hover:border-[#e7000b] focus-within:border-[#e7000b] focus-within:ring-1 focus-within:ring-[#e7000b] xl:max-w-2xl">
              <select className="w-36 border-r border-slate-300 bg-[#EAECED] px-3 text-sm text-slate-600 outline-none transition-colors hover:border-r-[#e7000b] focus:border-r-[#e7000b]"><option>All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
              <input type="text" placeholder="Search for enterprise IT products" className="min-w-0 flex-1 border-l border-transparent bg-[#EAECED] px-4 py-3 text-sm outline-none transition-colors hover:border-l-[#e7000b] focus:border-l-[#e7000b]" />
              <button className="rounded-r-xl bg-[#e7000b] px-5 text-sm font-semibold text-white hover:bg-[#c9000a]">Search</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-4 xl:flex xl:items-start xl:gap-6">
              <div className="flex min-h-[64px] min-w-fit shrink-0 flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Sales</p>
                <p className="whitespace-nowrap font-semibold">{companyProfile.phone}</p>
              </div>
              <div className="flex min-h-[64px] min-w-fit shrink-0 flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Email</p>
                <a href={safeMailto} aria-label="Email sales" className="inline-flex items-center justify-center text-slate-700">
                  <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden="true">
                    <rect x="7" y="12" width="34" height="24" rx="4" stroke="#dc2626" strokeWidth="2.8" />
                    <path d="M10 15l14 11 14-11" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="16" y="19" width="16" height="11" rx="2" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.4" />
                    <text x="24" y="27" textAnchor="middle" fontSize="8" fontWeight="700" fill="#2563eb">@</text>
                  </svg>
                </a>
              </div>
              <div className="flex min-h-[64px] min-w-fit shrink-0 flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Account</p>
                <p className="whitespace-nowrap font-semibold">Sign In</p>
              </div>
              <div className="flex min-h-[64px] min-w-fit shrink-0 flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Cart</p>
                <p className="whitespace-nowrap font-semibold">2 Items</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6">
        <section className="grid items-start gap-4 xl:grid-cols-[260px_1fr]">
          <aside className="overflow-hidden rounded-xl bg-white">
            <div className="bg-red-600 px-4 py-3 text-sm font-semibold text-white">All Brands</div>
            <ul className="divide-y divide-slate-100">
              {brands.map((brand) => (
                <li key={brand.name} className="px-4 py-2.5 text-sm font-semibold text-slate-800">{brand.name}</li>
              ))}
            </ul>
          </aside>

          <HeroSlider slides={heroSlides} />
        </section>

        <section className="mt-4 mb-8 grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
          {benefitFallbacks.map((item) => (
            <article key={item.placement} className="flex h-[92px] items-center justify-center p-0 sm:h-[104px] xl:h-[116px]">
              <div className="relative block h-full w-full">
                <Image src={benefitImages[item.placement] ?? item.image} alt={item.placement} fill sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 100vw" className="block w-full object-contain object-center" />
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Deal Of The Day <span className="text-red-600">🔥</span></h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {dealProducts.map((product) => (
              <HomepageProductCard key={`${product.slug}-${product.name}`} product={product} />
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-gradient-to-r from-blue-900 via-blue-700 to-slate-800 p-6 text-white shadow-md">
          <h2 className="text-2xl font-bold">{middlePromo.title}</h2>
          <a href={middlePromo.ctaHref} className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-700">{middlePromo.ctaLabel}</a>
          {middlePromo.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={middlePromo.imageUrl} alt={middlePromo.title} className="mt-4 h-24 w-full rounded-lg object-cover" />
          ) : (
            <div className="mt-4 h-24 rounded-lg bg-white/15 p-3 text-center text-sm text-blue-100">{middlePromo.description || "Banner Image"}</div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Best Seller</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {bestSellerGrid.map((item) => (
              <article key={item} className="rounded-lg border border-slate-200 p-3"><div className="h-24 rounded bg-gradient-to-br from-slate-200 to-slate-300 p-3 text-center text-xs text-slate-600">Product Image</div><p className="mt-2 text-sm font-semibold">{item}</p></article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-2xl font-bold">{bottomCta.title}</h2>
          <p className="mx-auto mt-2 max-w-3xl text-sm text-slate-600">{bottomCta.description}</p>
          {bottomCta.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bottomCta.imageUrl} alt={bottomCta.title} className="mx-auto mt-4 h-36 w-full max-w-3xl rounded-lg object-cover" />
          ) : null}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a href={bottomCta.ctaHref} className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">{bottomCta.ctaLabel}</a>
            <button className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Lihat Katalog</button>
          </div>
        </section>
      </main>
    </div>
  );
}
