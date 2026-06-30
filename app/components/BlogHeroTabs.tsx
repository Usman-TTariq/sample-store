'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getNews, NewsArticle } from '@/lib/services/newsService';
import { getCategories, Category } from '@/lib/services/categoryService';
import { siteConfig } from '@/lib/seo/config';
import {
  filterArticlesByCategory,
  padArticles,
  sortByNewest,
} from '@/lib/utils/articleHome';

function HeroCard({
  article,
  index,
  categoryLabel,
}: {
  article: NewsArticle;
  index: number;
  categoryLabel: string;
}) {
  const isPlaceholder = !article.id || article.id.startsWith('placeholder-');
  const href = isPlaceholder ? '/blogs' : `/blogs/${article.id}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:border-[#FFD23F] hover:shadow-lg transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#111111] via-[#333] to-[#FFD23F]/60" />
        )}
        <span className="absolute top-3 left-3 text-3xl font-black text-white/90 drop-shadow">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="inline-flex w-fit rounded-full bg-[#FFD23F]/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#B8860B]">
          {categoryLabel}
        </span>
        <h3 className="line-clamp-2 text-sm font-bold text-gray-900 group-hover:text-[#B8860B] transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-gray-500">{siteConfig.name}</p>
      </div>
    </Link>
  );
}

export default function BlogHeroTabs() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    Promise.all([getNews(), getCategories()])
      .then(([news, cats]) => {
        setArticles(sortByNewest(news));
        setCategories(cats.slice(0, 3));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabs = useMemo(() => {
    if (categories.length >= 3) {
      return categories.slice(0, 3).map((c) => ({ id: c.id || c.name, label: c.name }));
    }
    const defaults = [
      { id: 'fashion', label: 'Fashion' },
      { id: 'lifestyle', label: 'Lifestyle' },
      { id: 'featured', label: 'Featured' },
    ];
    return defaults;
  }, [categories]);

  const tabArticles = useMemo(() => {
    return tabs.map((tab, tabIndex) => {
      const cat = categories[tabIndex];
      const filtered = cat
        ? filterArticlesByCategory(articles, cat.name)
        : tab.label === 'Featured'
          ? articles
          : filterArticlesByCategory(articles, tab.label);
      return padArticles(filtered.length ? filtered : articles, 4, tab.label);
    });
  }, [tabs, categories, articles]);

  const cards = tabArticles[activeTab] || padArticles([], 4, 'Featured');

  return (
    <section className="bg-white border-b border-gray-100 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 border-b border-gray-200 pb-1">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors border-b-2 -mb-[1px] ${
                activeTab === i
                  ? 'border-[#FFD23F] text-[#111111]'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((article, i) => (
              <HeroCard
                key={article.id || i}
                article={article}
                index={i}
                categoryLabel={tabs[activeTab]?.label || 'Featured'}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
