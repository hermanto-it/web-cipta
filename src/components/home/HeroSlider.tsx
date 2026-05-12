"use client";

import { useEffect, useState } from "react";

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  priceText: string;
  imageUrl: string | null;
};

type HeroSliderProps = {
  slides: HeroSlide[];
};

const AUTO_SLIDE_MS = 4500;

export function HeroSlider({ slides }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const canSlide = slides.length > 1;

  useEffect(() => {
    if (!canSlide) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_SLIDE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [canSlide, slides.length]);

  const activeSlide = slides[activeIndex] ?? slides[0];
  if (!activeSlide) return null;

  return (
    <article className="relative aspect-[16/9] overflow-hidden rounded-2xl shadow-md sm:aspect-[1920/700] lg:aspect-auto lg:min-h-[430px] xl:min-h-[460px]">
      {activeSlide.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={activeSlide.imageUrl} alt={activeSlide.title || "Homepage hero banner"} className="absolute inset-0 h-full w-full object-cover object-center" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800" aria-hidden="true" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/72 via-slate-900/38 to-transparent" aria-hidden="true" />

      <div className="relative z-10 flex h-full flex-col justify-end p-5 text-white sm:p-7">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-200">{activeSlide.title}</p>
        <h2 className="mt-2 max-w-xl text-2xl font-bold leading-tight sm:text-3xl">{activeSlide.subtitle}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-100">{activeSlide.description}</p>
        <p className="mt-3 text-sm text-slate-100">{activeSlide.priceText}</p>
        <a href={activeSlide.ctaHref} className="mt-5 inline-block w-fit rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold hover:bg-red-700">
          {activeSlide.ctaLabel}
        </a>
      </div>

      {canSlide ? (
        <>
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-1">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Slide ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-2 w-2 rounded-full transition ${index === activeIndex ? "bg-white" : "bg-white/45 hover:bg-white/80"}`}
              />
            ))}
          </div>

          <div className="absolute inset-x-0 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-between px-3 sm:flex">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => setActiveIndex((current) => (current - 1 + slides.length) % slides.length)}
              className="rounded-full bg-black/35 px-2.5 py-1.5 text-white transition hover:bg-black/55"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => setActiveIndex((current) => (current + 1) % slides.length)}
              className="rounded-full bg-black/35 px-2.5 py-1.5 text-white transition hover:bg-black/55"
            >
              ›
            </button>
          </div>
        </>
      ) : null}
    </article>
  );
}
