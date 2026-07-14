'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCategories, Category } from '@/lib/services/categoryService';
import { categoryPath } from '@/lib/utils/categorySlug';
import {
  getCategoryCoverUrl,
  getCategoryEmoji,
  isCategoryImageUrl,
} from '@/lib/utils/categoryIcon';

function CategoryCard({ category }: { category: Category }) {
  const cover = getCategoryCoverUrl(category.name);
  const hasCustomLogo = isCategoryImageUrl(category.logoUrl);

  return (
    <Link
      href={categoryPath(category)}
      className="group relative block overflow-hidden rounded-2xl border border-tan bg-white shadow-sm hover:shadow-lg hover:border-brand-navy/30 transition-all"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream">
        <img
          src={cover}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/25 to-transparent" />

        <div className="absolute top-3 left-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-white/40 bg-white/95 shadow-md backdrop-blur-sm">
            {hasCustomLogo ? (
              <img
                src={category.logoUrl!}
                alt={category.name}
                className="h-7 w-7 object-contain"
              />
            ) : (
              <span className="text-xl leading-none" aria-hidden>
                {getCategoryEmoji(category.name)}
              </span>
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight drop-shadow-sm">
            {category.name}
          </h3>
          <p className="mt-0.5 text-xs font-semibold text-white/80 group-hover:text-brand-cyan transition-colors">
            Browse deals →
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function CategoriesGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'name'>('name');

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getCategories();
        const sorted = [...data].sort((a, b) => {
          if (sortBy === 'newest') {
            const aTime = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
            return bTime - aTime;
          }
          return a.name.localeCompare(b.name);
        });
        setCategories(sorted);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [sortBy]);

  if (loading) {
    return (
      <div className="home-container py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-2xl bg-white border border-tan animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="home-container py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-brand-navy tracking-tight">
            Shop by Category
          </h2>
          <p className="text-sm text-brand-muted mt-1">
            Showing {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sortBy" className="text-sm text-brand-navy font-semibold">
            Sort by
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'name')}
            className="px-3 py-2 border border-tan rounded-lg text-sm bg-white text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
          >
            <option value="name">Name</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
