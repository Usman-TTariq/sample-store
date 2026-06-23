'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getStores, Store } from '@/lib/services/storeService';
import Navbar from '@/app/components/Navbar';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import Newsletter from '@/app/components/Newsletter';
import Footer from '@/app/components/Footer';
import StoreLogo from '@/app/components/StoreLogo';
import { Filter } from 'lucide-react';

const STORES_BANNER = '/banners/stores_banner.webp';

function StoreCard({ store, className = '' }: { store: Store; className?: string }) {
  const href = `/stores/${store.slug || store.id}`;

  return (
    <Link
      href={href}
      className={`group flex flex-col items-center text-center bg-white border border-gray-200 rounded-xl p-4 hover:border-[#FFD23F] hover:shadow-lg hover:shadow-[#FFD23F]/15 hover:-translate-y-0.5 transition-all duration-300 ${className}`}
    >
      <div className="w-16 h-16 shrink-0 mb-3 p-2 rounded-xl bg-[#FFFBF0] border border-[#FFD23F]/25 flex items-center justify-center group-hover:bg-white transition-colors">
        <StoreLogo
          name={store.name}
          logoUrl={store.logoUrl}
          websiteUrl={store.websiteUrl}
          trackingLink={store.trackingLink}
          className="w-full h-full"
          imgClassName="w-full h-full object-contain"
        />
      </div>
      <p className="font-bold text-gray-900 line-clamp-2 text-sm leading-snug w-full">{store.name}</p>
      {store.voucherText ? (
        <p className="mt-1 text-[11px] text-[#B8860B] font-semibold line-clamp-1 w-full">{store.voucherText}</p>
      ) : (
        <p className="mt-1 text-[11px] text-gray-400 line-clamp-1">View coupons</p>
      )}
    </Link>
  );
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilter, setShowFilter] = useState(false);
  const [supabaseStores, setSupabaseStores] = useState<Store[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const storesPerPage = 24;

  // Deduplicate stores by slug (or name if slug is missing)
  const deduplicateStores = (storesList: Store[]): Store[] => {
    const uniqueStoresMap = new Map<string, Store>();
    storesList.forEach(store => {
      // Use slug as primary identifier, fall back to name if slug is missing
      const uniqueKey = store.slug || store.name.toLowerCase().replace(/\s+/g, '-');

      if (!uniqueStoresMap.has(uniqueKey)) {
        uniqueStoresMap.set(uniqueKey, store);
      } else {
        // If duplicate found, prefer the one with more complete data (has logoUrl)
        const existing = uniqueStoresMap.get(uniqueKey);
        if (existing && !existing.logoUrl && store.logoUrl) {
          uniqueStoresMap.set(uniqueKey, store);
        }
      }
    });
    return Array.from(uniqueStoresMap.values());
  };

  // Combine and deduplicate stores
  const allStores = deduplicateStores([...stores, ...supabaseStores]);

  const sortedStores = useMemo(() => {
    const sorted = [...allStores];
    switch (sortBy) {
      case 'newest':
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'oldest':
        sorted.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }
    return sorted;
  }, [allStores, sortBy]);

  const featuredStores = useMemo(() => {
    const trending = sortedStores.filter((s) => s.isTrending);
    const withDeal = sortedStores.filter((s) => !s.isTrending && s.voucherText);
    const rest = sortedStores.filter((s) => !s.isTrending && !s.voucherText);
    const merged = [...trending, ...withDeal, ...rest];
    const seen = new Set<string>();
    return merged.filter((s) => {
      const key = s.id || s.slug || s.name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);
  }, [sortedStores]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedStores.length / storesPerPage);
  const startIndex = (currentPage - 1) * storesPerPage;
  const endIndex = startIndex + storesPerPage;
  const newStores = sortedStores.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [storesData, supabaseResponse] = await Promise.all([
          getStores(),
          fetch('/api/stores/supabase')
            .then((res) => res.json())
            .catch((err) => {
              console.error('Error fetching Supabase stores:', err);
              return { success: false, stores: [] };
            }),
        ]);

        const supabaseList: Store[] = Array.isArray(supabaseResponse?.stores)
          ? (supabaseResponse.stores as Store[])
          : [];

        setStores(storesData);
        setSupabaseStores(supabaseList);
      } catch (error) {
        console.error('Error fetching stores page data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden w-full">
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Smooth scrolling for mobile horizontal scroll */
        @media (max-width: 640px) {
          .overflow-x-auto {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
          }
          /* Snap scrolling for better UX */
          .snap-x {
            scroll-snap-type: x mandatory;
          }
          .snap-start {
            scroll-snap-align: start;
          }
        }
      `}</style>
      <Navbar />

      {/* Stores page hero banner */}
      <div className="w-full overflow-hidden">
        <div className="relative w-full min-h-[200px] sm:min-h-[240px] md:min-h-[280px] aspect-[4/3] sm:aspect-[1728/547] overflow-hidden bg-[#FFFBF0]">
          <img
            src={STORES_BANNER}
            alt="Browse all stores — coupons and deals"
            className="w-full h-full object-contain object-left sm:object-cover sm:object-center"
          />
        </div>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Stores' }
        ]}
      />

      {/* Stores Grid Section */}
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 lg:py-16 bg-white overflow-x-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 sm:mb-6 md:mb-8">
            All <span className="text-[#B8860B]">Stores</span>
          </h2>

          {/* Filter and Sort Bar */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8 pb-3 sm:pb-4 border-b border-[#FFD23F]/40">
            <div className="text-xs sm:text-sm md:text-base text-gray-600 text-center sm:text-left">
              Showing <span className="font-semibold text-[#B8860B]">{newStores.length}</span> of <span className="font-semibold text-[#B8860B]">{sortedStores.length}</span> Results
            </div>

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2 xs:gap-3 sm:gap-4 w-full">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border border-[#FFD23F]/40 text-[#B8860B] rounded-lg hover:bg-[#FFFBF0] active:bg-[#FFFBF0] transition-colors text-xs sm:text-sm md:text-base font-medium w-full xs:w-auto"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>

              <div className="flex items-center gap-2 w-full xs:w-auto">
                <span className="text-xs sm:text-sm md:text-base text-gray-600 whitespace-nowrap">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-1 xs:flex-none px-2 sm:px-3 py-2 border border-[#FFD23F]/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD23F] text-xs sm:text-sm md:text-base bg-white cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg aspect-square animate-pulse"></div>
              ))}
            </div>
          ) : sortedStores.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No stores available yet.</p>
            </div>
          ) : (
            <div>
              {/* Featured Stores */}
              {featuredStores.length > 0 && (
                <div className="mb-8 sm:mb-10 md:mb-12">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 px-2 sm:px-0">
                    Featured <span className="text-[#B8860B]">Stores</span>
                  </h3>
                  <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto sm:overflow-visible scrollbar-hide snap-x snap-mandatory sm:snap-none -mx-3 px-3 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
                    {featuredStores.map((store) => (
                      <StoreCard
                        key={store.id || store.slug}
                        store={store}
                        className="snap-start shrink-0 w-[148px] sm:w-auto sm:shrink"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Stores */}
              {sortedStores.length > 0 && (
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 px-2 sm:px-0">
                    All <span className="text-[#B8860B]">Stores</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                    {newStores.map((store) => (
                      <StoreCard key={store.id || store.slug} store={store} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-gradient-to-r from-[#FFD23F] to-[#FFE566] text-black hover:from-black hover:to-black hover:text-white hover:shadow-lg hover:scale-105'
                }`}
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1);

                if (!showPage) {
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-3 py-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${currentPage === page
                      ? 'bg-gradient-to-r from-[#FFD23F] to-[#FFE566] text-black shadow-lg scale-110'
                      : 'bg-white text-gray-700 hover:bg-[#FFFBF0] border border-[#FFD23F]/40'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => {
                if (currentPage < totalPages) {
                  setCurrentPage(currentPage + 1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-gradient-to-r from-[#FFD23F] to-[#FFE566] text-black hover:from-black hover:to-black hover:text-white hover:shadow-lg hover:scale-105'
                }`}
            >
              Next
            </button>
          </div>

          {/* Page Info */}
          <div className="text-center mt-4 text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, allStores.length)} of {allStores.length} stores
          </div>
        </div>
      )}

      {/* Newsletter Subscription Section */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </div>
  );
}

