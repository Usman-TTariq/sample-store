"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { getBannersWithLayout, Banner } from "@/lib/services/bannerService";
import { HERO_IMAGES, CATEGORY_CARDS } from "@/lib/data/homeAssets";

export default function MultiPanelHero({ initialBanners }: { initialBanners?: (Banner | null)[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [banners, setBanners] = useState<(Banner | null)[]>(initialBanners || Array(4).fill(null));
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (initialBanners) return;
    getBannersWithLayout()
      .then(setBanners)
      .catch((e) => console.error("Error fetching banners:", e));
  }, [initialBanners]);

  const getImage = (banner: Banner | null, index: number) =>
    banner?.imageUrl || HERO_IMAGES[index % HERO_IMAGES.length];

  const heroSlides = [
    {
      badge: "Summer deals up to 60% off",
      title: "Save More on Every Purchase",
      subtitle: "Verified promo codes and exclusive deals from thousands of stores.",
      cta: { label: "Browse Deals", href: "/coupons" },
      imageIndices: [0, 1] as const,
    },
    {
      badge: "New codes added daily",
      title: "Today's Best Coupon Codes",
      subtitle: "Hand-picked offers from top brands you love.",
      cta: { label: "View Stores", href: "/stores" },
      imageIndices: [2, 3] as const,
    },
    {
      badge: "100% verified deals",
      title: "Shop Smarter, Spend Less",
      subtitle: "Find cashback and coupon codes that actually work.",
      cta: { label: "Get Started", href: "/coupons" },
      imageIndices: [4, 5] as const,
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const slide = heroSlides[currentSlide];

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden border-b border-gray-200 bg-gradient-to-br from-[#FFFBF0] via-white to-[#FFF8E1]"
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#FFD23F]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#1D63FF]/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row gap-5 md:gap-6 min-h-[300px] md:min-h-[360px]">
          {/* Left: text + CTA */}
          <motion.div
            key={`text-${currentSlide}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:flex-[5] flex flex-col justify-center p-7 md:p-9 rounded-2xl border border-white/80 bg-white/70 backdrop-blur-sm shadow-lg shadow-[#FFD23F]/10"
          >
            <span className="inline-flex w-fit items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1D63FF] mb-4 px-3 py-1 rounded-full bg-[#1D63FF]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1D63FF] animate-pulse" />
              {slide.badge}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] mb-4">
              {slide.title}
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-md mb-7 leading-relaxed">
              {slide.subtitle}
            </p>
            <Link
              href={slide.cta.href}
              className="inline-flex w-fit items-center gap-2 bg-[#FFD23F] hover:bg-black hover:text-white text-black font-bold px-7 py-3.5 rounded-full text-sm shadow-md shadow-[#FFD23F]/30 hover:shadow-lg transition-all hover:-translate-y-0.5"
            >
              {slide.cta.label}
              <span aria-hidden>→</span>
            </Link>
          </motion.div>

          {/* Right: hero image + category mini-grid */}
          <div className="lg:flex-[6] flex flex-col sm:flex-row gap-4">
            <motion.div
              key={`hero-img-${currentSlide}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45 }}
              className="sm:flex-1 relative rounded-2xl overflow-hidden min-h-[200px] sm:min-h-full shadow-xl group"
            >
              <img
                src={getImage(banners[slide.imageIndices[0]], slide.imageIndices[0])}
                alt="Featured deals"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white font-bold text-sm drop-shadow">Trending this week</p>
                <p className="text-white/80 text-xs">Up to 70% off top brands</p>
              </div>
            </motion.div>

            <div className="sm:flex-1 grid grid-cols-2 gap-3">
              {CATEGORY_CARDS.map((cat) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className="relative rounded-xl overflow-hidden group min-h-[90px] sm:min-h-0 shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-lg leading-none">{cat.emoji}</span>
                    <p className="text-white text-[11px] font-bold mt-0.5 leading-tight">{cat.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentSlide ? "w-10 bg-[#FFD23F] shadow-sm" : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
