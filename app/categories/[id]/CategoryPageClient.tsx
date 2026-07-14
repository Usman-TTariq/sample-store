'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCategoryBySlugOrId, Category } from '@/lib/services/categoryService';
import { getStoresByCategoryId, Store } from '@/lib/services/storeService';
import { getCouponsByCategoryId, Coupon } from '@/lib/services/couponService';
import { addNotification } from '@/lib/services/notificationsService';
import Navbar from '@/app/components/Navbar';
import CouponPopup from '@/app/components/CouponPopup';
import GetCodeButton from '@/app/components/GetCodeButton';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import { Tag, CheckCircle, Calendar, ExternalLink, ArrowRight, Info } from 'lucide-react';
import { getCouponDisplayTitle } from '@/lib/utils/couponDisplay';
import { getCategoryCoverUrl, getCategoryEmoji, isCategoryImageUrl } from '@/lib/utils/categoryIcon';

export default function CategoryPageClient({ params }: { params: { id: string } }) {
  const idOrSlug = params.id;

  const [category, setCategory] = useState<Category | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedCoupons, setRevealedCoupons] = useState<Set<string>>(new Set());
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryData = await getCategoryBySlugOrId(idOrSlug);
        if (!categoryData?.id) {
          setCategory(null);
          setStores([]);
          setCoupons([]);
          return;
        }

        const [storesData, couponsData] = await Promise.all([
          getStoresByCategoryId(categoryData.id),
          getCouponsByCategoryId(categoryData.id),
        ]);

        setCategory(categoryData);
        setStores(storesData);
        setCoupons(couponsData);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      fetchData();
    }
  }, [idOrSlug]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return null;
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return null;
    }
  };

  // Get last 2 digits of code for code type coupons
  const getCodePreview = (coupon: Coupon): string => {
    if ((coupon.couponType || 'deal') === 'code' && coupon.code) {
      return coupon.getCodeText || 'Get Code';
    }
    return coupon.getDealText || 'Get Deal';
  };

  // Get last 2 digits for hover display
  const getLastTwoDigits = (coupon: Coupon): string | null => {
    if ((coupon.couponType || 'deal') === 'code' && coupon.code) {
      const code = coupon.code.trim();
      if (code.length >= 2) {
        return code.slice(-2);
      }
    }
    return null;
  };

  const handleGetDeal = (coupon: Coupon, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Copy code to clipboard FIRST (before showing popup)
    if (coupon.code) {
      const codeToCopy = coupon.code.trim();
      copyToClipboard(codeToCopy);
    }

    // Mark coupon as revealed
    if (coupon.id) {
      setRevealedCoupons(prev => new Set(prev).add(coupon.id!));
    }

    // Show popup
    setSelectedCoupon(coupon);
    setShowPopup(true);

    // Automatically open URL in new tab after a short delay (to ensure popup is visible first)
    if (coupon.url && coupon.url.trim()) {
      setTimeout(() => {
        window.open(coupon.url, '_blank', 'noopener,noreferrer');
      }, 500);
    }
  };

  const handlePopupContinue = () => {
    if (selectedCoupon?.url) {
      window.open(selectedCoupon.url, '_blank', 'noopener,noreferrer');
    }
    setShowPopup(false);
    setSelectedCoupon(null);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
    setSelectedCoupon(null);
  };

  const copyToClipboard = (text: string) => {
    // Method 1: Try modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        addNotification({
          title: 'Code Copied!',
          message: `Coupon code "${text}" has been copied to clipboard.`,
          type: 'success'
        });
      }).catch((err) => {
        console.error('Clipboard API failed:', err);
        copyToClipboardFallback(text);
      });
    } else {
      copyToClipboardFallback(text);
    }
  };

  const copyToClipboardFallback = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '0';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999);

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        addNotification({
          title: 'Code Copied!',
          message: `Coupon code "${text}" has been copied to clipboard.`,
          type: 'success'
        });
      } else {
        addNotification({
          title: 'Copy Manually',
          message: `Code: ${text} (Please copy manually)`,
          type: 'info'
        });
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      addNotification({
        title: 'Copy Manually',
        message: `Code: ${text} (Please copy manually)`,
        type: 'info'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-xl font-semibold text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Category Not Found</h1>
            <Link href="/categories" className="text-[#C7395F] hover:underline">
              Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Categories', href: '/categories' },
          { label: category?.name || 'Category' }
        ]}
      />

      {/* Category Header */}
      <div className="w-full bg-gradient-to-br from-brand-cyan/10 via-white to-brand-cyan/15 py-8 sm:py-12 md:py-16 border-b border-brand-cyan/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border border-tan">
              <img
                src={getCategoryCoverUrl(category.name)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-brand-navy/35" />
              <div className="absolute inset-0 flex items-center justify-center">
                {isCategoryImageUrl(category.logoUrl) ? (
                  <img
                    src={category.logoUrl!}
                    alt={category.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl drop-shadow">{getCategoryEmoji(category.name)}</span>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-brand-navy capitalize truncate">
                {category.name}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-brand-muted mt-0.5 sm:mt-1">
                {stores.length} {stores.length === 1 ? 'Store' : 'Stores'} · {coupons.length}{' '}
                {coupons.length === 1 ? 'Coupon' : 'Coupons'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12">
        {/* Stores Section */}
        {stores.length > 0 && (
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">Stores</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
              {stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.slug || store.id}`}
                  className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3 md:p-4 lg:p-6 hover:shadow-lg transition-shadow group"
                >
                  <div className="flex flex-col items-center text-center">
                    {store.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt={store.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain mb-2 sm:mb-3 md:mb-4 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2 sm:mb-3 md:mb-4">
                        <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-600">
                          {store.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-gray-800 mb-1 sm:mb-2 group-hover:text-[#C7395F] transition-colors line-clamp-2">
                      {store.name}
                    </h3>
                    {store.voucherText && (
                      <p className="text-xs sm:text-sm text-brand-navy font-medium line-clamp-1">{store.voucherText}</p>
                    )}
                    {store.description && (
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 line-clamp-2 hidden sm:block">{store.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Coupons Section */}
        {coupons.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 md:mb-6">Coupons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {coupons.map((coupon) => {
                const isRevealed = coupon.id && revealedCoupons.has(coupon.id);
                const isExpired = coupon.expiryDate && new Date(coupon.expiryDate as any) < new Date();

                return (
                  <div
                    key={coupon.id}
                    className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-shadow"
                    style={{ overflow: 'visible' }}
                  >
                    <div className="flex flex-col">
                      {coupon.logoUrl && (
                        <img
                          src={coupon.logoUrl}
                          alt={coupon.storeName || coupon.code}
                          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain mb-2 sm:mb-3 md:mb-4 mx-auto"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-1 sm:mb-2 text-center line-clamp-2">
                        {getCouponDisplayTitle(coupon)}
                      </h3>
                      {coupon.storeName && (
                        <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 text-center line-clamp-1">
                          {coupon.storeName}
                        </p>
                      )}
                      {isExpired && (
                        <div className="bg-red-100 text-red-700 text-xs font-semibold px-2 sm:px-3 py-1 rounded mb-2 sm:mb-3 md:mb-4 text-center">
                          Expired
                        </div>
                      )}
                      {!isExpired && (
                        <GetCodeButton
                          label={
                            isRevealed
                              ? coupon.url
                                ? 'Visit Store'
                                : coupon.code || getCodePreview(coupon)
                              : getCodePreview(coupon)
                          }
                          code={coupon.code}
                          isDeal={coupon.couponType === 'deal'}
                          onClick={(e) => handleGetDeal(coupon, e)}
                        />
                      )}
                      {isRevealed && coupon.code && (
                        <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-100 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Coupon Code:</p>
                          <p className="text-sm sm:text-base md:text-lg font-mono font-bold text-gray-800 text-center break-all">
                            {coupon.code}
                          </p>
                        </div>
                      )}
                      {coupon.expiryDate && (
                        <p className="text-xs text-gray-500 mt-2 sm:mt-3 text-center">
                          Expires: {formatDate(coupon.expiryDate)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stores.length === 0 && coupons.length === 0 && (
          <div className="text-center py-6 sm:py-8 md:py-12">
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">No stores or coupons found for this category.</p>
            <Link href="/categories" className="text-[#C7395F] hover:underline mt-2 sm:mt-4 inline-block text-sm sm:text-base">
              Browse All Categories
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}

      {/* Coupon Popup */}
      <CouponPopup
        coupon={selectedCoupon}
        isOpen={showPopup}
        onClose={handlePopupClose}
        onContinue={handlePopupContinue}
      />
    </div>
  );
}

