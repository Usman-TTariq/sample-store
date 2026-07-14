'use client';

import { useEffect, useState } from 'react';
import { getLatestCoupons, Coupon } from '@/lib/services/couponService';
import { addToFavorites, removeFromFavorites, isFavorite } from '@/lib/services/favoritesService';
import { addNotification } from '@/lib/services/notificationsService';
import Link from 'next/link';
import CouponPopup from './CouponPopup';
import StoreLogo from './StoreLogo';
import GetCodeButton from './GetCodeButton';

export default function PopularCoupons() {
  const [coupons, setCoupons] = useState<(Coupon | null)[]>(Array(8).fill(null));
  const [loading, setLoading] = useState(true);
  const [revealedCoupons, setRevealedCoupons] = useState<Set<string>>(new Set());
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        console.log('🔍 Fetching latest coupons...');
        const data = await getLatestCoupons();
        console.log('✅ Fetched coupons:', data);
        console.log('📊 Number of coupons:', data.length);
        setCoupons(data.slice(0, 8));
      } catch (error) {
        console.error('❌ Error fetching coupons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // Listen for favorites updates
  useEffect(() => {
    const handleFavoritesUpdate = () => setUpdateTrigger(prev => prev + 1);

    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

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

    // Copy code to clipboard FIRST (before showing popup) - only for code type
    if (coupon.couponType === 'code' && coupon.code) {
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
    console.log('Attempting to copy:', text);

    // Method 1: Try modern clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Clipboard API success');
        addNotification({
          title: 'Code Copied!',
          message: `Coupon code "${text}" has been copied to clipboard.`,
          type: 'success'
        });
      }).catch((err) => {
        console.error('Clipboard API failed:', err);
        // Fallback to execCommand
        copyToClipboardFallback(text);
      });
    } else {
      console.log('Using fallback method');
      // Use fallback for browsers without clipboard API or non-secure contexts
      copyToClipboardFallback(text);
    }
  };

  const copyToClipboardFallback = (text: string) => {
    try {
      console.log('Using fallback copy method');
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // Make it invisible but still selectable
      textArea.style.position = 'fixed';
      textArea.style.left = '0';
      textArea.style.top = '0';
      textArea.style.width = '2px';
      textArea.style.height = '2px';
      textArea.style.opacity = '0';
      textArea.style.pointerEvents = 'none';
      textArea.style.zIndex = '-1';

      document.body.appendChild(textArea);

      // Select and copy
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999); // For mobile devices

      const successful = document.execCommand('copy');
      console.log('execCommand result:', successful);

      document.body.removeChild(textArea);

      if (successful) {
        addNotification({
          title: 'Code Copied!',
          message: `Coupon code "${text}" has been copied to clipboard.`,
          type: 'success'
        });
      } else {
        // If execCommand fails, show the code to user
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

  const handleToggleFavorite = (e: React.MouseEvent, coupon: Coupon) => {
    e.stopPropagation();
    if (!coupon.id) return;

    if (isFavorite(coupon.id)) {
      removeFromFavorites(coupon.id);
      addNotification({
        title: 'Removed from Favorites',
        message: `${coupon.code} has been removed from your favorites.`,
        type: 'info'
      });
    } else {
      addToFavorites({
        couponId: coupon.id,
        code: coupon.code,
        storeName: coupon.storeName,
        discount: coupon.discount,
        discountType: coupon.discountType,
        description: coupon.description,
        logoUrl: coupon.logoUrl,
        url: coupon.url,
        addedAt: Date.now()
      });
      addNotification({
        title: 'Added to Favorites',
        message: `${coupon.code} has been added to your favorites!`,
        type: 'success'
      });
    }
    window.dispatchEvent(new CustomEvent('favoritesUpdated'));
  };


  return (
    <section className="w-full py-10 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Top Deals</h2>
            <p className="text-xs text-gray-500 mt-1">Hand-picked coupons updated daily</p>
          </div>
          <Link
            href="/coupons"
            className="text-sm font-semibold text-gray-700 hover:text-black hover:underline"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {coupons.map((coupon, index) =>
              coupon ? (
                <div
                  key={coupon.id}
                  className="group relative border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center bg-white hover:border-[#FFD23F] hover:shadow-xl hover:shadow-[#FFD23F]/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD23F] to-[#1D63FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-12 h-12 mb-2 p-1 rounded-xl bg-gray-50 group-hover:bg-[#FFFBF0] transition-colors">
                    <StoreLogo
                      name={coupon.storeName || coupon.code || 'Deal'}
                      logoUrl={coupon.logoUrl}
                      websiteUrl={coupon.url}
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-900 line-clamp-1 mb-0.5">
                    {coupon.storeName || 'Store'}
                  </p>
                  <p className="text-[10px] text-gray-500 line-clamp-2 mb-3 min-h-[2rem]">
                    {coupon.description || coupon.discount || `${coupon.storeName || 'Store'} exclusive deal`}
                  </p>
                  <GetCodeButton
                    label={
                      coupon.id && revealedCoupons.has(coupon.id) && coupon.couponType === 'code' && coupon.code
                        ? 'Copied!'
                        : getCodePreview(coupon)
                    }
                    code={coupon.code}
                    isDeal={(coupon.couponType || 'deal') === 'deal'}
                    onClick={(e) => handleGetDeal(coupon, e)}
                  />
                </div>
              ) : (
                <div
                  key={`empty-${index}`}
                  className="border border-dashed border-gray-200 rounded-xl p-4 flex items-center justify-center min-h-[9rem] text-gray-400 text-xs bg-gray-50"
                >
                  Coming soon
                </div>
              )
            )}
          </div>
        )}
      </div>

      <CouponPopup
        coupon={selectedCoupon}
        isOpen={showPopup}
        onClose={handlePopupClose}
        onContinue={handlePopupContinue}
      />
    </section>
  );
}

