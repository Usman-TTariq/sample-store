'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { siteConfig } from '@/lib/seo/config';
import { getNews, NewsArticle } from '@/lib/services/newsService';
import {
  BLOG_NAV_CATEGORIES,
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
  'from-[#2d1b4e] to-[#5c3d8f]',
  'from-[#1e3a5f] to-[#2d5a87]',
  'from-[#1a4d3e] to-[#2d7a62]',
  'from-[#6b3a2a] to-[#c45c3e]',
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

/** Hero featured = savings/guide story when on ALL; else first in filter */
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
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getNews()
      .then((data) => setArticles(sortByNewest(data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const pool = prioritizeArticlesWithImages(
      orderForHero(filterByNavCategory(articles, activeCategory), activeCategory)
    );
    return pool;
  }, [articles, activeCategory]);

  const featured = filtered[0] || padArticles([], 1, 'featured', articles)[0];
  const sidebar = padArticles(filtered.slice(1), 3, 'sidebar', articles);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) router.push(`/blogs?q=${encodeURIComponent(q)}`);
    else router.push('/blogs');
  };

  const featuredHref =
    featured.id && !featured.id.startsWith('placeholder-')
      ? `/blogs/${featured.id}`
      : '/blogs';

  return (
    <>
      <header className="bg-gradient-to-br from-[#111111] to-black text-white font-sans border-b border-gray-700/50">
        {/* Row 1: logo + search */}
        <div className="border-b border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
            <div className="flex flex-col items-center gap-3 sm:gap-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <div className="hidden lg:block" aria-hidden />
              <Link
                href="/"
                className="flex items-center justify-center gap-2 hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <img
                  src={siteConfig.icon}
                  alt={`${siteConfig.name} icon`}
                  className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 object-contain"
                />
                <span className="text-xl sm:text-2xl font-bold tracking-tight leading-none">
                  <span className="text-white">Sample</span>
                  <span className="text-[#FFD23F]">Store</span>
                </span>
              </Link>
              <form
                onSubmit={handleSearch}
                className="flex w-full max-w-none sm:max-w-md lg:max-w-sm xl:max-w-md items-center bg-white rounded-full p-0.5 sm:p-1 h-[40px] sm:h-[42px] shadow-lg mx-auto lg:justify-self-end lg:mx-0"
              >
                <Search className="ml-2.5 sm:ml-3 w-4 h-4 text-gray-400 shrink-0" aria-hidden />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="flex-1 min-w-0 px-1.5 sm:px-2 py-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-xs sm:text-sm font-medium"
                />
                <button
                  type="submit"
                  aria-label="Search articles"
                  className="shrink-0 mr-0.5 flex items-center justify-center bg-[#FFD23F] text-black min-w-[34px] h-[30px] sm:min-w-0 sm:h-auto px-2.5 sm:px-5 sm:py-2 rounded-full font-bold text-xs hover:bg-black hover:text-white transition-all"
                >
                  <Search className="w-3.5 h-3.5 sm:hidden" aria-hidden />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Row 2: category nav — wrap on mobile, centered row on tablet+ */}
        <nav className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex flex-wrap justify-center md:flex-nowrap md:justify-center items-center gap-x-1 gap-y-2 md:gap-0 py-3 sm:py-3.5 lg:py-4">
              {BLOG_NAV_CATEGORIES.map((cat, i) => (
                <li key={cat.id} className="flex items-center shrink-0">
                  {i > 0 && (
                    <span className="hidden md:inline text-gray-600 text-xs sm:text-sm px-2 sm:px-3 lg:px-5 select-none font-light">
                      |
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`text-[10px] min-[400px]:text-[11px] sm:text-xs font-semibold uppercase tracking-[0.08em] sm:tracking-[0.12em] whitespace-nowrap px-2.5 py-1.5 md:px-0 md:py-0 md:pb-1 border-b-0 md:border-b-[3px] transition-colors min-h-[32px] md:min-h-0 rounded-full md:rounded-none ${
                      activeCategory === cat.id
                        ? 'text-[#111111] bg-[#FFD23F] border-[#FFD23F] md:text-white md:bg-transparent'
                        : 'text-gray-400 border-transparent hover:text-[#FFD23F]'
                    }`}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Hero: featured + sidebar — full-width white */}
      <section className="w-full bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
            <div className="lg:col-span-2 space-y-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {/* Featured article */}
            <article className="lg:col-span-2 min-w-0">
              <Link href={featuredHref} className="group block">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm mb-4 sm:mb-5 bg-[#2d1b4e]">
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

            {/* Sidebar articles */}
            <aside className="flex flex-col gap-0 lg:gap-7 lg:pt-1 border-t border-gray-200 lg:border-t-0 pt-6 lg:pt-1">
              {sidebar.map((article, i) => {
                const href =
                  article.id && !article.id.startsWith('placeholder-')
                    ? `/blogs/${article.id}`
                    : '/blogs';
                return (
                  <Link
                    key={article.id || i}
                    href={href}
                    className={`group flex gap-3 sm:gap-4 items-start py-4 sm:py-0 ${
                      i > 0 ? 'border-t border-gray-100 lg:border-t-0' : 'pt-0 lg:pt-0'
                    }`}
                  >
                    <div className="relative w-24 min-[400px]:w-28 sm:w-[7.5rem] h-[4.75rem] min-[400px]:h-[5.5rem] shrink-0 overflow-hidden rounded-sm bg-gray-100">
                      <ArticleImage
                        key={`sidebar-${article.id}-${activeCategory}-${i}`}
                        article={article}
                        className="absolute inset-0 w-full h-full transition-transform duration-500 group-hover:scale-105"
                        gradientIndex={i + 1}
                      />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
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
