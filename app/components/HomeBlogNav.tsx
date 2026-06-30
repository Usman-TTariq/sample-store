'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { NewsArticle } from '@/lib/services/newsService';
import { filterByNavCategory, sortByNewest } from '@/lib/utils/articleHome';

const HOME_NAV_ITEMS = [
  { id: 'home', label: 'Home', categoryId: 'all', hasDropdown: false },
  { id: 'fashion', label: 'Fashion', categoryId: 'fashion', hasDropdown: true },
  { id: 'lifestyle', label: 'Lifestyle', categoryId: 'lifestyle', hasDropdown: true },
  { id: 'featured', label: 'Featured', categoryId: 'all', hasDropdown: true },
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
        className={`w-full bg-black text-white border-b border-gray-800/80 ${
          isPinned
            ? 'fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/30'
            : 'relative z-40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-3 sm:py-0 sm:min-h-[52px]">
            <ul className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 lg:gap-x-8 gap-y-1">
              {HOME_NAV_ITEMS.map((item) => {
                const isActive = activeNav === item.id;
                const isOpen = openDropdown === item.id;

                return (
                  <li
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => item.hasDropdown && setOpenDropdown(item.id)}
                    onMouseLeave={() => item.hasDropdown && setOpenDropdown(null)}
                  >
                    {item.hasDropdown ? (
                      <button
                        type="button"
                        onClick={() => {
                          onNavChange(item.id, item.categoryId);
                          setOpenDropdown(isOpen ? null : item.id);
                        }}
                        className={`flex items-center gap-1 h-9 text-sm font-medium transition-colors ${
                          isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {item.label}
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onNavChange(item.id, item.categoryId)}
                        className={`h-9 text-sm font-medium transition-colors ${
                          isActive ? 'text-white' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    )}

                    {item.hasDropdown && isOpen && (
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

              <li>
                <Link
                  href="/promotions"
                  className="flex items-center h-9 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Promotions
                </Link>
              </li>
            </ul>

            <div className="flex items-center gap-3 sm:gap-5 shrink-0 sm:ml-auto">
              <Link
                href="/contact-us"
                className="inline-flex items-center justify-center h-9 bg-[#FFD23F] hover:bg-black hover:text-white text-black text-sm font-semibold px-4 rounded-lg transition-colors whitespace-nowrap"
              >
                Contact Us
              </Link>
              <time className="hidden md:block text-sm text-slate-400 whitespace-nowrap leading-none">
                {today}
              </time>
            </div>
          </div>
        </div>
      </nav>

      {isPinned && (
        <div aria-hidden className="w-full bg-black" style={{ height: navHeight }} />
      )}
    </>
  );
}
