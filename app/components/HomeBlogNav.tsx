'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Home } from 'lucide-react';
import { NewsArticle } from '@/lib/services/newsService';
import { filterByNavCategory, sortByNewest } from '@/lib/utils/articleHome';

/** Homepage-only breadcrumb. Options live here — other pages use Breadcrumbs.tsx. */
const HOME_OPTIONS = [
  { id: 'fashion', label: 'Fashion', categoryId: 'fashion' },
  { id: 'lifestyle', label: 'Lifestyle', categoryId: 'lifestyle' },
  { id: 'featured', label: 'Featured', categoryId: 'all' },
] as const;

type HomeBlogNavProps = {
  activeNav: string;
  onNavChange: (navId: string, categoryId: string) => void;
  articles: NewsArticle[];
};

function formatNavDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function HomeBlogNav({
  activeNav,
  onNavChange,
  articles,
}: HomeBlogNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  const [navHeight, setNavHeight] = useState(52);
  const today = useMemo(() => formatNavDate(), []);

  const dropdownArticles = (categoryId: string, limit = 5) =>
    sortByNewest(filterByNavCategory(articles, categoryId)).slice(0, limit);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const updateHeight = () => setNavHeight(nav.getBoundingClientRect().height);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const header = document.getElementById('home-top-header');
    if (!header) return;

    const onScroll = () => {
      setIsPinned(header.getBoundingClientRect().bottom <= 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        id="home-blog-nav"
        aria-label="Home breadcrumb"
        className={`w-full bg-white border-b border-gray-100 ${
          isPinned
            ? 'fixed top-0 left-0 right-0 z-50 shadow-md shadow-black/10'
            : 'relative z-40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Breadcrumb: Home › Fashion › Lifestyle › Featured › Promotions */}
            <ol className="flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-x-auto scrollbar-hide flex-1 text-[13px] sm:text-sm">
              <li className="shrink-0">
                <button
                  type="button"
                  onClick={() => onNavChange('home', 'all')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 whitespace-nowrap transition-colors ${
                    activeNav === 'home'
                      ? 'bg-[#FFF8E6] text-[#B8860B] font-medium border border-[#E6BC2E] rounded-[11px]'
                      : 'bg-[#FFF8E6]/50 text-[#B8860B] font-medium border border-[#E6BC2E]/50 rounded-[11px] hover:bg-[#FFF8E6]'
                  }`}
                  aria-current={activeNav === 'home' ? 'page' : undefined}
                >
                  <Home className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  Home
                </button>
              </li>

              {HOME_OPTIONS.map((item) => {
                const isActive = activeNav === item.id;
                const isOpen = openDropdown === item.id;

                return (
                  <li
                    key={item.id}
                    className="relative flex items-center gap-1.5 sm:gap-2 shrink-0"
                    onMouseEnter={() => setOpenDropdown(item.id)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" aria-hidden />
                    <button
                      type="button"
                      onClick={() => {
                        onNavChange(item.id, item.categoryId);
                        setOpenDropdown(isOpen ? null : item.id);
                      }}
                      className={`inline-flex items-center gap-1 whitespace-nowrap py-1.5 transition-colors ${
                        isActive
                          ? 'text-[#B8860B] font-medium'
                          : 'text-gray-700 hover:text-[#B8860B]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                      aria-expanded={isOpen}
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-gray-500 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[110]">
                        {dropdownArticles(item.categoryId).map((article) => {
                          const href =
                            article.id && !article.id.startsWith('placeholder-')
                              ? `/blogs/${article.id}`
                              : '/blogs';
                          return (
                            <Link
                              key={article.id}
                              href={href}
                              className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-50 hover:text-[#B8860B] line-clamp-2"
                              onClick={() => setOpenDropdown(null)}
                            >
                              {article.title}
                            </Link>
                          );
                        })}
                        <Link
                          href="/blogs"
                          className="block px-4 py-2 text-xs font-semibold text-[#B8860B] hover:underline border-t border-gray-100 mt-1"
                          onClick={() => setOpenDropdown(null)}
                        >
                          View all articles →
                        </Link>
                      </div>
                    )}
                  </li>
                );
              })}

              <li className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" aria-hidden />
                <Link
                  href="/promotions"
                  className="text-gray-700 whitespace-nowrap py-1.5 hover:text-[#B8860B] transition-colors"
                >
                  Promotions
                </Link>
              </li>
            </ol>

            <div className="hidden sm:flex items-center gap-3 shrink-0 pl-3 border-l border-gray-200">
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center h-9 bg-[#FFD23F] hover:bg-black hover:text-white text-black text-sm font-semibold px-4 rounded-lg transition-colors whitespace-nowrap"
              >
                Contact Us
              </Link>
              <time className="hidden lg:block text-sm text-gray-500 whitespace-nowrap">
                {today}
              </time>
            </div>
          </div>
        </div>
      </nav>

      {isPinned && (
        <div aria-hidden className="w-full bg-white" style={{ height: navHeight }} />
      )}
    </>
  );
}
