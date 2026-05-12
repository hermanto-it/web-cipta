import Image from "next/image";

export type HomepageProductCardData = {
  name: string;
  slug: string;
  categoryLabel: string;
  imageUrl: string | null;
  featureChips: string[];
  summary: string;
  displayPrice: string;
  compareAtPrice: string | null;
  statusStrip: string;
};

type HomepageProductCardProps = {
  product: HomepageProductCardData;
};

export function HomepageProductCard({ product }: HomepageProductCardProps) {
  const hasImage = Boolean(product.imageUrl);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="px-4 pt-4">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
          <span aria-hidden="true">◉</span>
          {product.categoryLabel}
        </p>
      </div>

      <div className="px-4 pt-3">
        <div className={`relative aspect-[3/2] w-full overflow-hidden rounded-xl border border-slate-100 ${hasImage ? "bg-transparent" : "bg-[#f8fafc]"}`}>
          {hasImage ? (
            <Image
              src={product.imageUrl as string}
              alt={product.name}
              fill
              sizes="(min-width:1280px) 24vw, (min-width:768px) 45vw, 100vw"
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 text-xs font-medium text-slate-600">
              Product Image
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3">
        <h3 className="line-clamp-4 text-base font-bold leading-snug text-slate-900">{product.name}</h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.featureChips.slice(0, 4).map((chip) => (
            <span key={chip} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
              <span aria-hidden="true">•</span>
              {chip}
            </span>
          ))}
        </div>

        <p className="mt-3 line-clamp-3 text-sm text-slate-600">{product.summary}</p>

        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Price</p>
          <p className="text-xl font-bold text-[#0f3a66]">{product.displayPrice}</p>
          {product.compareAtPrice ? <p className="text-xs text-slate-400 line-through">{product.compareAtPrice}</p> : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={product.slug ? `/products/${product.slug}` : "/inquiry"} className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#0f3a66] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0b2f53]">
            <span aria-hidden="true">✦</span>
            Request Quotation
          </a>
          <a href={product.slug ? `/products/${product.slug}` : "/inquiry"} className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#0f3a66] px-3 py-2 text-xs font-semibold text-[#0f3a66] hover:bg-blue-50">
            <span aria-hidden="true">➜</span>
            View Details
          </a>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-600">{product.statusStrip}</div>
    </article>
  );
}
