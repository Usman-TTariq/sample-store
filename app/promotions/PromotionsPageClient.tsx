'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Newsletter from '@/app/components/Newsletter';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import StoreLogo from '@/app/components/StoreLogo';
import SearchSuggestionsDropdown from '@/app/components/SearchSuggestionsDropdown';
import { useSearchSuggestions } from '@/lib/hooks/useSearchSuggestions';
import { getActiveCoupons, Coupon } from '@/lib/services/couponService';
import { getStores, Store } from '@/lib/services/storeService';
import { siteConfig } from '@/lib/seo/config';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=700&fit=crop&q=85&auto=format';
const PAGE_SIZE = 20;

function formatExpiry(date?: string | null) {
  if (!date) return 'No expiry';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'No expiry';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function CouponCard({ coupon, store }: { coupon: Coupon; store?: Store }) {
  const label =
    coupon.couponType === 'code' && coupon.code
      ? coupon.getCodeText || 'Get Code'
      : coupon.getDealText || 'Get Deal';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col h-full hover:border-[#FFD23F] hover:shadow-lg transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
          {coupon.logoUrl || store?.logoUrl ? (
            <img
              src={coupon.logoUrl || store?.logoUrl}
              alt=""
              className="w-9 h-9 object-contain"
            />
          ) : store ? (
            <StoreLogo
              name={store.name}
              logoUrl={store.logoUrl}
              websiteUrl={store.websiteUrl}
              trackingLink={store.trackingLink}
              className="w-9 h-9"
            />
          ) : (
            <span className="text-xs font-bold text-gray-400">{coupon.storeName?.charAt(0) || '?'}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#B8860B] uppercase tracking-wide truncate">
            {coupon.storeName || 'Store'}
          </p>
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug">
            {coupon.description || coupon.code || 'Special offer'}
          </h3>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-4 flex-1">
        Expires: {formatExpiry(coupon.expiryDate)}
      </p>
      <a
        href={coupon.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-[#FFD23F] hover:bg-black hover:text-white text-black font-bold text-sm py-2.5 rounded-lg transition-colors"
      >
        {label}
      </a>
    </div>
  );
}

function StoreTile({ store }: { store: Store }) {
  const href = store.slug ? `/stores/${store.slug}` : `/stores/${store.id}`;
  return (
    <Link
      href={href}
      className="group bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center hover:border-[#FFD23F] hover:shadow-md transition-all"
    >
      <div className="w-14 h-14 mb-2">
        <StoreLogo
          name={store.name}
          logoUrl={store.logoUrl}
          websiteUrl={store.websiteUrl}
          trackingLink={store.trackingLink}
          className="w-full h-full"
        />
      </div>
      <span className="text-xs font-semibold text-gray-800 group-hover:text-[#B8860B] truncate w-full">
        {store.name}
      </span>
    </Link>
  );
}

export default function PromotionsPageClient() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [page, setPage] = useState(1);
  const { results: searchResults, loading: searchLoading } = useSearchSuggestions(searchQuery);

  useEffect(() => {
    Promise.all([getActiveCoupons(), getStores()])
      .then(([c, s]) => {
        setCoupons(c);
        setStores(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const storeByName = useMemo(() => {
    const map = new Map<string, Store>();
    stores.forEach((s) => map.set(s.name.toLowerCase(), s));
    return map;
  }, [stores]);

  const popularCoupons = useMemo(() => {
    const popular = coupons.filter((c) => c.isPopular);
    return (popular.length >= 6 ? popular : coupons).slice(0, 6);
  }, [coupons]);

  const topStores = useMemo(() => {
    const trending = stores.filter((s) => s.isTrending);
    return (trending.length >= 12 ? trending : stores).slice(0, 12);
  }, [stores]);

  const totalPages = Math.max(1, Math.ceil(coupons.length / PAGE_SIZE));
  const pagedCoupons = coupons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="full" />
      <Breadcrumbs items={[{ label: 'Promotions' }]} />

      {/* Hero */}
      <section className="bg-gradient-to-r from-[#FFFBF0] via-white to-[#FFFBF0] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-sm font-bold text-[#B8860B] uppercase tracking-widest mb-3">
                Verified Deals Daily
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4">
                Discover The Best Affiliate{' '}
                <span className="text-[#B8860B]">Coupons</span>
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mb-6 max-w-lg">
                Browse verified promo codes and exclusive deals from top stores. Save more on every purchase with {siteConfig.name}.
              </p>
              <form onSubmit={handleHeroSearch} className="relative max-w-xl">
                <div className="flex items-center bg-white rounded-full border-2 border-[#FFD23F]/40 shadow-sm pl-4 pr-1 py-1">
                  <Search className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="search"
                    name="q"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Search stores, coupons..."
                    className="flex-1 min-w-0 px-3 py-2.5 bg-transparent outline-none text-gray-900 text-sm"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="shrink-0 bg-[#FFD23F] hover:bg-black hover:text-white text-black font-bold text-sm px-6 py-2.5 rounded-full transition-colors"
                  >
                    Search
                  </button>
                </div>
                <SearchSuggestionsDropdown
                  query={searchQuery}
                  results={searchResults}
                  show={showSuggestions && searchQuery.trim().length > 0}
                  loading={searchLoading}
                  onClose={() => setShowSuggestions(false)}
                />
              </form>
            </div>
            <div className="relative hidden sm:block">
              <div className="relative aspect-[4/3] max-w-md ml-auto rounded-2xl overflow-hidden shadow-xl ring-1 ring-gray-200/80">
                <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Loading deals...</div>
      ) : (
        <>
          {/* Popular Coupons */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Popular Coupons</h2>
              <Link href="/coupons" className="text-sm font-semibold text-[#B8860B] hover:text-black hover:underline flex items-center gap-1">
                View More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {popularCoupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  store={coupon.storeName ? storeByName.get(coupon.storeName.toLowerCase()) : undefined}
                />
              ))}
            </div>
          </section>

          {/* Top Stores */}
          <section className="bg-[#FFFBF0] border-y border-[#FFD23F]/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900">Top Stores</h2>
                <Link href="/stores" className="text-sm font-semibold text-[#B8860B] hover:text-black hover:underline flex items-center gap-1">
                  View More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4">
                {topStores.map((store) => (
                  <StoreTile key={store.id} store={store} />
                ))}
              </div>
            </div>
          </section>

          {/* All Coupons & Deals */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">All Coupons &amp; Deals</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
              {pagedCoupons.map((coupon) => {
                const store = coupon.storeName
                  ? storeByName.get(coupon.storeName.toLowerCase())
                  : undefined;
                const storeHref = store
                  ? store.slug
                    ? `/stores/${store.slug}`
                    : `/stores/${store.id}`
                  : '/stores';
                return (
                  <Link
                    key={coupon.id}
                    href={storeHref}
                    className="group bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center hover:border-[#FFD23F] hover:shadow-md transition-all"
                  >
                    <div className="w-16 h-16 mb-3">
                      {store ? (
                        <StoreLogo
                          name={store.name}
                          logoUrl={store.logoUrl || coupon.logoUrl}
                          websiteUrl={store.websiteUrl}
                          trackingLink={store.trackingLink}
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                          {coupon.storeName?.substring(0, 2).toUpperCase() || 'DE'}
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-1 mb-1 group-hover:text-[#B8860B]">
                      {coupon.storeName || 'Deal'}
                    </h3>
                    <p className="text-[11px] text-gray-500 mb-2">{formatExpiry(coupon.expiryDate)}</p>
                    <span className="text-xs font-semibold text-[#B8860B] group-hover:underline">
                      View coupons →
                    </span>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`min-w-[36px] h-9 rounded-lg text-sm font-semibold ${
                      page === p
                        ? 'bg-[#FFD23F] text-black'
                        : 'border border-gray-200 text-gray-700 hover:bg-[#FFFBF0]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                {totalPages > 5 && <span className="text-gray-400 px-1">…</span>}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </section>
        </>
      )}

      <Newsletter />
      <Footer />
    </div>
  );
}
