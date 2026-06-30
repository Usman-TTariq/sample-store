import Link from 'next/link';
import { siteConfig } from '@/lib/seo/config';

const PROMO_IMAGE =
  'https://images.unsplash.com/photo-1607083207637-9a4425162f8f?w=1600&h=520&fit=crop&q=85&auto=format';

export default function HomePromoBanner() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg ring-1 ring-gray-200/80">
      <div className="relative w-full min-h-[220px] sm:min-h-[260px] md:min-h-[300px] aspect-[4/3] sm:aspect-[1728/547]">
        <img
          src={PROMO_IMAGE}
          alt="Exclusive deals and verified coupons"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111]/95 via-[#111111]/80 to-[#111111]/25 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/40 via-transparent to-transparent sm:hidden" />

        <div className="relative z-10 flex h-full flex-col justify-center px-5 py-8 sm:px-10 sm:py-10 md:px-14 max-w-2xl">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#FFD23F] mb-2 sm:mb-3">
            {siteConfig.name}
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-2 sm:mb-3">
            Save More on Every{' '}
            <span className="text-[#FFD23F]">Purchase</span>
          </h2>
          <p className="text-sm sm:text-base text-white/85 leading-relaxed mb-5 sm:mb-6 max-w-md">
            Verified promo codes, exclusive cashback offers, and expert savings guides — all in one place.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/stores"
              className="inline-flex items-center justify-center rounded-full bg-[#FFD23F] px-5 py-2.5 text-sm font-bold text-[#111111] hover:bg-white transition-colors"
            >
              Browse Stores
            </Link>
            <Link
              href="/blogs"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#ffd23f] hover:text-[#111111] transition-colors"
            >
              Read Savings Guides
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
