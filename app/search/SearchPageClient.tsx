'use client';

import { useEffect, useState, Suspense, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Coupon } from '@/lib/services/couponService';
import { Store } from '@/lib/services/storeService';
import { Category } from '@/lib/services/categoryService';
import { NewsArticle } from '@/lib/services/newsService';
import Navbar from '@/app/components/Navbar';
import SearchSuggestionsDropdown from '@/app/components/SearchSuggestionsDropdown';
import { useSearchSuggestions } from '@/lib/hooks/useSearchSuggestions';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Newsletter from '@/app/components/Newsletter';
import Footer from '@/app/components/Footer';

type SearchResults = {
  stores: Store[];
  coupons: Coupon[];
  articles: NewsArticle[];
  categories: Category[];
};

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('category') || '';
  const [inputQuery, setInputQuery] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const { results: suggestResults, loading: suggestLoading } = useSearchSuggestions(inputQuery);
  const [results, setResults] = useState<SearchResults>({
    stores: [],
    coupons: [],
    articles: [],
    categories: [],
  });

  useEffect(() => {
    setInputQuery(query);
  }, [query]);

  useEffect(() => {
    if (!query.trim() && !categoryId) {
      setResults({ stores: [], coupons: [], articles: [], categories: [] });
      return;
    }

    const runSearch = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          let stores = data.stores || [];
          let coupons = data.coupons || [];
          let articles = data.articles || [];
          const categories = data.categories || [];

          if (categoryId) {
            coupons = coupons.filter((c: Coupon) => c.categoryId === categoryId);
            stores = stores.filter((s: Store) => s.categoryId === categoryId);
          }

          setResults({ stores, coupons, articles, categories });
        } else {
          setResults({ stores: [], coupons: [], articles: [], categories: [] });
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults({ stores: [], coupons: [], articles: [], categories: [] });
      } finally {
        setLoading(false);
      }
    };

    runSearch();
  }, [query, categoryId]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    const q = inputQuery.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
    else router.push('/search');
  };

  const { stores: filteredStores, coupons: filteredCoupons, articles: filteredArticles } = results;
  const selectedCategory = results.categories.find((c) => c.id === categoryId);

  return (
    <>
      <div className="w-full px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Search Results
            </h1>

            <form onSubmit={handleSearchSubmit} className="max-w-2xl mb-4 relative">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  name="q"
                  value={inputQuery}
                  onChange={(e) => {
                    setInputQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => inputQuery.trim() && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Search stores, coupons & articles..."
                  className="w-full pl-12 pr-28 py-3 border-2 border-[#FFD23F]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD23F] focus:border-[#FFD23F] text-gray-900"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  className="absolute right-2 bg-[#FFD23F] hover:bg-black hover:text-white text-black font-bold text-sm px-5 py-2 rounded-md transition-colors"
                >
                  Search
                </button>
              </div>
              <SearchSuggestionsDropdown
                query={inputQuery}
                results={suggestResults}
                show={showSuggestions && inputQuery.trim().length > 0}
                loading={suggestLoading}
                onClose={() => setShowSuggestions(false)}
              />
            </form>

            {(query || categoryId) && (
              <div className="flex flex-wrap items-center gap-2 text-sm sm:text-base text-gray-600">
                {query && (
                  <span className="px-3 py-1 bg-[#FFFBF0] text-[#B8860B] rounded-full font-semibold">
                    Query: &quot;{query}&quot;
                  </span>
                )}
                {selectedCategory && (
                  <span className="px-3 py-1 bg-[#FFFBF0] text-[#B8860B] rounded-full font-semibold">
                    Category: {selectedCategory.name}
                  </span>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Searching...</p>
            </div>
          ) : !query && !categoryId ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg mb-4">Enter a search term to find coupons and stores</p>
              <p className="text-gray-400 text-sm">Try searching for store names, coupon codes, or articles</p>
            </div>
          ) : (
            <>
              {filteredArticles.length > 0 && (
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Articles ({filteredArticles.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredArticles.map((article) => (
                      <Link
                        key={article.id}
                        href={article.id ? `/blogs/${article.id}` : '/blogs'}
                        className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-[#E6BC2E] hover:shadow-lg transition-all duration-300"
                      >
                        <div className="relative h-40 bg-gray-100 overflow-hidden">
                          {article.imageUrl ? (
                            <img
                              src={article.imageUrl}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#111111] to-[#FFD23F]/40" />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#B8860B] transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{article.description}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {filteredCoupons.length > 0 && (
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Coupons ({filteredCoupons.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredCoupons.map((coupon) => (
                      <Link
                        key={coupon.id}
                        href={coupon.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-[#E6BC2E] hover:shadow-lg transition-all duration-300"
                      >
                        {coupon.logoUrl && (
                          <div className="mb-3 flex items-center justify-center h-16">
                            <img
                              src={coupon.logoUrl}
                              alt={coupon.storeName || coupon.code}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="text-center">
                          <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-[#E6BC2E] transition-colors">
                            {coupon.code || coupon.storeName || 'Deal'}
                          </h3>
                          {coupon.storeName && (
                            <p className="text-sm text-gray-600 mb-2">{coupon.storeName}</p>
                          )}
                          <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2">
                            {coupon.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {filteredStores.length > 0 && (
                <div className="mb-8 sm:mb-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                    Stores ({filteredStores.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {filteredStores.map((store) => (
                      <Link
                        key={store.id}
                        href={`/stores/${store.slug || store.id}`}
                        className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-[#E6BC2E] hover:shadow-lg transition-all duration-300 text-center"
                      >
                        {store.logoUrl ? (
                          <div className="mb-3 flex items-center justify-center h-16">
                            <img
                              src={store.logoUrl}
                              alt={store.name}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="mb-3 h-16 flex items-center justify-center bg-gray-100 rounded">
                            <span className="text-gray-400 text-xs font-bold">
                              {store.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <h3 className="font-semibold text-sm text-gray-900 group-hover:text-[#E6BC2E] transition-colors truncate">
                          {store.name}
                        </h3>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {filteredCoupons.length === 0 &&
                filteredStores.length === 0 &&
                filteredArticles.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg mb-2">No results found for &quot;{query}&quot;</p>
                    <p className="text-gray-400 text-sm">Try different keywords like store name or coupon code</p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden w-full">
      <Navbar />

      <Breadcrumbs items={[{ label: 'Search' }]} />

      <Suspense
        fallback={
          <div className="w-full px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 bg-white overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full">
              <div className="text-center py-12">
                <p className="text-gray-500">Loading search results...</p>
              </div>
            </div>
          </div>
        }
      >
        <SearchContent />
      </Suspense>
      <Newsletter />
      <Footer />
    </div>
  );
}
