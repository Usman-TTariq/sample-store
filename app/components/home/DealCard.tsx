'use client';

import { useState } from 'react';
import { Coupon } from '@/lib/services/couponService';
import { getCouponDisplayTitle } from '@/lib/utils/couponDisplay';
import CouponPopup from '../CouponPopup';
import GetCodeButton from '../GetCodeButton';

interface DealCardProps {
  coupon: Coupon;
  tag?: string;
}

function formatDiscount(coupon: Coupon): string {
  if (coupon.discountType === 'percentage' && coupon.discount) {
    return `${coupon.discount}% OFF`;
  }
  if (coupon.discount) {
    return `$${coupon.discount} OFF`;
  }
  return 'DEAL';
}

export default function DealCard({ coupon, tag = 'ONLINE ONLY' }: DealCardProps) {
  const [showPopup, setShowPopup] = useState(false);

  const ctaLabel =
    coupon.couponType === 'code'
      ? coupon.getCodeText || 'Get Code'
      : coupon.getDealText || 'Get Deal';

  const handleClick = () => {
    if (coupon.couponType === 'code' && coupon.code) {
      navigator.clipboard?.writeText(coupon.code.trim()).catch(() => {});
    }
    setShowPopup(true);
    if (coupon.url?.trim()) {
      setTimeout(() => window.open(coupon.url, '_blank', 'noopener,noreferrer'), 500);
    }
  };

  return (
    <>
      <article className="deal-card flex flex-col h-full p-4 group">
        <span className="text-[10px] font-bold tracking-wider text-brand-navy bg-brand-cyan/20 self-start px-2 py-0.5 rounded mb-3">
          {tag}
        </span>

        <div className="flex items-center justify-center h-14 mb-3">
          {coupon.logoUrl ? (
            <img
              src={coupon.logoUrl}
              alt={coupon.storeName || 'Store'}
              className="max-h-12 max-w-[120px] object-contain"
            />
          ) : (
            <span className="text-2xl font-bold text-brand-navy">
              {(coupon.storeName || coupon.code || '?').charAt(0)}
            </span>
          )}
        </div>

        <p className="text-lg font-extrabold text-brand-navy text-center mb-2">
          {formatDiscount(coupon)}
        </p>

        <p className="text-sm font-semibold text-brand-navy text-center line-clamp-2 mb-1">
          {getCouponDisplayTitle(coupon)}
        </p>

        {coupon.storeName && (
          <p className="text-xs text-brand-muted text-center line-clamp-1 mb-4 flex-grow">
            {coupon.storeName}
          </p>
        )}

        <GetCodeButton
          className="mt-auto"
          label={ctaLabel}
          code={coupon.code}
          isDeal={coupon.couponType === 'deal'}
          onClick={handleClick}
        />
      </article>

      <CouponPopup
          coupon={coupon}
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          onContinue={() => {
            if (coupon.url) window.open(coupon.url, '_blank', 'noopener,noreferrer');
            setShowPopup(false);
          }}
        />
    </>
  );
}
