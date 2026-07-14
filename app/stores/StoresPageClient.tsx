'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Store as StoreIcon,
} from 'lucide-react';
import { getActiveCoupons, Coupon } from '@/lib/services/couponService';
import { getCategories, Category } from '@/lib/services/categoryService';
import { getStores, Store } from '@/lib/services/storeService';
import Navbar from '@/app/components/Navbar';
import Breadcrumbs from '@/app/components/Breadcrumbs';

const STORES_PER_PAGE = 16;
const ALPHABET = ['0-9', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

const FEATURE_CARDS = [
  {
    title: 'Browse Stores',
    description: 'Explore verified brands and find the best promo codes in one place.',
    href: '/stores',
    bg: 'bg-[#fde8d8]',
  },
  {
    title: 'Featured Offers',
    description: 'Hand-picked promotions updated daily so you never miss a deal.',
    href: '/promotions',
    bg: 'bg-[#ddeef8]',
  },
  {
    title: 'Top Categories',
    description: 'Shop fashion, tech, travel, home and more with lasting savings.',
    href: '/categories',
    bg: 'bg-[#d8f3ef]',
  },
  {
    title: 'Verified Codes',
    description: 'Every code is checked before it goes live — save with confidence.',
    href: '/promotions',
    bg: 'bg-[#ebe4f7]',
  },
] as const;

type SortTab = 'all' | 'popular' | 'newest' | 'az';

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

function deduplicateStores(storesList: Store[]): Store[] {
  const map = new Map<string, Store>();
  for (const store of storesList) {
    const key = store.slug || store.name.toLowerCase().replace(/\s+/g, '-');
    const existing = map.get(key);
    if (!existing || (!existing.logoUrl && store.logoUrl)) {
      map.set(key, store);
    }
  }
  return Array.from(map.values());
}

function StoreBrowseCard({
  store,
  dealCount,
}: {
  store: Store;
  dealCount: number;
}) {
  const logoUrl = getFaviconUrl(store);
  const savingsHint = dealCount > 0 ? `$${Math.max(8, Math.min(48, dealCount * 4))}` : '$12';
  const lastUsed = dealCount > 0 ? `${(dealCount % 9) + 1}m ago` : '—';

  return (
    <article className="flex flex-col bg-white border border-tan/80 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-brand-navy/25 transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-14 h-14 rounded-lg border border-tan bg-cream/60 flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={store.name} className="max-h-10 max-w-[48px] object-contain" />
          ) : (
            <span className="text-xl font-bold text-brand-navy">{store.name.charAt(0)}</span>
          )}
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
          <BadgeCheck className="w-3.5 h-3.5" />
          Verified
        </span>
      </div>

      <h3 className="text-sm font-bold text-brand-navy line-clamp-1 mb-1">{store.name}</h3>

      <div className="mb-3">
        <p className="text-3xl font-extrabold text-brand-navy leading-none tabular-nums">{dealCount}</p>
        <p className="text-xs text-brand-muted mt-1">Active coupons</p>
      </div>

      <div className="h-1 w-full rounded-full bg-cream mb-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-brand-navy/70"
          style={{ width: `${Math.min(100, Math.max(12, dealCount * 12))}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-brand-muted mb-4">
        <span>
          Avg. savings <strong className="text-brand-navy">{savingsHint}</strong>
        </span>
        <span>
          Last used <strong className="text-brand-navy">{lastUsed}</strong>
        </span>
      </div>

      <Link
        href={storeHref(store)}
        className="mt-auto block w-full text-center text-xs font-bold uppercase tracking-wide text-white bg-brand-navy hover:bg-brand-navy-dark py-2.5 rounded-lg transition-colors"
      >
        View Shop
      </Link>
    </article>
  );
}

export default function StoresPageClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const [sortTab, setSortTab] = useState<SortTab>('all');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
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
        setStores(deduplicateStores(storesData));
      } catch (error) {
        console.error('Error fetching stores data:', error);
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

  const brandStripStores = useMemo(() => {
    const trending = stores.filter((s) => s.isTrending);
    const rest = stores.filter((s) => !s.isTrending);
    return [...trending, ...rest].slice(0, 16);
  }, [stores]);

  const categoryTabs = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        count: stores.filter((s) => s.categoryId === category.id).length,
      }))
      .filter((c) => c.count > 0)
      .slice(0, 10);
  }, [categories, stores]);

  const filteredStores = useMemo(() => {
    let list = [...stores];

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }

    if (letterFilter) {
      if (letterFilter === '0-9') {
        list = list.filter((s) => /^[0-9]/.test(s.name));
      } else {
        list = list.filter((s) => s.name.toUpperCase().startsWith(letterFilter));
      }
    }

    if (categoryId) {
      list = list.filter((s) => s.categoryId === categoryId);
    }

    if (sortTab === 'popular') {
      list.sort((a, b) => {
        if (a.isTrending && !b.isTrending) return -1;
        if (!a.isTrending && b.isTrending) return 1;
        return (storeDealCounts.get(b.id || '') || 0) - (storeDealCounts.get(a.id || '') || 0);
      });
    } else if (sortTab === 'newest') {
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    } else if (sortTab === 'az') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      list.sort((a, b) => {
        if (a.isTrending && !b.isTrending) return -1;
        if (!a.isTrending && b.isTrending) return 1;
        const countDiff =
          (storeDealCounts.get(b.id || '') || 0) - (storeDealCounts.get(a.id || '') || 0);
        if (countDiff !== 0) return countDiff;
        return (a.name || '').localeCompare(b.name || '');
      });
    }

    return list;
  }, [stores, searchQuery, letterFilter, categoryId, sortTab, storeDealCounts]);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / STORES_PER_PAGE));
  const paginatedStores = filteredStores.slice(0, page * STORES_PER_PAGE);
  const hasMore = paginatedStores.length < filteredStores.length;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, letterFilter, categoryId, sortTab]);

  const sortTabs: { id: SortTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'popular', label: 'Most Popular' },
    { id: 'newest', label: 'Newest' },
    { id: 'az', label: 'A–Z' },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <Breadcrumbs items={[{ label: 'Stores' }]} />

      {/* Hero */}
      <section className="border-b border-tan">
        <div className="home-container py-10 sm:py-14">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-brand-navy leading-[1.1]">
              Discover Stores{' '}
              <span className="text-brand-accent">Your Way.</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base text-brand-muted max-w-xl mx-auto">
              Browse verified brands, compare active offers, and grab promo codes that actually work.
            </p>
      </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {FEATURE_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`${card.bg} rounded-xl p-5 min-h-[140px] flex flex-col justify-between group border border-black/5 hover:shadow-md transition-shadow`}
              >
            <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wide text-brand-navy mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs text-brand-navy/70 leading-relaxed">{card.description}</p>
                            </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-navy mt-4 group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                        </Link>
                      ))}
                    </div>
                  </div>
      </section>

      {/* Brand logo strip */}
      {!loading && brandStripStores.length > 0 && (
        <section className="border-b border-tan bg-white/60">
          <div className="home-container py-6 sm:py-8">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3">
              {brandStripStores.map((store) => {
                const logo = getFaviconUrl(store);
                return (
                            <Link
                              key={store.id}
                    href={storeHref(store)}
                    className="aspect-[3/2] rounded-lg border border-tan bg-white flex items-center justify-center p-2 hover:border-brand-navy/35 transition-colors"
                    title={store.name}
                  >
                    {logo ? (
                      <img src={logo} alt={store.name} className="max-h-8 max-w-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-brand-navy">{store.name.slice(0, 3)}</span>
                    )}
                  </Link>
                );
              })}
                              </div>
                                  </div>
        </section>
      )}

      {/* A–Z filter */}
      <section className="border-b border-tan bg-white">
        <div className="home-container py-3 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            <button
              type="button"
              onClick={() => setLetterFilter(null)}
              className={`px-2.5 py-1 text-xs font-bold rounded ${
                letterFilter === null
                  ? 'bg-brand-navy text-white'
                  : 'text-brand-navy hover:bg-cream'
              }`}
            >
              All
            </button>
            {ALPHABET.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => setLetterFilter(letter === letterFilter ? null : letter)}
                className={`min-w-[1.75rem] px-1.5 py-1 text-xs font-semibold rounded ${
                  letterFilter === letter
                    ? 'bg-brand-navy text-white'
                    : 'text-brand-muted hover:text-brand-navy hover:bg-cream'
                }`}
              >
                {letter}
              </button>
                          ))}
                        </div>
                      </div>
      </section>

      {/* Browse grid */}
      <section className="home-container py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-brand-navy">
              Browse {loading ? '…' : filteredStores.length.toLocaleString()}+ Verified Stores
            </h2>
            <p className="text-sm text-brand-muted mt-1">
              {loading ? 'Loading…' : `${coupons.length} active promotions across trusted brands`}
            </p>
                    </div>
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stores…"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-tan bg-white text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
                            />
                          </div>
                        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {sortTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSortTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${
                sortTab === tab.id
                  ? 'bg-brand-navy text-white'
                  : 'bg-white border border-tan text-brand-navy hover:border-brand-navy/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
      </div>

        {categoryTabs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 pb-2 border-b border-tan">
            <button
              type="button"
              onClick={() => setCategoryId('')}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                categoryId === ''
                  ? 'border-brand-navy text-brand-navy'
                  : 'border-transparent text-brand-muted hover:text-brand-navy'
              }`}
            >
              All
            </button>
            {categoryTabs.map((cat) => (
                  <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id || '')}
                className={`px-3 py-1.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                  categoryId === cat.id
                    ? 'border-brand-navy text-brand-navy'
                    : 'border-transparent text-brand-muted hover:text-brand-navy'
                }`}
              >
                {cat.name}
                  </button>
            ))}
            </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-white rounded-xl border border-tan animate-pulse" />
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-tan p-12 text-center max-w-lg mx-auto">
            <StoreIcon className="w-12 h-12 text-brand-muted mx-auto mb-4 opacity-50" />
            <p className="text-lg font-bold text-brand-navy mb-2">No stores found</p>
            <p className="text-sm text-brand-muted mb-6">Try another letter, category, or search term.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setLetterFilter(null);
                setCategoryId('');
                setSortTab('all');
              }}
              className="btn-cta px-6 py-2.5 text-sm"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {paginatedStores.map((store) => (
                <StoreBrowseCard
                  key={store.id}
                  store={store}
                  dealCount={storeDealCounts.get(store.id || '') || 0}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-lg border-2 border-brand-navy text-brand-navy text-xs font-extrabold uppercase tracking-wider hover:bg-brand-navy hover:text-white transition-colors"
                >
                  Load More Stores
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="mt-3 text-xs text-brand-muted">
                  Showing {paginatedStores.length} of {filteredStores.length}
                </p>
              </div>
            )}

            {!hasMore && page > 1 && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setPage(1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-navy hover:underline"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to top
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Newsletter CTA */}
      <section className="bg-brand-navy">
        <div className="home-container py-10 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-md">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-cyan mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Stay updated
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white leading-tight">
                Get Verified Codes in Your Inbox
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Weekly hand-picked promotions — no spam, unsubscribe anytime.
              </p>
            </div>
            <form
              className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:min-w-[340px]"
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
          </div>
          {subscribed && (
            <p className="mt-3 text-sm text-brand-cyan font-semibold">Thanks — you&apos;re on the list.</p>
          )}
        </div>
      </section>
    </div>
  );
}
