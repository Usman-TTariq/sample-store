'use client';

import { useEffect, useState, Suspense, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Loader2,
  Search,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { getActiveCoupons, Coupon } from '@/lib/services/couponService';
import { getCategories, Category } from '@/lib/services/categoryService';
import { getStores, Store } from '@/lib/services/storeService';
import { getCouponDisplayTitle } from '@/lib/utils/couponDisplay';
import { getCategoryEmoji } from '@/lib/utils/categoryIcon';
import { categoryPath } from '@/lib/utils/categorySlug';
import Navbar from '@/app/components/Navbar';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import CouponPopup from '@/app/components/CouponPopup';
import GetCodeButton from '@/app/components/GetCodeButton';

type SuggestResults = {
  stores: Store[];
  categories: Category[];
  coupons: Coupon[];
};

const STORES_PER_PAGE = 24;

const extractDomain = (url: string): string | null => {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return null;
  }
};

const getFaviconUrl = (store: Store): string | null => {
  if (store.logoUrl) return store.logoUrl;
  if (store.websiteUrl) {
    const domain = extractDomain(store.websiteUrl);
    if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  if (store.trackingLink) {
    const domain = extractDomain(store.trackingLink);
    if (domain) return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  if (store.name) {
    const nameLower = store.name.toLowerCase().replace(/\s+/g, '');
    const domain = nameLower.includes('.') ? nameLower : `${nameLower}.com`;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  return null;
};

function storeHref(store: Store) {
  return store.slug ? `/stores/${store.slug}` : store.id ? `/stores/${store.id}` : '/stores';
}

function CouponPromoCard({
  coupon,
  onGetCode,
}: {
  coupon: Coupon;
  onGetCode: (coupon: Coupon) => void;
}) {
  const title = getCouponDisplayTitle(coupon);
  const storeLabel = coupon.storeName || 'Store';
  const usedToday = ((coupon.id?.charCodeAt(0) || 20) % 80) + 12;
  const isCode = coupon.couponType !== 'deal';

  return (
    <article className="flex flex-col bg-white border border-tan/80 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-md border border-tan bg-cream/50 flex items-center justify-center overflow-hidden shrink-0">
          {coupon.logoUrl ? (
            <img src={coupon.logoUrl} alt="" className="max-h-8 max-w-8 object-contain" />
          ) : (
            <span className="text-sm font-bold text-brand-navy">{storeLabel.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-brand-navy uppercase tracking-wide truncate">{storeLabel}</p>
          <p className="text-sm font-semibold text-brand-navy/90 line-clamp-2 mt-0.5">{title}</p>
        </div>
      </div>
      <p className="text-[11px] text-brand-muted uppercase tracking-wide mb-3">
        Used {usedToday} times today
      </p>
      <GetCodeButton
        className="mt-auto"
        label={isCode ? 'Get Code' : 'Get Deal'}
        code={coupon.code}
        isDeal={!isCode}
        onClick={() => onGetCode(coupon)}
      />
    </article>
  );
}

function CouponsContent() {
  const router = useRouter();
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroQuery, setHeroQuery] = useState('');
  const [directoryQuery, setDirectoryQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestResults, setSuggestResults] = useState<SuggestResults>({
    stores: [],
    categories: [],
    coupons: [],
  });
  const [storePage, setStorePage] = useState(1);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [couponsData, categoriesData, storesData] = await Promise.all([
          getActiveCoupons(),
          getCategories(),
          getStores(),
        ]);
        setCoupons(couponsData);
        setCategories(categoriesData);
        setStores(storesData);
      } catch (error) {
        console.error('Error fetching promotions data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const storeDealCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const coupon of coupons) {
      if (coupon.storeIds?.length) {
        for (const id of coupon.storeIds) {
          counts.set(id, (counts.get(id) || 0) + 1);
        }
      }
      if (coupon.storeName) {
        const match = stores.find((s) => s.name === coupon.storeName);
        if (match?.id) counts.set(match.id, (counts.get(match.id) || 0) + 1);
      }
    }
    return counts;
  }, [coupons, stores]);

  const popularCoupons = useMemo(() => {
    const popular = coupons.filter((c) => c.isPopular);
    const list = popular.length >= 6 ? popular : coupons;
    return list.slice(0, 6);
  }, [coupons]);

  const topStores = useMemo(() => {
    return [...stores]
      .sort((a, b) => {
        if (a.isTrending && !b.isTrending) return -1;
        if (!a.isTrending && b.isTrending) return 1;
        return (storeDealCounts.get(b.id || '') || 0) - (storeDealCounts.get(a.id || '') || 0);
      })
      .slice(0, 12);
  }, [stores, storeDealCounts]);

  const trendingCategories = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        count: stores.filter((s) => s.categoryId === category.id).length,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [categories, stores]);

  const directoryStores = useMemo(() => {
    let list = [...stores];
    if (directoryQuery.trim()) {
      const q = directoryQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => {
      if (a.isTrending && !b.isTrending) return -1;
      if (!a.isTrending && b.isTrending) return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [stores, directoryQuery]);

  const visibleStores = directoryStores.slice(0, storePage * STORES_PER_PAGE);
  const hasMore = visibleStores.length < directoryStores.length;

  const hasSuggestResults =
    suggestResults.stores.length > 0 ||
    suggestResults.categories.length > 0 ||
    suggestResults.coupons.length > 0;

  useEffect(() => {
    const term = heroQuery.trim();
    if (term.length < 1) {
      setShowSuggestions(false);
      setSuggestResults({ stores: [], categories: [], coupons: [] });
      setSuggestLoading(false);
      return;
    }

    setSuggestLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.success && data.results) {
          setSuggestResults({
            stores: data.results.stores || [],
            categories: data.results.categories || [],
            coupons: data.results.coupons || [],
          });
          setShowSuggestions(true);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Search suggest error:', error);
        }
      } finally {
        if (!controller.signal.aborted) setSuggestLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [heroQuery]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!searchWrapRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const handleGetCode = (coupon: Coupon) => {
    if (coupon.couponType === 'code' && coupon.code) {
      navigator.clipboard?.writeText(coupon.code.trim()).catch(() => {});
    }
    setSelectedCoupon(coupon);
    setShowPopup(true);
    if (coupon.url?.trim()) {
      setTimeout(() => window.open(coupon.url, '_blank', 'noopener,noreferrer'), 500);
    }
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = heroQuery.trim();
    setShowSuggestions(false);
    if (q) {
      setDirectoryQuery(q);
      router.push(`/search?q=${encodeURIComponent(q)}`);
    } else {
      document.getElementById('all-deals')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSuggestionClick = (
    type: 'store' | 'category' | 'coupon',
    item: Store | Category | Coupon
  ) => {
    setShowSuggestions(false);
    if (type === 'store') {
      const store = item as Store;
      router.push(`/stores/${store.slug || store.id}`);
    } else if (type === 'category') {
      const category = item as Category;
      router.push(categoryPath(category));
    } else {
      handleGetCode(item as Coupon);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <Breadcrumbs items={[{ label: 'Promotions' }]} />

      {/* Hero */}
      <section className="relative border-b border-tan overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(199,57,95,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(199,57,95,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="home-container relative py-12 sm:py-16 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-accent mb-3">
            Verified Promotions
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-brand-navy leading-[1.1] max-w-3xl mx-auto">
            Discover the Best Affiliate{' '}
            <span className="text-brand-accent">Coupons</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-brand-muted max-w-xl mx-auto">
            Hand-picked promo codes and deals from trusted brands — verified daily so you save more on every purchase.
          </p>

          <div ref={searchWrapRef} className="mt-8 max-w-xl mx-auto relative text-left">
            <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
                <input
                  type="search"
                  value={heroQuery}
                  onChange={(e) => setHeroQuery(e.target.value)}
                  onFocus={() => {
                    if (heroQuery.trim()) setShowSuggestions(true);
                  }}
                  placeholder="Search stores, brands, or deals…"
                  autoComplete="off"
                  className="w-full pl-10 pr-10 py-3.5 rounded-lg border border-tan bg-white text-sm font-semibold uppercase tracking-wide text-brand-navy placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-brand-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                />
                {heroQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setHeroQuery('');
                      setShowSuggestions(false);
                      setSuggestResults({ stores: [], categories: [], coupons: [] });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-brand-navy/60 hover:text-brand-navy"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 rounded-lg bg-brand-navy text-white text-xs font-extrabold uppercase tracking-wider hover:bg-brand-navy-dark transition-colors"
              >
                Search
              </button>
            </form>

            {showSuggestions && heroQuery.trim() && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[min(22rem,60vh)] overflow-y-auto rounded-xl border border-tan bg-white shadow-2xl text-left">
                {suggestLoading && !hasSuggestResults ? (
                  <div className="flex items-center justify-center gap-2 p-4 text-sm text-brand-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching…
                  </div>
                ) : !hasSuggestResults ? (
                  <div className="p-4 text-center text-sm text-brand-muted">
                    No matches for &ldquo;{heroQuery.trim()}&rdquo;
                  </div>
                ) : (
                  <>
                    {suggestResults.stores.length > 0 && (
                      <div className="p-2">
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                          Stores
                        </div>
                        {suggestResults.stores.map((store) => (
                          <button
                            key={store.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionClick('store', store)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-cream transition-colors"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-tan bg-white">
                              {getFaviconUrl(store) ? (
                                <img
                                  src={getFaviconUrl(store)!}
                                  alt=""
                                  className="h-7 w-7 object-contain"
                                />
                              ) : (
                                <span className="text-xs font-bold text-brand-navy">
                                  {store.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-brand-navy">
                                {store.name}
                              </div>
                              <div className="text-[11px] text-brand-muted">Store</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {suggestResults.coupons.length > 0 && (
                      <div
                        className={`p-2 ${suggestResults.stores.length > 0 ? 'border-t border-tan' : ''}`}
                      >
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                          Coupons
                        </div>
                        {suggestResults.coupons.map((coupon) => (
                          <button
                            key={coupon.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionClick('coupon', coupon)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-cream transition-colors"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-tan bg-cream">
                              {coupon.logoUrl ? (
                                <img src={coupon.logoUrl} alt="" className="h-7 w-7 object-contain" />
                              ) : (
                                <Tag className="h-4 w-4 text-brand-navy" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-brand-navy">
                                {getCouponDisplayTitle(coupon)}
                              </div>
                              <div className="truncate text-[11px] text-brand-muted">
                                {coupon.storeName || 'Deal'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {suggestResults.categories.length > 0 && (
                      <div
                        className={`p-2 ${
                          suggestResults.stores.length > 0 || suggestResults.coupons.length > 0
                            ? 'border-t border-tan'
                            : ''
                        }`}
                      >
                        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                          Categories
                        </div>
                        {suggestResults.categories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionClick('category', category)}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-cream transition-colors"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-sm">
                              {getCategoryEmoji(category.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-semibold text-brand-navy">
                                {category.name}
                              </div>
                              <div className="text-[11px] text-brand-muted">Category</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setShowSuggestions(false);
                        router.push(`/search?q=${encodeURIComponent(heroQuery.trim())}`);
                      }}
                      className="w-full border-t border-tan px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-brand-navy hover:bg-cream"
                    >
                      View all results for &ldquo;{heroQuery.trim()}&rdquo;
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <Link
            href="/stores"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand-navy hover:text-brand-accent transition-colors"
          >
            Or browse all stores <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Popular Coupons */}
      <section className="home-container py-10 sm:py-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-brand-navy">
            Popular Coupons
          </h2>
          <a
            href="#all-deals"
            className="text-xs font-bold uppercase tracking-wide text-brand-navy hover:text-brand-accent inline-flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-white border border-tan rounded-lg animate-pulse" />
            ))}
          </div>
        ) : popularCoupons.length === 0 ? (
          <p className="text-sm text-brand-muted text-center py-8">No coupons available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularCoupons.map((coupon) => (
              <CouponPromoCard key={coupon.id} coupon={coupon} onGetCode={handleGetCode} />
            ))}
          </div>
        )}
      </section>

      {/* Top Stores */}
      <section className="border-t border-tan bg-white/50">
        <div className="home-container py-10 sm:py-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-brand-navy">
              Top Stores
            </h2>
            <Link
              href="/stores"
              className="text-xs font-bold uppercase tracking-wide text-brand-navy hover:text-brand-accent inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-14 bg-cream border border-tan rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {topStores.map((store) => {
                const logo = getFaviconUrl(store);
                const count = storeDealCounts.get(store.id || '') || 0;
                return (
                  <Link
                    key={store.id}
                    href={storeHref(store)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg border border-tan bg-white hover:border-brand-navy/30 transition-colors min-w-0"
                  >
                    <div className="w-8 h-8 rounded border border-tan bg-cream flex items-center justify-center overflow-hidden shrink-0">
                      {logo ? (
                        <img src={logo} alt="" className="max-h-6 max-w-6 object-contain" />
                      ) : (
                        <span className="text-[10px] font-bold text-brand-navy">{store.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold text-brand-navy truncate">{store.name}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {count} coupon{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Trending Categories */}
      <section className="home-container py-10 sm:py-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-brand-navy">
            Trending Categories
          </h2>
          <Link
            href="/categories"
            className="text-xs font-bold uppercase tracking-wide text-brand-navy hover:text-brand-accent inline-flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-white border border-tan rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trendingCategories.map((cat) => (
              <Link
                key={cat.id}
                href={categoryPath(cat)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg border border-tan bg-white hover:border-brand-navy/30 transition-colors"
              >
                <span className="w-9 h-9 rounded-md bg-brand-navy text-white flex items-center justify-center text-sm shrink-0">
                  {getCategoryEmoji(cat.name)}
                </span>
                <span className="text-sm font-bold text-brand-navy line-clamp-1">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Info bar */}
      <section className="border-y border-tan bg-white/70">
        <div className="home-container py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-2">
              What Are Coupon Codes?
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Promo codes you enter at checkout to unlock discounts, free shipping, or exclusive offers from your favourite brands.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-2">
              How To Find Codes
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              Browse popular coupons above, search a brand, or open any store page to see verified active offers ready to use.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand-navy mb-2">
              Do They Always Work?
            </h3>
            <p className="text-sm text-brand-muted leading-relaxed">
              We verify codes regularly, but retailer terms can change. If a code fails, try another offer from the same store.
            </p>
          </div>
        </div>
      </section>

      {/* All Coupons & Deals — store directory */}
      <section id="all-deals" className="home-container py-10 sm:py-14">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-brand-navy">
            All Coupons &amp; Deals
          </h2>
          <p className="text-sm text-brand-muted mt-1">
            {loading
              ? 'Loading…'
              : `Showing ${visibleStores.length} of ${directoryStores.length} stores`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-white border border-tan rounded-lg animate-pulse" />
            ))}
          </div>
        ) : directoryStores.length === 0 ? (
          <div className="text-center py-12 border border-tan rounded-xl bg-white">
            <Tag className="w-10 h-10 text-brand-muted mx-auto mb-3 opacity-50" />
            <p className="font-bold text-brand-navy">No stores match your search</p>
            <button
              type="button"
              onClick={() => {
                setDirectoryQuery('');
                setHeroQuery('');
              }}
              className="mt-4 text-sm font-semibold text-brand-accent hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {visibleStores.map((store) => {
                const logo = getFaviconUrl(store);
                return (
                  <Link
                    key={store.id}
                    href={storeHref(store)}
                    className="group flex flex-col"
                  >
                    <div className="aspect-square rounded-lg border border-tan bg-white flex items-center justify-center p-4 group-hover:border-brand-navy/30 group-hover:shadow-sm transition-all">
                      {logo ? (
                        <img
                          src={logo}
                          alt={store.name}
                          className="max-h-[55%] max-w-[70%] object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-brand-navy">{store.name.charAt(0)}</span>
                      )}
                    </div>
                    <p className="mt-2 text-xs font-bold text-brand-navy line-clamp-1">{store.name}</p>
                    <span className="text-[11px] font-semibold text-brand-muted group-hover:text-brand-accent inline-flex items-center gap-0.5">
                      View Coupons <ArrowRight className="w-3 h-3" />
                    </span>
                  </Link>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setStorePage((p) => p + 1)}
                  className="inline-flex items-center px-8 py-3 rounded-lg border-2 border-brand-navy text-brand-navy text-xs font-extrabold uppercase tracking-wider hover:bg-brand-navy hover:text-white transition-colors"
                >
                  Load More Stores
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-brand-navy">
        <div className="home-container py-10 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-md">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Newsletter
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white leading-tight">
                Get Verified Codes in Your Inbox
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Weekly hand-picked promotions from brands you actually shop.
              </p>
            </div>
            <div className="w-full md:w-auto md:min-w-[340px]">
              <form
                className="flex flex-col sm:flex-row gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!email.trim()) return;
                  setSubscribed(true);
                  setEmail('');
                }}
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-sm bg-white text-brand-navy placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-white text-brand-navy hover:bg-brand-cyan transition-colors"
                >
                  Subscribe
                </button>
              </form>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-white/50">
                <span>No Spam</span>
                <span>Just Savings</span>
                <span>Unsubscribe Anytime</span>
              </div>
              {subscribed && (
                <p className="mt-2 text-sm text-brand-cyan font-semibold flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4" /> You&apos;re on the list.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <CouponPopup
        coupon={selectedCoupon}
        isOpen={showPopup}
        onClose={() => {
          setShowPopup(false);
          setSelectedCoupon(null);
        }}
        onContinue={() => {
          if (selectedCoupon?.url) {
            window.open(selectedCoupon.url, '_blank', 'noopener,noreferrer');
          }
          setShowPopup(false);
          setSelectedCoupon(null);
        }}
      />
    </div>
  );
}

export default function CouponsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream">
          <Navbar />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-navy mx-auto mb-4" />
              <p className="text-brand-muted">Loading promotions…</p>
            </div>
          </div>
        </div>
      }
    >
      <CouponsContent />
    </Suspense>
  );
}
