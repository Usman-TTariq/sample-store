'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getStoreById, getStoreBySlug, Store, getStores } from '@/lib/services/storeService';
import { getCouponsByStoreId, Coupon } from '@/lib/services/couponService';
import { sortCouponsByOrder } from '@/lib/utils/couponOrder';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import CouponPopup from '@/app/components/CouponPopup';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import { ExternalLink, Tag, CheckCircle, Star, ArrowRight } from 'lucide-react';

// Helper function to get favicon URL from store data
const getStoreFaviconUrl = (store: Store): string => {
  let domain = '';

  if (store.websiteUrl) {
    try {
      domain = new URL(store.websiteUrl).hostname.replace('www.', '');
    } catch (e) {
      console.error('Invalid websiteUrl:', store.websiteUrl);
    }
  } else if (store.trackingLink) {
    try {
      domain = new URL(store.trackingLink).hostname.replace('www.', '');
    } catch (e) {
      console.error('Invalid trackingLink:', store.trackingLink);
    }
  }

  // If no domain found, try to construct from store name
  if (!domain && store.name) {
    // Check if name already looks like a domain (contains a dot)
    const nameLower = store.name.toLowerCase();
    if (nameLower.includes('.')) {
      // Name already looks like a domain, use it as-is
      domain = nameLower.replace(/\s+/g, '');
    } else {
      // Convert store name to potential domain (e.g., "SamBoat" -> "samboat.com")
      domain = nameLower.replace(/\s+/g, '') + '.com';
    }
  }

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

export default function StorePageClient({ params }: { params: { id: string } }) {
  const idOrSlug = params.id;

  const [store, setStore] = useState<Store | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      try {
        let storeData = await getStoreBySlug(idOrSlug);

        if (!storeData) {
          storeData = await getStoreById(idOrSlug);
        }

        if (!storeData) {
          try {
            const res = await fetch('/api/stores/supabase');
            if (res.ok) {
              const data = await res.json();
              const supabaseList: Store[] = Array.isArray(data?.stores) ? (data.stores as Store[]) : [];
              const matched = supabaseList.find((s) => s.slug === idOrSlug || s.id === idOrSlug);
              if (matched) {
                storeData = matched;
              }
            }
          } catch (supabaseError) {
            console.error('Error fetching store from Supabase list:', supabaseError);
          }
        }

        if (storeData) {
          console.log('Store Data Loaded:', storeData);
          console.log('Logo URL:', storeData.logoUrl);
          console.log('Tracking Link:', storeData.trackingLink);
          console.log('Tracking URL:', storeData.trackingUrl);
          console.log('Website URL:', storeData.websiteUrl);
          setStore(storeData);

          if (storeData.id) {
            try {
              const [storeCoupons, storesData] = await Promise.all([
                getCouponsByStoreId(storeData.id),
                getStores(),
              ]);

              const activeCoupons = (storeCoupons || []).filter((coupon) => coupon.isActive);
              setCoupons(sortCouponsByOrder(activeCoupons, storeData.couponOrder));
              setAllStores(storesData);
            } catch (couponErr) {
              console.error('Error fetching coupons for store:', couponErr);
              setCoupons([]);
            }
          }
        } else {
          setStore(null);
        }
      } catch (error) {
        console.error('Error fetching store data:', error);
        setStore(null);
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      fetchStoreData();
    }
  }, [idOrSlug]);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
      }).catch((err) => {
        console.error('Clipboard API failed:', err);
      });
    }
  };

  const handleCouponClick = (coupon: Coupon) => {
    if (coupon.couponType === 'code' && coupon.code) {
      const codeToCopy = coupon.code.trim();
      copyToClipboard(codeToCopy);
    }

    setSelectedCoupon(coupon);
    setShowPopup(true);

    if (coupon.url && coupon.url.trim()) {
      setTimeout(() => {
        window.open(coupon.url, '_blank', 'noopener,noreferrer');
      }, 500);
    }
  };

  const handleContinue = () => {
    if (selectedCoupon?.url) {
      window.open(selectedCoupon.url, '_blank', 'noopener,noreferrer');
    }
    setShowPopup(false);
    setSelectedCoupon(null);
  };

  const toJsDate = (timestamp: unknown): Date | null => {
    if (!timestamp) return null;
    try {
      const value = timestamp as { toDate?: () => Date };
      return value.toDate ? value.toDate() : new Date(timestamp as string);
    } catch {
      return null;
    }
  };

  const getLastTwoDigits = (coupon: Coupon): string | null => {
    if ((coupon.couponType || 'deal') === 'code' && coupon.code) {
      const code = coupon.code.trim();
      if (code.length >= 2) {
        return code.slice(-2);
      }
    }
    return null;
  };

  const getCouponTitle = (coupon: Coupon): string => {
    if (coupon.storeName?.trim()) return coupon.storeName.trim();
    if (coupon.description?.trim()) return coupon.description.trim();
    if (coupon.discount) {
      return coupon.discountType === 'percentage'
        ? `${coupon.discount}% Off`
        : `$${coupon.discount} Off`;
    }
    return coupon.getCodeText || coupon.getDealText || 'Special Offer';
  };

  const storeLogoUrl = store ? (store.logoUrl || getStoreFaviconUrl(store)) : '';

  // Get related stores (exclude current store)
  const relatedStores = allStores.filter(s => s.id !== store?.id).slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD23F] mb-4"></div>
            <p className="text-gray-600">Loading store...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Store Not Found</h1>
            <p className="text-gray-600 mb-6">The store you're looking for doesn't exist.</p>
            <Link href="/stores" className="inline-block px-6 py-3 bg-[#FFD23F] text-[#111111] rounded-lg hover:bg-[#111111] hover:text-white transition-all font-semibold">
              Browse All Stores
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF0]">
      <Navbar />

      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FFD23F]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#B8860B]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Breadcrumbs */}
      <div className="relative z-10">
        <Breadcrumbs
          className="[&>div]:py-1.5 sm:[&>div]:py-3"
          items={[
            { label: 'Stores', href: '/stores' },
            { label: store?.name || 'Store Details' }
          ]}
        />
      </div>

      {/* Store Header Section */}
      <div className="relative w-full py-4 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row items-start gap-3 sm:items-center sm:gap-8">
            {/* Store Logo */}
            <motion.div
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl p-2 sm:p-6 flex items-center justify-center border border-gray-100">
                <img
                  src={store.logoUrl || getStoreFaviconUrl(store)}
                  alt={store.name}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const faviconUrl = getStoreFaviconUrl(store);
                    // If logoUrl failed, try favicon
                    if (target.src !== faviconUrl && store.logoUrl) {
                      target.src = faviconUrl;
                    } else {
                      // If both failed, show gradient fallback
                      const parent = target.parentElement;
                      if (parent) {
                        target.style.display = 'none';
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-full bg-gradient-to-br from-[#111111] to-[#B8860B] rounded-xl flex items-center justify-center';
                        fallback.innerHTML = `<span class="text-white font-bold text-4xl">${store.name.charAt(0).toUpperCase()}</span>`;
                        parent.appendChild(fallback);
                      }
                    }
                  }}
                />
              </div>
            </motion.div>

            {/* Store Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-start justify-between gap-2 sm:block">
                <motion.h1
                  className="text-lg sm:text-4xl md:text-5xl font-bold mb-0 sm:mb-3 leading-tight line-clamp-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <span className="text-[#111111]">
                    {store.subStoreName || store.name}
                  </span>
                </motion.h1>

                <motion.a
                  href={store.trackingLink || store.trackingUrl || store.websiteUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sm:hidden flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFD23F] text-[#111111] rounded-md text-[11px] font-semibold hover:bg-[#111111] hover:text-white transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                >
                  <ExternalLink className="w-3 h-3" />
                  Visit
                </motion.a>
              </div>

              {store.description && (
                <motion.p
                  className="hidden sm:block text-gray-600 text-base sm:text-lg max-w-2xl mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {store.description}
                </motion.p>
              )}

              <motion.div
                className="mt-1.5 sm:mt-0 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                  <div className="flex items-center gap-1 bg-[#FFFBF0] text-[#B8860B] border border-[#FFD23F]/40 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-medium whitespace-nowrap">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden min-[380px]:inline">Verified Store</span>
                    <span className="min-[380px]:hidden">Verified</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#FFFBF0] text-[#111111] border border-[#FFD23F]/30 px-2 py-0.5 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-sm font-medium whitespace-nowrap">
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span>{coupons.length} Active Offer{coupons.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                  ))}
                  <span className="text-gray-600 text-[10px] sm:text-sm ml-0.5">(4.9)</span>
                </div>
              </motion.div>


              <motion.a
                href={store.trackingLink || store.trackingUrl || store.websiteUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 mt-2 sm:mt-4 px-3 py-1.5 sm:px-6 sm:py-3 bg-[#FFD23F] text-[#111111] rounded-lg hover:bg-[#111111] hover:text-white transition-all duration-300 sm:hover:scale-105 font-semibold text-xs sm:text-base shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                onClick={() => {
                  console.log('Visit Store clicked');
                  console.log('Using URL:', store.trackingLink || store.trackingUrl || store.websiteUrl || 'No URL available');
                }}
              >
                <ExternalLink className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                Visit Store
              </motion.a>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Section */}
      <div className="relative w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-2 sm:mb-8">
            <h2 className="text-base sm:text-3xl md:text-4xl font-bold mb-0 sm:mb-2">
              Available <span className="text-[#B8860B]">Coupons</span>
            </h2>
            <p className="hidden sm:block text-gray-600 text-xs sm:text-base">
              {coupons.length > 0
                ? `Found ${coupons.length} active coupon${coupons.length !== 1 ? 's' : ''}`
                : 'No active coupons available at the moment'}
            </p>
          </div>

          {coupons.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-md">
              <p className="text-gray-500 text-lg mb-4">No coupons available for this store right now.</p>
              <Link href="/stores" className="inline-block px-6 py-3 bg-[#FFD23F] text-[#111111] rounded-lg hover:bg-[#111111] hover:text-white transition-all font-semibold">
                Browse Other Stores
              </Link>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {coupons.map((coupon, index) => {
                const expiry = toJsDate(coupon.expiryDate);
                const isExpired = expiry ? expiry < new Date() : false;
                const isCode = coupon.couponType !== 'deal';
                const buttonLabel = isCode
                  ? (copiedCode === coupon.code ? 'Copied!' : (coupon.getCodeText || 'Get Code'))
                  : (coupon.getDealText || 'Get Deal');

                return (
                  <motion.div
                    key={coupon.id}
                    className={`group bg-white rounded-lg p-2.5 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-2 sm:gap-4 cursor-pointer ${
                      index === 0
                        ? 'border-2 border-[#FFD23F]/40 border-l-4 border-l-[#FFD23F] hover:border-[#B8860B]/60'
                        : 'border border-gray-200 hover:border-[#FFD23F]/50'
                    }`}
                    onClick={() => !isExpired && handleCouponClick(coupon)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    {/* Logo */}
                    <div className="flex-shrink-0 hidden sm:block">
                      {storeLogoUrl ? (
                        <div className="w-16 h-16 rounded-lg border-2 border-[#FFD23F]/30 flex items-center justify-center overflow-hidden bg-[#FFFBF0]">
                          <img
                            src={storeLogoUrl}
                            alt={store.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<div class="w-16 h-16 rounded-lg bg-gradient-to-br from-[#111111] to-[#B8860B] flex items-center justify-center"><span class="text-xl font-bold text-white">${store.name.charAt(0).toUpperCase()}</span></div>`;
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#111111] to-[#B8860B] flex items-center justify-center">
                          <span className="text-xl font-bold text-white">
                            {store.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-0 line-clamp-1">
                        {getCouponTitle(coupon)}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 hidden sm:block">
                        Verified and Hand Tested Code
                      </p>
                    </div>

                    {/* Button */}
                    <div className="flex-shrink-0">
                      {isExpired ? (
                        <div className="bg-red-100 text-red-700 text-[10px] sm:text-xs font-semibold px-2 py-1.5 sm:px-4 sm:py-2 rounded whitespace-nowrap">
                          Expired
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCouponClick(coupon);
                          }}
                          className="group/btn relative bg-gradient-to-r from-[#FFD23F] to-[#FFE566] border-2 border-dashed border-black/20 rounded-lg px-3 py-2 sm:px-6 sm:py-3 text-[#111111] font-semibold text-xs sm:text-base hover:from-[#111111] hover:to-[#111111] hover:text-white hover:border-black/30 transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap"
                        >
                          {copiedCode === coupon.code && isCode ? (
                            <span className="font-bold">{buttonLabel}</span>
                          ) : (
                            <>
                              <span className="group-hover/btn:hidden">{buttonLabel}</span>
                              {getLastTwoDigits(coupon) ? (
                                <span className="hidden group-hover/btn:inline font-bold">
                                  {buttonLabel} {getLastTwoDigits(coupon)}
                                </span>
                              ) : (
                                <span className="hidden group-hover/btn:inline font-bold">{buttonLabel}</span>
                              )}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Related Stores Section */}
      {relatedStores.length > 0 && (
        <div className="relative w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Related <span className="text-[#B8860B]">Stores</span>
              </h2>
              <p className="text-gray-600">Discover more amazing deals from similar stores</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedStores.map((relatedStore, index) => (
                <Link
                  key={relatedStore.id}
                  href={`/stores/${relatedStore.slug || relatedStore.id}`}
                  className="group"
                >
                  <motion.div
                    className="bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#FFD23F]/50 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={relatedStore.logoUrl || getStoreFaviconUrl(relatedStore)}
                        alt={relatedStore.name}
                        className="max-w-full max-h-full object-contain p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const faviconUrl = getStoreFaviconUrl(relatedStore);
                          // If logoUrl failed, try favicon
                          if (target.src !== faviconUrl && relatedStore.logoUrl) {
                            target.src = faviconUrl;
                          } else {
                            // If both failed, show gradient fallback
                            const parent = target.parentElement;
                            if (parent) {
                              target.style.display = 'none';
                              const fallback = document.createElement('div');
                              fallback.className = 'w-16 h-16 rounded-lg bg-gradient-to-br from-[#111111] to-[#B8860B] flex items-center justify-center';
                              fallback.innerHTML = `<span class="text-white font-bold text-xl">${relatedStore.name.charAt(0)}</span>`;
                              parent.appendChild(fallback);
                            }
                          }
                        }}
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#B8860B] transition-colors">
                      {relatedStore.name}
                    </h3>
                  </motion.div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/stores"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#FFD23F] text-[#111111] rounded-lg hover:bg-[#FFD23F] hover:text-[#111111] transition-all duration-300 font-semibold"
              >
                View All Stores
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Back to Stores Link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <Link
          href="/stores"
          className="inline-flex items-center gap-2 text-[#B8860B] hover:text-[#111111] font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to All Stores</span>
        </Link>
      </div>

      {/* Footer */}
      <Footer />

      {/* Coupon Popup */}
      <CouponPopup
        coupon={selectedCoupon}
        isOpen={showPopup}
        onClose={() => {
          setShowPopup(false);
          setSelectedCoupon(null);
        }}
        onContinue={handleContinue}
      />
    </div>
  );
}
