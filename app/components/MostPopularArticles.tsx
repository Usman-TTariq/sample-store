'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNews, NewsArticle } from '@/lib/services/newsService';
import { formatArticleDateUpper, sortByNewest } from '@/lib/utils/articleHome';

function PopularCard({ article }: { article: NewsArticle }) {
  const isPlaceholder = article.id?.startsWith('placeholder-');
  const href = isPlaceholder ? '/blogs' : `/blogs/${article.id}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:border-[#FFD23F] hover:shadow-md transition-all">
      <Link href={href} className="relative aspect-[16/10] overflow-hidden block">
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[#111111] via-[#444] to-[#FFD23F]/40" />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-[#111111] px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#FFD23F]">
          Popular
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <p className="text-[11px] font-semibold text-gray-500 mb-2">
          {formatArticleDateUpper(article.createdAt)}
        </p>
        <Link href={href}>
          <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#B8860B] transition-colors">
            {article.title}
          </h3>
        </Link>
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
          {article.description || 'Discover why readers love this story.'}
        </p>
        <Link
          href={href}
          className="inline-flex text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#B8860B] transition-colors mt-auto"
        >
          Read More →
        </Link>
      </div>
    </article>
  );
}

export default function MostPopularArticles() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews()
      .then((data) => setArticles(sortByNewest(data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const popular =
    articles.length > 0
      ? sortByNewest(articles).slice(0, 4)
      : Array.from({ length: 4 }, (_, i) => ({
          id: `placeholder-popular-${i}`,
          title: 'Popular article coming soon',
          description: 'Top stories from our community will appear here.',
          imageUrl: '',
          createdAt: new Date().toISOString(),
        }));

  return (
    <section className="bg-[#FFFBF0] py-10 sm:py-12 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">Most Popular Articles</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {popular.map((article) => (
              <PopularCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
