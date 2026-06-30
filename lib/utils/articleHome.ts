import { NewsArticle } from '@/lib/services/newsService';

export function formatArticleDateLong(createdAt?: string): string {
  if (!createdAt) return 'Coming soon';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return 'Coming soon';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export const BLOG_NAV_CATEGORIES = [
  { id: 'all', label: 'ALL', keywords: [] as string[] },
  { id: 'fashion', label: 'FASHION', keywords: ['fashion', 'wardrobe', 'sneaker', 'clothing', 'wear', 'accessories', 'outfit'] },
  { id: 'travel', label: 'TRAVEL', keywords: ['travel', 'flight', 'vacation', 'getaway', 'destination', 'booking', 'hotel'] },
  { id: 'tech', label: 'TECH', keywords: ['tech', 'laptop', 'smart home', 'streaming', 'gadget', 'amazon', 'prime day', 'electronics'] },
  { id: 'lifestyle', label: 'LIFESTYLE', keywords: ['lifestyle', 'habits', 'daily', 'cashback', 'budget', 'save'] },
  { id: 'grocery', label: 'GROCERY', keywords: ['grocery', 'food', 'aisle', 'meal'] },
  { id: 'guides', label: 'GUIDES', keywords: ['guide', 'stacking', 'coupon', 'playbook', 'how to', '101'] },
] as const;

/** Verified Unsplash fallbacks when article image missing or broken */
export const FALLBACK_ARTICLE_IMAGES = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=675&fit=crop&q=85&auto=format',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=675&fit=crop&q=85&auto=format',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=675&fit=crop&q=85&auto=format',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=675&fit=crop&q=85&auto=format',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=675&fit=crop&q=85&auto=format',
] as const;

export function getArticleImageUrl(article: NewsArticle, fallbackIndex = 0): string {
  if (article.imageUrl?.trim()) return article.imageUrl.trim();
  return FALLBACK_ARTICLE_IMAGES[fallbackIndex % FALLBACK_ARTICLE_IMAGES.length];
}

export function prioritizeArticlesWithImages(articles: NewsArticle[]): NewsArticle[] {
  const withImg = articles.filter((a) => a.imageUrl?.trim());
  const without = articles.filter((a) => !a.imageUrl?.trim());
  return [...withImg, ...without];
}

export function inferArticleCategoryLabel(article: NewsArticle): string {
  const text = `${article.title} ${article.description}`.toLowerCase();
  for (const cat of BLOG_NAV_CATEGORIES) {
    if (cat.id === 'all') continue;
    if (cat.keywords.some((k) => text.includes(k))) {
      return cat.id === 'guides' ? 'SAVINGS GUIDE' : cat.label;
    }
  }
  return 'FEATURED';
}

export function filterByNavCategory(articles: NewsArticle[], categoryId: string): NewsArticle[] {
  if (categoryId === 'all') return articles;
  const cat = BLOG_NAV_CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return articles;
  const matched = filterArticlesForColumn(articles, [...cat.keywords]);
  const pool = matched.length > 0 ? matched : articles;
  return prioritizeArticlesWithImages(pool);
}

export function formatArticleDateUpper(createdAt?: string): string {
  if (!createdAt) return 'COMING SOON';
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return 'COMING SOON';
  const formatted = d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  return formatted.toUpperCase();
}

export function filterArticlesByKeywords(
  articles: NewsArticle[],
  keywords: string[]
): NewsArticle[] {
  const needles = keywords.map((k) => k.toLowerCase()).filter(Boolean);
  if (needles.length === 0) return [];

  return articles.filter((article) => {
    const text = `${article.title} ${article.description} ${article.content || ''}`.toLowerCase();
    return needles.some((k) => text.includes(k));
  });
}

/** Prefer title/excerpt matches so body-only keyword hits (e.g. "travel" in a coupon guide) don't dominate */
export function filterArticlesForColumn(
  articles: NewsArticle[],
  keywords: string[]
): NewsArticle[] {
  const needles = keywords.map((k) => k.toLowerCase()).filter(Boolean);
  if (needles.length === 0) return articles;

  const scored = articles
    .map((article) => {
      const title = article.title.toLowerCase();
      const excerpt = (article.description || '').toLowerCase();
      const content = (article.content || '').toLowerCase();
      let score = 0;
      for (const k of needles) {
        if (title.includes(k)) score += 3;
        else if (excerpt.includes(k)) score += 2;
        else if (content.includes(k)) score += 1;
      }
      return { article, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return articles;
  return scored.map((s) => s.article);
}

export function filterArticlesByCategory(
  articles: NewsArticle[],
  categoryName: string,
  extraKeywords: string[] = []
): NewsArticle[] {
  const name = categoryName.toLowerCase();
  const matched = filterArticlesByKeywords(articles, [categoryName, ...extraKeywords]);
  if (matched.length > 0) return matched;
  return articles.filter((_, i) => i % 3 === Math.abs(name.charCodeAt(0) % 3));
}

export function sortByNewest(articles: NewsArticle[]): NewsArticle[] {
  return [...articles].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

export function padArticles(
  articles: NewsArticle[],
  count: number,
  categoryLabel: string,
  imagePool: NewsArticle[] = []
): NewsArticle[] {
  const poolUrls = [
    ...articles.map((a) => a.imageUrl).filter(Boolean),
    ...imagePool.map((a) => a.imageUrl).filter(Boolean),
    ...FALLBACK_ARTICLE_IMAGES,
  ] as string[];

  const result = [...articles.slice(0, count)];
  while (result.length < count) {
    const idx = result.length;
    result.push({
      id: `placeholder-${categoryLabel}-${idx}`,
      title: 'New article coming soon',
      description: 'Stay tuned for the latest deals, tips, and savings guides from our editors.',
      imageUrl: poolUrls[idx % poolUrls.length] || FALLBACK_ARTICLE_IMAGES[0],
      createdAt: new Date().toISOString(),
    });
  }
  return result;
}
