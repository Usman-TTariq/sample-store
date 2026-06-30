'use client';

import { useEffect, useState } from 'react';
import { Coupon } from '@/lib/services/couponService';
import { Store } from '@/lib/services/storeService';
import { Category } from '@/lib/services/categoryService';

export type SearchSuggestionResults = {
  stores: Store[];
  coupons: Coupon[];
  categories: Category[];
};

const EMPTY: SearchSuggestionResults = { stores: [], coupons: [], categories: [] };

export function useSearchSuggestions(query: string, debounceMs = 280) {
  const [results, setResults] = useState<SearchSuggestionResults>(EMPTY);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (!cancelled && data.success) {
          setResults(data.results || EMPTY);
        }
      } catch {
        if (!cancelled) setResults(EMPTY);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, debounceMs]);

  const hasResults =
    results.stores.length > 0 || results.coupons.length > 0 || results.categories.length > 0;

  return { results, loading, hasResults };
}
