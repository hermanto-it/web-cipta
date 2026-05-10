"use client";

import { useEffect, useState } from "react";

import {
  getBestSellerProducts,
  getBrandCatalog,
  getBrands,
  getCategories,
  getCompanySettings,
  getFeaturedProducts,
  getHomepageBanners,
  getHomepageSections,
  hasSupabasePublicEnv,
} from "@/lib/supabase/queries";

export default function Home() {
  type CatalogNode = {
    name: string;
    children?: CatalogNode[];
  };

  type BrandCatalog = {
    name: string;
    catalog?: CatalogNode[];
  };

  const comingSoonCatalog: CatalogNode[] = [{ name: "Product lines coming soon" }];

  const dellCatalog: CatalogNode[] = [
    {
      name: "PC Desktop",
      children: [
        {
          name: "Tower",
          children: [
            { name: "Dell Tower", children: [{ name: "Dell Tower" }] },
            { name: "Dell Pro", children: [{ name: "Dell Pro 5 Micro" }] },
            {
              name: "Dell Pro Max",
              children: [
                { name: "Dell Pro Max Tower T2" },
                { name: "Dell Pro Max Slim" },
                { name: "Dell Pro Max Micro" },
              ],
            },
          ],
        },
        { name: "All-in-One", children: [{ name: "Dell 24 All-in-One" }] },
        { name: "Slim", children: [{ name: "Dell Slim Desktop" }] },
      ],
    },
    {
      name: "Laptop",
      children: [
        {
          name: "Dell Pro",
          children: [{ name: "Dell Pro 3" }, { name: "Dell Pro 5" }, { name: "Dell Pro 7" }, { name: "Dell Pro Premium" }],
        },
        { name: "XPS", children: [{ name: "XPS 14" }] },
         { name: "Dell Plus", children: [{ name: "Dell 16 Plus Intel" }, { name: "Dell 16 Plus AMD" }] },
         { name: "Dell PC", children: [{ name: "Dell 15 Intel" }, { name: "Dell 15 AMD" }] },
      ],
    },
    {
      name: "Workstation",
      children: [
        {
          name: "Tower",
          children: [
            { name: "Dell Pro Precision 7 T1" },
            { name: "Precision 3680 Tower" },
            { name: "Precision 5860 Tower" },
            { name: "Precision 7875 Tower" },
            { name: "Precision 7960 Tower" },
          ],
        },
        { name: "Rackmount", children: [{ name: "Precision 7960 Rackmount" }] },
        {
          name: "Laptop",
          children: [
            { name: "Dell Pro Precision 7 Series 14\"" },
            { name: "Dell Pro Precision 7 Series 16\"" },
            { name: "Dell Precision 3490 14\"" },
            { name: "Dell Precision 5490 14\"" },
            { name: "Dell Precision 3590 15\"" },
            { name: "Dell Precision 3591 15\"" },
            { name: "Dell Precision 5690 16\"" },
            { name: "Dell Pro Precision 5S" },
          ],
        },
      ],
    },
    {
      name: "Server",
      children: [
        {
          name: "Data Center Tower Server",
          children: [
            {
              name: "1-socket",
              children: [
                { name: "PowerEdge T160" },
                { name: "PowerEdge T360" },
                { name: "PowerEdge T150" },
                { name: "PowerEdge T350" },
              ],
            },
            { name: "2-socket", children: [{ name: "PowerEdge T560" }, { name: "PowerEdge T550" }] },
          ],
        },
        {
          name: "Data Center Rackmount Server",
          children: [
            {
              name: "1-socket",
              children: [
                { name: "PowerEdge R570 (Intel)" },
                { name: "PowerEdge R470 (Intel)" },
                { name: "PowerEdge R260 (Intel)" },
                { name: "PowerEdge R360 (Intel)" },
                { name: "PowerEdge R250 (Intel)" },
                { name: "PowerEdge R4715 (AMD)" },
                { name: "PowerEdge R5715 (AMD)" },
                { name: "PowerEdge R6715 (AMD)" },
                { name: "PowerEdge R7715 (AMD)" },
                { name: "PowerEdge R6615 (AMD)" },
                { name: "PowerEdge R7615 (AMD)" },
                { name: "PowerEdge C6615 (AMD)" },
              ],
            },
            {
              name: "2-socket",
              children: [
                { name: "PowerEdge R770AP (Intel)" },
                { name: "PowerEdge R770 (Intel)" },
                { name: "PowerEdge R670 (Intel)" },
                { name: "PowerEdge R760 (Intel)" },
                { name: "PowerEdge R760xs (Intel)" },
                { name: "PowerEdge R760xd2 (Intel)" },
                { name: "PowerEdge R660 (Intel)" },
                { name: "PowerEdge R660xs (Intel)" },
                { name: "PowerEdge MX760c (Intel)" },
                { name: "PowerEdge C6620 (Intel)" },
                { name: "PowerEdge R450 (Intel)" },
                { name: "PowerEdge R550(Intel)" },
                { name: "PowerEdge R7725 (AMD)" },
                { name: "PowerEdge R7725xd (AMD)" },
                { name: "PowerEdge R6725 (AMD)" },
                { name: "PowerEdge R7625 (AMD)" },
                { name: "PowerEdge R6625 (AMD)" },
              ],
            },
            { name: "4-socket", children: [{ name: "PowerEdge R860 (Intel)" }, { name: "PowerEdge R960 (Intel)" }] },
          ],
        },
        {
          name: "AI Server",
          children: [
            {
              name: "2-socket",
              children: [
                { name: "PowerEdge R760xa (Intel)" },
                { name: "PowerEdge XE9780 (Intel)" },
                { name: "PowerEdge XE7740 (Intel)" },
                { name: "PowerEdge XE9785 (AMD)" },
                { name: "PowerEdge XE7745 (AMD)" },
              ],
            },
          ],
        },
        {
          name: "Edge Server",
          children: [
            { name: "PowerEdge XR8720t (Intel)" },
            { name: "PowerEdge XR5610 (Intel)" },
            { name: "PowerEdge XR7620 (Intel)" },
            { name: "PowerEdge XR8610t Multi-Node (Intel)" },
            { name: "PowerEdge XR8620t Multi-Node (Intel)" },
            { name: "PowerEdge XR4510c (Intel)" },
            { name: "PowerEdge XR4520c (Intel)" },
            { name: "PowerEdge XR11" },
            { name: "PowerEdge XR12" },
          ],
        },
      ],
    },
    {
      name: "Storage",
      children: [
        {
          name: "PowerStore",
          children: [
            { name: "PowerStore 500T" },
            { name: "PowerStore 500T DC" },
            { name: "PowerStore 1200T" },
            { name: "PowerStore 3200T" },
            { name: "PowerStore 3200Q" },
            { name: "PowerStore 5200T" },
            { name: "PowerStore 5200Q" },
            { name: "PowerStore 9200T" },
          ],
        },
        {
          name: "PowerScale",
          children: [
            { name: "All-flash", children: [{ name: "PowerScale F910" }, { name: "PowerScale F710" }, { name: "PowerScale F210" }] },
            { name: "Archive", children: [{ name: "PowerScale A310" }, { name: "PowerScale A3100" }] },
            { name: "Hybrid", children: [{ name: "PowerScale H710" }, { name: "PowerScale H7100" }] },
          ],
        },
        {
          name: "PowerProtect",
          children: [
            { name: "Data Manager", children: [{ name: "Data Manager Appliance" }] },
            {
              name: "Data Domain",
              children: [
                { name: "All-Flash Ready Node" },
                { name: "DD3410" },
                { name: "DD6410" },
                { name: "DD9410" },
                { name: "DD9910" },
                { name: "DD9910F" },
              ],
            },
            { name: "Cyber Recovery" },
            { name: "Backup Services" },
          ],
        },
      ],
    },
  ];

  const fallbackBrands: BrandCatalog[] = [
    { name: "Dell Technologies", catalog: dellCatalog },
    { name: "HPE", catalog: comingSoonCatalog },
    { name: "Lenovo", catalog: comingSoonCatalog },
    { name: "Asus", catalog: comingSoonCatalog },
    { name: "Synology", catalog: comingSoonCatalog },
    { name: "Supermicro", catalog: comingSoonCatalog },
    { name: "Mikrotik", catalog: comingSoonCatalog },
    { name: "Cisco", catalog: comingSoonCatalog },
    { name: "Fortinet", catalog: comingSoonCatalog },
    { name: "APC", catalog: comingSoonCatalog },
    { name: "Microsoft", catalog: comingSoonCatalog },
    { name: "VMware", catalog: comingSoonCatalog },
  ];

  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [brands, setBrands] = useState<BrandCatalog[]>(fallbackBrands);
  const [categories, setCategories] = useState<string[]>([
    "PC Desktop",
    "Laptop",
    "Workstation",
    "Server",
    "Storage",
    "Networking",
    "Accessories",
    "UPS & Power",
    "Software License",
    "Security Appliance",
  ]);
  const [heroBanner, setHeroBanner] = useState({
    title: "Enterprise IT Hardware",
    subtitle: "Infrastructure Ready for Business",
    description: "From endpoint hingga data center untuk operasional enterprise.",
    ctaLabel: "Shop now",
    priceText: "From Rp 2.870.000",
  });
  const [sidePromos, setSidePromos] = useState<string[]>(["Server Deals", "Networking Deals"]);
  const [middlePromo, setMiddlePromo] = useState({
    title: "Upgrade & SAVE BIG on Enterprise IT Infrastructure",
    ctaLabel: "Shop now",
    description: "Banner Image",
  });
  const [dealProducts, setDealProducts] = useState([
    { name: "Dell PowerEdge Server", category: "Server", newPrice: "Rp 58.500.000", oldPrice: "Rp 63.200.000", save: "Save 8%" },
    { name: "Lenovo ThinkPad Business Laptop", category: "Laptop", newPrice: "Rp 21.900.000", oldPrice: "Rp 24.400.000", save: "Save 10%" },
    { name: "HP Z Workstation", category: "Workstation", newPrice: "Rp 43.750.000", oldPrice: "Rp 48.100.000", save: "Save 9%" },
    { name: "Synology NAS Storage", category: "Storage", newPrice: "Rp 17.400.000", oldPrice: "Rp 19.250.000", save: "Save 9%" },
  ]);
  const [featuredMini, setFeaturedMini] = useState([
    { name: "Cisco Managed Switch", price: "Rp 13.200.000" },
    { name: "Ubiquiti Access Point", price: "Rp 4.250.000" },
    { name: "APC UPS", price: "Rp 8.900.000" },
    { name: "Enterprise SSD", price: "Rp 6.350.000" },
  ]);
  const [bestSellerGrid, setBestSellerGrid] = useState([
    "Business Desktop PC",
    "Enterprise Laptop",
    "Rack Server",
    "NAS Storage",
    "Managed Switch",
    "Wireless Access Point",
    "Firewall Appliance",
    "UPS Battery Backup",
    "Workstation GPU",
    "Monitor Professional",
  ]);
  const [companyProfile, setCompanyProfile] = useState({
    name: "PT Cipta Solusi Techindo",
    description: "Penyedia perangkat, solusi, dan layanan infrastruktur IT enterprise untuk bisnis modern.",
    phone: "+62 811-9000-221",
    email: "sales@cst.co.id",
  });

  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!hasSupabasePublicEnv()) {
        console.info("[homepage] Supabase env not found, using fallback data.");
        return;
      }

      try {
        const [brandRows, dellRows, categoryRows, featuredRows, bestSellerRows, bannerRows, sectionRows, settingRows] = await Promise.all([
          getBrands(),
          getBrandCatalog("dell-technologies"),
          getCategories(),
          getFeaturedProducts(),
          getBestSellerProducts(),
          getHomepageBanners(),
          getHomepageSections(),
          getCompanySettings(),
        ]);

        if (brandRows.length === 0) {
          console.info("[homepage] Supabase brands empty, fallback data is used.");
          return;
        }

        const mappedBrands = brandRows.map((row) => {
          if (row.slug === "dell-technologies") {
            return {
              name: row.name,
              catalog: dellRows.length > 0 ? dellRows : dellCatalog,
            };
          }

          return { name: row.name, catalog: comingSoonCatalog };
        });

        setBrands(mappedBrands);

        if (categoryRows.length > 0) {
          setCategories(categoryRows.map((row) => row.name));
        }

        if (featuredRows.length > 0) {
          setDealProducts(featuredRows.slice(0, 4));
          setFeaturedMini(featuredRows.slice(0, 4).map((row) => ({ name: row.name, price: row.price })));
        }

        if (bestSellerRows.length > 0) {
          setBestSellerGrid(bestSellerRows.slice(0, 10).map((row) => row.name));
        }

        if (bannerRows.length > 0) {
          const hero = bannerRows.find((row) => row.placement === "hero");
          if (hero) {
            setHeroBanner({
              title: hero.title,
              subtitle: hero.subtitle ?? heroBanner.subtitle,
              description: hero.description ?? heroBanner.description,
              ctaLabel: hero.cta_label ?? heroBanner.ctaLabel,
              priceText: hero.price_text ?? heroBanner.priceText,
            });
          }

          const side = bannerRows.filter((row) => row.placement === "side_promo").map((row) => row.title);
          if (side.length > 0) {
            setSidePromos(side.slice(0, 2));
          }

          const middle = bannerRows.find((row) => row.placement === "middle_promo");
          if (middle) {
            setMiddlePromo({
              title: middle.title,
              ctaLabel: middle.cta_label ?? middlePromo.ctaLabel,
              description: middle.description ?? middlePromo.description,
            });
          }
        }

        if (sectionRows.length === 0) {
          console.info("[homepage] Homepage sections empty, using default section labels.");
        }

        if (settingRows.length > 0) {
          const profile = settingRows.find((row) => row.key === "company_profile")?.value;
          const contact = settingRows.find((row) => row.key === "contact_info")?.value;

          setCompanyProfile((current) => ({
            name: typeof profile?.name === "string" ? profile.name : current.name,
            description: typeof profile?.description === "string" ? profile.description : current.description,
            phone: typeof contact?.phone === "string" ? contact.phone : current.phone,
            email: typeof contact?.email === "string" ? contact.email : current.email,
          }));
        }

        console.info("[homepage] Loaded homepage brand data from Supabase.");
      } catch {
        console.warn("[homepage] Failed loading Supabase data, fallback is used.");
      }
    };

    void loadSupabaseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sidebarBrands = brands.length > 0 ? brands : fallbackBrands;

  const toggleItem = (path: string) => {
    setExpandedItems((current) => ({
      ...current,
      [path]: !current[path],
    }));
  };

  const getLevelClass = (level: number, hasChildren: boolean, label: string) => {
    const isPlaceholder = label === "Product lines coming soon";
    if (isPlaceholder) return "text-xs italic text-slate-400";
    if (!hasChildren) return "text-sm font-normal text-slate-600";
    if (level === 0) return "text-sm font-semibold text-slate-900";
    if (level === 1) return "text-sm font-semibold text-slate-800";
    if (level === 2) return "text-sm font-medium text-slate-800";
    return "text-sm font-medium text-slate-700";
  };

  const getIndentClass = (level: number) => {
    if (level === 0) return "pl-4";
    if (level === 1) return "pl-5";
    if (level === 2) return "pl-7";
    if (level === 3) return "pl-9";
    if (level === 4) return "pl-11";
    return "pl-12";
  };

  const getRowPaddingClass = (hasChildren: boolean) => {
    return hasChildren ? "py-2" : "py-1.5";
  };

  const renderCatalog = (nodes: CatalogNode[], level = 0, parentPath = "dell") => {
    return (
      <ul className={`space-y-0.5 ${level > 0 ? "mt-1 border-l border-slate-200" : ""}`}>
        {nodes.map((node) => {
          const path = `${parentPath}/${node.name}`;
          const hasChildren = Boolean(node.children?.length);
          const isOpen = Boolean(expandedItems[path]);

          return (
            <li key={path}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleItem(path)}
                  className={`flex min-h-8 w-full items-center justify-between gap-2 rounded ${getIndentClass(level)} pr-2 ${getRowPaddingClass(
                    hasChildren,
                  )} text-left hover:bg-[#EAECED] ${getLevelClass(level, hasChildren, node.name)} ${
                    isOpen ? "bg-red-50/30" : ""
                  }`}
                  aria-expanded={isOpen}
                >
                  <span className="min-w-0 flex-1 break-words leading-snug">{node.name}</span>
                  <span className="w-4 shrink-0 text-right text-slate-400">{isOpen ? "▼" : "▶"}</span>
                </button>
              ) : (
                <div className={`min-h-7 ${getIndentClass(level)} ${getRowPaddingClass(hasChildren)} ${getLevelClass(level, hasChildren, node.name)}`}>
                  <span className="block min-w-0 break-words leading-snug">{node.name}</span>
                </div>
              )}
              {hasChildren && isOpen ? renderCatalog(node.children ?? [], level + 1, path) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  const benefits = [
    { title: "Free Delivery", desc: "Area coverage nasional" },
    { title: "Support 24/7", desc: "Tim teknis standby" },
    { title: "Payment", desc: "Metode pembayaran fleksibel" },
    { title: "Reliable", desc: "Produk enterprise teruji" },
    { title: "Guarantee", desc: "Garansi resmi distributor" },
  ];

  const safeMailto = `mailto:${companyProfile.email}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PT Cipta Solusi Techindo",
    url: siteUrl,
    email: "sales@cst.co.id",
    telephone: "+62 811-9000-221",
    address: {
      "@type": "PostalAddress",
      addressCountry: "ID",
    },
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PT Cipta Solusi Techindo",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <div className="border-b border-slate-200 bg-[#33414e] text-xs sm:text-sm">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-2 px-4 py-2">
          <p className="text-[#7cbfdb]">Call us for free: {companyProfile.phone}</p>
          <a href="/inquiry" className="font-medium text-white hover:text-slate-200">
            Free Consultation for Business IT
          </a>
          <div className="flex items-center gap-4">
            <a href="/inquiry" className="text-[#7cbfdb] hover:text-[#a6d8eb]">
              Language
            </a>
            <a href="/inquiry" className="font-medium text-[#e7000b] hover:text-[#ff3b45]">
              My account
            </a>
          </div>
        </div>
      </div>

      <header className="border-b border-slate-300 bg-[#EAECED]">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{companyProfile.name}</h1>

            <div className="flex w-full rounded-xl border border-slate-300 bg-[#EAECED] transition-colors hover:border-[#e7000b] focus-within:border-[#e7000b] focus-within:ring-1 focus-within:ring-[#e7000b] xl:max-w-3xl">
              <select className="w-36 border-r border-slate-300 bg-[#EAECED] px-3 text-sm text-slate-600 outline-none transition-colors hover:border-r-[#e7000b] focus:border-r-[#e7000b]">
                <option>All categories</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search for enterprise IT products"
                className="min-w-0 flex-1 border-l border-transparent bg-[#EAECED] px-4 py-3 text-sm outline-none transition-colors hover:border-l-[#e7000b] focus:border-l-[#e7000b]"
              />
              <button className="rounded-r-xl bg-[#e7000b] px-5 text-sm font-semibold text-white hover:bg-[#c9000a]">Search</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 sm:grid-cols-4 xl:flex xl:items-start xl:gap-10">
              <div className="flex min-h-[64px] flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Sales</p>
                <p className="whitespace-nowrap font-semibold">{companyProfile.phone}</p>
              </div>
              <div className="flex min-h-[64px] flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Email</p>
                <a
                  href={safeMailto}
                  aria-label="Email sales"
                  className="inline-flex items-center justify-center text-slate-700"
                >
                  <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none" aria-hidden="true">
                    <rect x="7" y="12" width="34" height="24" rx="4" stroke="#dc2626" strokeWidth="2.8" />
                    <path d="M10 15l14 11 14-11" stroke="#dc2626" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="16" y="19" width="16" height="11" rx="2" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.4" />
                    <text x="24" y="27" textAnchor="middle" fontSize="8" fontWeight="700" fill="#2563eb">
                      @
                    </text>
                  </svg>
                </a>
              </div>
              <div className="flex min-h-[64px] flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Account</p>
                <p className="whitespace-nowrap font-semibold">Sign In</p>
              </div>
              <div className="flex min-h-[64px] flex-col items-center gap-1 text-center">
                <p className="text-xs text-slate-500">Cart</p>
                <p className="whitespace-nowrap font-semibold">2 Items</p>
              </div>
            </div>
          </div>

          <nav className="mt-5 flex flex-wrap gap-6 border-t border-slate-300 bg-[#EAECED] pt-4 text-sm font-semibold text-slate-900">
            {["Home", "Shop", "Products", "Solutions", "Services", "Blog", "Contact"].map((item) => (
              <a
                key={item}
                href={item === "Contact" ? "/inquiry" : "#"}
                className={item === "Home" ? "text-[#e7000b] hover:text-[#e7000b]" : "text-slate-900 hover:text-[#e7000b]"}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-6">
        <section className="grid gap-4 xl:grid-cols-[260px_1fr_300px]">
          <aside className="overflow-hidden rounded-xl bg-white shadow-none">
            <div className="bg-red-600 px-4 py-3 text-sm font-semibold text-white">All Brands</div>
            <div className="max-h-[580px] overflow-y-auto">
              <ul className="divide-y divide-slate-100">
                {sidebarBrands.map((brand) => {
                  const isActive = brand.name === expandedBrand;
                  const hasCatalog = Boolean(brand.catalog?.length);

                  return (
                    <li key={brand.name} className={isActive ? "bg-red-50/30" : ""}>
                      <button
                        className="flex min-h-10 w-full items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-[#EAECED]"
                        type="button"
                        aria-expanded={isActive}
                        onClick={() => {
                          if (!hasCatalog) {
                            return;
                          }

                          setExpandedBrand((current) => (current === brand.name ? null : brand.name));
                        }}
                      >
                        <span className="min-w-0 flex-1">
                          <span className={`block break-words text-sm ${isActive ? "font-semibold text-red-700" : "font-semibold text-slate-800"}`}>
                            {brand.name}
                          </span>
                        </span>
                        {hasCatalog ? <span className="w-4 shrink-0 text-right text-slate-400">{isActive ? "▼" : "▶"}</span> : null}
                      </button>
                      {isActive && brand.catalog ? (
                        <div className="border-t border-slate-200 bg-white px-4 pb-3 pt-2">
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Product Lines</p>
                          {renderCatalog(brand.catalog)}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <article className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 p-6 text-white shadow-md">
            <p className="text-xs uppercase tracking-[0.2em] text-blue-200">{heroBanner.title}</p>
            <h2 className="mt-2 max-w-md text-3xl font-bold leading-tight">{heroBanner.subtitle}</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-200">{heroBanner.description}</p>
            <p className="mt-3 text-sm text-slate-200">{heroBanner.priceText}</p>
            <a href="/inquiry" className="mt-5 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-700">
              {heroBanner.ctaLabel}
            </a>
            <div className="mt-6 h-40 rounded-lg border border-white/20 bg-white/10 p-4 text-center text-sm text-blue-100 sm:absolute sm:bottom-6 sm:right-6 sm:mt-0 sm:w-72">
              Main Banner Image
            </div>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {sidePromos.map((item) => (
              <article key={item} className="rounded-xl bg-white p-4 shadow-none">
                <div className="mb-3 inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">SALE</div>
                <h3 className="font-bold text-slate-900">{item}</h3>
                <div className="mt-3 h-24 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 p-3 text-center text-xs text-slate-600">
                  Promo Image
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {benefits.map((item) => (
            <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.desc}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">
            Deal Of The Day <span className="text-red-600">🔥</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dealProducts.map((product) => (
              <article key={product.name} className="rounded-xl border border-slate-200 p-4">
                <div className="mb-3 inline-block rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white">SALE</div>
                <div className="h-36 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 p-4 text-center text-sm text-slate-600">
                  Product Image
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1">
                  {[1, 2, 3, 4].map((thumb) => (
                    <div key={thumb} className="h-8 rounded bg-slate-200 text-center text-[10px] leading-8 text-slate-500">
                      Img
                    </div>
                  ))}
                </div>
                <h4 className="mt-3 text-sm font-semibold">{product.name}</h4>
                <p className="text-xs text-slate-500">{product.category}</p>
                <div className="mt-2 flex items-center gap-2">
                  <p className="text-sm font-bold text-red-600">{product.newPrice}</p>
                  <p className="text-xs text-slate-400 line-through">{product.oldPrice}</p>
                </div>
                <div className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {product.save}
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-2/3 rounded-full bg-blue-700" />
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50">Detail</button>
                  <button className="flex-1 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800">
                    Add to Cart
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl bg-gradient-to-r from-blue-900 via-blue-700 to-slate-800 p-6 text-white shadow-md">
          <h2 className="text-2xl font-bold">{middlePromo.title}</h2>
          <a href="/inquiry" className="mt-4 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-700">
            {middlePromo.ctaLabel}
          </a>
          <div className="mt-4 h-24 rounded-lg bg-white/15 p-3 text-center text-sm text-blue-100">{middlePromo.description || "Banner Image"}</div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {["Feature", "Toprate", "On Sale"].map((tab, idx) => (
              <button
                key={tab}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold ${idx === 0 ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr_1fr]">
            <div className="space-y-3">
              {featuredMini.slice(0, 2).map((item) => (
                <article key={`left-${item.name}`} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                  <div className="h-14 w-14 rounded bg-slate-200 text-center text-[10px] leading-[56px] text-slate-600">Product Image</div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-blue-700">{item.price}</p>
                  </div>
                </article>
              ))}
            </div>
            <article className="rounded-xl border border-slate-200 p-4">
              <div className="h-44 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 p-4 text-center text-sm text-slate-600">
                Product Image
              </div>
              <p className="mt-3 text-sm font-semibold">Enterprise Performance Bundle</p>
              <p className="mt-1 text-xs text-slate-500">Server + Storage + Network Kit</p>
            </article>
            <div className="space-y-3">
              {featuredMini.slice(2).map((item) => (
                <article key={`right-${item.name}`} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                  <div className="h-14 w-14 rounded bg-slate-200 text-center text-[10px] leading-[56px] text-slate-600">Product Image</div>
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-blue-700">{item.price}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Best Seller</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {bestSellerGrid.map((item) => (
              <article key={item} className="rounded-lg border border-slate-200 p-3">
                <div className="h-24 rounded bg-gradient-to-br from-slate-200 to-slate-300 p-3 text-center text-xs text-slate-600">
                  Product Image
                </div>
                <p className="mt-2 text-sm font-semibold">{item}</p>
                <p className="text-xs text-slate-500">Rp 3.200.000 - Rp 58.000.000</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-2xl font-bold">Need Complete IT Infrastructure for Your Business?</h2>
          <p className="mx-auto mt-2 max-w-3xl text-sm text-slate-600">
            Konsultasikan kebutuhan server, storage, networking, endpoint, dan security untuk perusahaan Anda.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a href="/inquiry" className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
              Konsultasi Sekarang
            </a>
            <button className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              Lihat Katalog
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
        <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <h4 className="text-lg font-bold text-white">{companyProfile.name}</h4>
            <p className="mt-2 text-sm">{companyProfile.description}</p>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-white">Product Categories</h5>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Server</li>
              <li>Storage</li>
              <li>Networking</li>
              <li>Workstation</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-white">Customer Care</h5>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Track Order</li>
              <li>Warranty</li>
              <li>Help Center</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-white">Business Solutions</h5>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Office IT</li>
              <li>Data Center</li>
              <li>Network Security</li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-white">Contact</h5>
            <p className="mt-2 text-sm">{companyProfile.email}</p>
            <p className="text-sm">{companyProfile.phone}</p>
            <div className="mt-3 rounded bg-white/10 px-3 py-2 text-xs">Newsletter Subscribe Placeholder</div>
          </div>
        </div>
        <div className="border-t border-slate-800 px-4 py-4 text-center text-xs">
          Copyright {new Date().getFullYear()} PT Cipta Solusi Techindo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
