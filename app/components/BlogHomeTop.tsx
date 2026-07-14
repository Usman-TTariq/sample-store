'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { siteConfig } from '@/lib/seo/config';
import SiteLogoText from '@/app/components/SiteLogoText';
import HomeBlogNav from '@/app/components/HomeBlogNav';
import SearchSuggestionsDropdown from '@/app/components/SearchSuggestionsDropdown';
import { useSearchSuggestions } from '@/lib/hooks/useSearchSuggestions';
import { getNews, NewsArticle } from '@/lib/services/newsService';
import {
  FALLBACK_ARTICLE_IMAGES,
  filterByNavCategory,
  formatArticleDateLong,
  getArticleImageUrl,
  inferArticleCategoryLabel,
  padArticles,
  prioritizeArticlesWithImages,
  sortByNewest,
} from '@/lib/utils/articleHome';

const SIDEBAR_GRADIENTS = [
  'from-[#111111] to-[#3d3210]',
  'from-[#1a1608] to-[#5c4a14]',
  'from-[#111111] to-[#B8860B]/70',
  'from-[#2a2208] to-[#FFD23F]/35',
];

function ArticleImage({
  article,
  className = '',
  gradientIndex = 0,
}: {
  article: NewsArticle;
  className?: string;
  gradientIndex?: number;
}) {
  const fallback = FALLBACK_ARTICLE_IMAGES[gradientIndex % FALLBACK_ARTICLE_IMAGES.length];
  const [src, setSrc] = useState(() => getArticleImageUrl(article, gradientIndex));
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    setSrc(getArticleImageUrl(article, gradientIndex));
    setExhausted(false);
  }, [article.id, article.imageUrl, gradientIndex]);

  const gradient = SIDEBAR_GRADIENTS[gradientIndex % SIDEBAR_GRADIENTS.length];

  if (exhausted) {
    return <div className={`bg-gradient-to-br ${gradient} ${className}`} aria-hidden />;
  }

  return (
    <img
      src={src}
      alt=""
      className={`object-cover ${className}`}
      onError={() => {
        if (src !== fallback) setSrc(fallback);
        else setExhausted(true);
      }}
    />
  );
}

function orderForHero(articles: NewsArticle[], categoryId: string): NewsArticle[] {
  const sorted = sortByNewest(articles);
  if (categoryId !== 'all' || sorted.length <= 1) return sorted;

  const guideIndex = sorted.findIndex((a) => {
    const label = inferArticleCategoryLabel(a);
    const t = a.title.toLowerCase();
    return label === 'SAVINGS GUIDE' || t.includes('coupon') || t.includes('stacking') || t.includes('playbook');
  });

  if (guideIndex <= 0) return sorted;

  const reordered = [...sorted];
  const [hero] = reordered.splice(guideIndex, 1);
  return [hero, ...reordered];
}

export default function BlogHomeTop() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeNav, setActiveNav] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { results: searchResults, loading: searchLoading } = useSearchSuggestions(searchQuery);

  const handleNavChange = (navId: string, categoryId: string) => {
    setActiveNav(navId);
    setActiveCategory(categoryId);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  useEffect(() => {
    getNews()
      .then((data) => setArticles(sortByNewest(data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return prioritizeArticlesWithImages(
      orderForHero(filterByNavCategory(articles, activeCategory), activeCategory)
    );
  }, [articles, activeCategory]);

  const featured = filtered[0] || padArticles([], 1, 'featured', articles)[0];
  const sidebar = padArticles(filtered.slice(1), 3, 'sidebar', articles);

  const featuredHref =
    featured.id && !featured.id.startsWith('placeholder-')
      ? `/blogs/${featured.id}`
      : '/blogs';

  return (
    <>
      {/* Logo + search — then HomeBlogNav breadcrumb with Home options */}
      <div className="bg-black">
        <header id="home-top-header" className="text-white font-sans border-b border-gray-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
            <div className="flex flex-col items-center gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div className="hidden lg:block" aria-hidden />
              <Link
                href="/"
                className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <img
                  src={siteConfig.icon}
                  alt={`${siteConfig.name} icon`}
                  className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
                />
                <SiteLogoText className="text-2xl sm:text-[1.65rem] font-bold tracking-tight leading-none" />
              </Link>
              <div className="relative w-full max-w-md lg:max-w-sm xl:max-w-md lg:justify-self-end">
                <form
                  action="/search"
                  method="get"
                  onSubmit={handleSearch}
                  className="flex w-full items-center bg-white rounded-full p-0.5 sm:p-1 h-[40px] sm:h-[42px] shadow-lg"
                >
                  <Search className="ml-3 w-4 h-4 text-gray-400 shrink-0" aria-hidden />
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
                    placeholder="Search..."
                    className="flex-1 min-w-0 px-2 py-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm font-medium"
                    autoComplete="off"
                  />
                  <button
                    type="submit"
                    className="shrink-0 mr-0.5 bg-[#FFD23F] hover:bg-black hover:text-white text-black font-bold text-xs px-4 sm:px-5 py-2 rounded-full transition-colors"
                  >
                    Search
                  </button>
                </form>
                <SearchSuggestionsDropdown
                  query={searchQuery}
                  results={searchResults}
                  show={showSuggestions && searchQuery.trim().length > 0}
                  loading={searchLoading}
                  onClose={() => setShowSuggestions(false)}
                />
              </div>
            </div>
          </div>
        </header>

        <HomeBlogNav
          activeNav={activeNav}
          onNavChange={handleNavChange}
          articles={articles}
        />
      </div>

      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8 animate-pulse">
              <div className="space-y-4">
                <div className="aspect-[16/9] bg-gray-200 rounded-sm" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-200 rounded w-full" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-28 h-20 bg-gray-200 rounded-sm shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-16 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8 lg:gap-10 lg:items-start">
              <article className="min-w-0">
                <Link href={featuredHref} className="group block">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm mb-4 sm:mb-5 bg-[#111111]">
                    <ArticleImage
                      key={`featured-${featured.id}-${activeCategory}`}
                      article={featured}
                      className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-[1.02]"
                      gradientIndex={0}
                    />
                  </div>
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#B8860B] mb-2 sm:mb-3">
                    {inferArticleCategoryLabel(featured) === 'GUIDES'
                      ? 'SAVINGS GUIDE'
                      : inferArticleCategoryLabel(featured)}
                  </p>
                  <h1 className="font-serif text-xl min-[400px]:text-2xl sm:text-3xl lg:text-[2.15rem] font-bold text-[#111111] leading-[1.25] sm:leading-[1.2] mb-3 sm:mb-4 group-hover:text-[#B8860B] transition-colors">
                    {featured.title}
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-[15px] leading-relaxed line-clamp-3 sm:line-clamp-2 mb-4 sm:mb-6">
                    {featured.description ||
                      'Expert tips and verified deals to help you save more on every purchase.'}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 pt-2 border-t border-gray-100">
                    <time className="text-xs sm:text-sm text-gray-500">
                      {formatArticleDateLong(featured.createdAt)}
                    </time>
                    <span className="text-xs sm:text-sm font-semibold text-[#111111] border-b-2 border-[#FFD23F] pb-0.5 group-hover:text-[#B8860B] transition-colors">
                      Read full guide
                    </span>
                  </div>
                </Link>
              </article>

              <aside className="flex flex-col gap-6 lg:gap-8 border-t border-gray-200 lg:border-t-0 pt-6 lg:pt-0">
                {sidebar.map((article, i) => {
                  const href =
                    article.id && !article.id.startsWith('placeholder-')
                      ? `/blogs/${article.id}`
                      : '/blogs';
                  return (
                    <Link
                      key={article.id || i}
                      href={href}
                      className="group flex gap-4 items-center"
                    >
                      <div className="relative w-[7.5rem] h-[5.5rem] shrink-0 overflow-hidden rounded-sm bg-gray-100">
                        <ArticleImage
                          key={`sidebar-${article.id}-${activeCategory}-${i}`}
                          article={article}
                          className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
                          gradientIndex={i + 1}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.12em] text-[#B8860B] mb-1 sm:mb-1.5">
                          {inferArticleCategoryLabel(article)}
                        </p>
                        <h2 className="font-serif text-[13px] min-[400px]:text-sm sm:text-base font-bold text-[#111111] leading-snug line-clamp-3 group-hover:text-[#B8860B] transition-colors mb-1.5 sm:mb-2">
                          {article.title}
                        </h2>
                        <time className="text-[11px] sm:text-xs text-gray-500">
                          {formatArticleDateLong(article.createdAt)}
                        </time>
                      </div>
                    </Link>
                  );
                })}
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
