'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNews, NewsArticle } from '@/lib/services/newsService';
import {
  filterArticlesForColumn,
  formatArticleDateUpper,
  padArticles,
  sortByNewest,
} from '@/lib/utils/articleHome';

const COLUMN_GRADIENTS = [
  'from-[#1e3a5f] to-[#2d5a87]',
  'from-[#2d1b4e] to-[#5c3d8f]',
  'from-[#1a4d3e] to-[#2d7a62]',
];

const COLUMNS = [
  {
    title: 'Travel',
    viewAllHref: '/blogs',
    keywords: ['travel', 'trip', 'flight', 'hotel', 'vacation', 'airbnb', 'booking', 'destination'],
  },
  {
    title: 'Clothing & Accessories',
    viewAllHref: '/blogs',
    keywords: ['clothing', 'fashion', 'apparel', 'accessories', 'wear', 'style', 'shoes', 'wardrobe', 'sneaker'],
  },
  {
    title: 'Tech, Home & Entertainment',
    viewAllHref: '/blogs',
    keywords: ['tech', 'electronics', 'home', 'entertainment', 'gadget', 'smart', 'tv', 'laptop', 'streaming'],
  },
] as const;

function ColumnImage({
  article,
  gradientIndex = 0,
}: {
  article: NewsArticle;
  gradientIndex?: number;
}) {
  const [failed, setFailed] = useState(false);
  const gradient = COLUMN_GRADIENTS[gradientIndex % COLUMN_GRADIENTS.length];

  if (!article.imageUrl || failed) {
    return (
      <div
        className={`h-full w-full bg-gradient-to-br ${gradient}`}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={article.imageUrl}
      alt=""
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}

function ColumnBlock({
  title,
  articles,
  viewAllHref,
  gradientIndex,
}: {
  title: string;
  articles: NewsArticle[];
  viewAllHref: string;
  gradientIndex: number;
}) {
  const [featured, ...subs] = articles;
  const isFeaturedPlaceholder = featured?.id?.startsWith('placeholder-');

  return (
    <div className="flex flex-col h-full pb-8 sm:pb-10 border-b border-gray-200 md:border-b-0 md:pb-0 last:border-b-0 last:pb-0">
      <h2 className="text-base sm:text-lg font-black text-gray-900 mb-3 sm:mb-4 pb-2 border-b-2 border-[#FFD23F]">
        {title}
      </h2>

      {featured && (
        <Link
          href={isFeaturedPlaceholder ? viewAllHref : `/blogs/${featured.id}`}
          className="group mb-4 sm:mb-5 block"
        >
          <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-3 bg-gray-100">
            <ColumnImage article={featured} gradientIndex={gradientIndex} />
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-500 mb-1">
            {formatArticleDateUpper(featured.createdAt)}
          </p>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 group-hover:text-[#B8860B] transition-colors">
            {featured.title}
          </h3>
        </Link>
      )}

      <ul className="space-y-2.5 sm:space-y-3 flex-1">
        {subs.map((article) => {
          const isPlaceholder = article.id?.startsWith('placeholder-');
          return (
            <li key={article.id}>
              <Link
                href={isPlaceholder ? viewAllHref : `/blogs/${article.id}`}
                className="block text-[13px] sm:text-sm font-semibold text-gray-800 hover:text-[#B8860B] line-clamp-2 transition-colors border-l-2 border-transparent hover:border-[#FFD23F] pl-3"
              >
                {article.title}
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href={viewAllHref}
        className="mt-4 sm:mt-5 inline-flex text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#B8860B] transition-colors"
      >
        View All →
      </Link>
    </div>
  );
}

export default function CategoryArticleColumns() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then((data) => setArticles(sortByNewest(data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const columnData = COLUMNS.map((col) => {
    const matched = filterArticlesForColumn(articles, [...col.keywords]);
    const pool = matched.length >= 4 ? matched : matched.length > 0 ? matched : articles;
    return padArticles(pool, 4, col.title);
  });

  return (
    <section className="bg-white py-8 sm:py-10 lg:py-12 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4 animate-pulse">
                <div className="h-6 w-40 bg-gray-200 rounded" />
                <div className="aspect-[16/10] bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="space-y-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-3 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {COLUMNS.map((col, i) => (
              <ColumnBlock
                key={col.title}
                title={col.title}
                articles={columnData[i]}
                viewAllHref={col.viewAllHref}
                gradientIndex={i}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
