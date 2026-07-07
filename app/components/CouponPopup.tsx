'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Copy, ExternalLink, X } from 'lucide-react';
import { Coupon } from '@/lib/services/couponService';

interface CouponPopupProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function CouponPopup({ coupon, isOpen, onClose, onContinue }: CouponPopupProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setCopied(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !coupon) return null;

  const handleCopyCode = () => {
    if (coupon.couponType === 'code' && coupon.code) {
      navigator.clipboard.writeText(coupon.code.trim()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = coupon.code!.trim();
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const storeLabel = coupon.storeName || 'Store';
  const isCode = coupon.couponType === 'code' && coupon.code;

  return (
    <AnimatePresence>
      {isOpen && coupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close popup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm border-0 cursor-default"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="relative w-full max-w-[22rem] sm:max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="coupon-popup-title"
          >
            <div className="overflow-hidden rounded-2xl shadow-2xl shadow-black/40 border border-[#FFD23F]/25 bg-white">
              {/* Header */}
              <div className="relative bg-[#111111] px-5 pt-5 pb-4 text-center">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFD23F] mb-1">
                  {isCode ? 'Your coupon code' : 'Exclusive deal'}
                </p>
                <h2 id="coupon-popup-title" className="text-xl sm:text-2xl font-bold text-white">
                  {storeLabel}
                </h2>
              </div>

              {/* Body */}
              <div className="px-5 sm:px-6 py-5 bg-white">
                <div className="flex flex-col items-center mb-5">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#FFFBF0] border border-[#FFD23F]/30 flex items-center justify-center overflow-hidden shadow-sm mb-3">
                    {coupon.logoUrl ? (
                      <img
                        src={coupon.logoUrl}
                        alt={storeLabel}
                        className="w-full h-full object-contain p-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.parentElement) {
                            target.parentElement.innerHTML = `<span class="text-3xl font-bold text-[#B8860B]">${storeLabel.charAt(0).toUpperCase()}</span>`;
                          }
                        }}
                      />
                    ) : (
                      <span className="text-3xl font-bold text-[#B8860B]">
                        {storeLabel.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#111111]">{storeLabel}</p>
                  {coupon.url && (
                    <p className="text-xs text-gray-500 mt-0.5">{getDomainFromUrl(coupon.url)}</p>
                  )}
                </div>

                {isCode ? (
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className={`w-full rounded-xl border-2 border-dashed transition-all duration-200 mb-5 ${
                      copied
                        ? 'bg-[#FFFBF0] border-[#B8860B] shadow-inner'
                        : 'bg-[#111111] border-[#FFD23F]/50 hover:border-[#FFD23F] hover:shadow-lg hover:shadow-[#FFD23F]/10'
                    }`}
                  >
                    <div className="px-4 py-5 text-center">
                      <p
                        className={`text-2xl sm:text-3xl font-black tracking-[0.12em] mb-2 ${
                          copied ? 'text-[#B8860B]' : 'text-[#FFD23F]'
                        }`}
                      >
                        {coupon.code}
                      </p>
                      <p className={`text-[11px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 ${
                        copied ? 'text-[#B8860B]' : 'text-gray-400'
                      }`}>
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied to clipboard
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Tap code to copy
                          </>
                        )}
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="rounded-xl bg-[#FFFBF0] border border-[#FFD23F]/30 px-4 py-4 mb-5 text-center">
                    <p className="text-base font-bold text-[#111111] mb-1">Deal unlocked</p>
                    <p className="text-sm text-gray-600">
                      Continue to the store to claim this offer.
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (isCode) handleCopyCode();
                      onContinue();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#FFD23F] hover:bg-[#111111] hover:text-white text-[#111111] font-bold py-3.5 px-6 rounded-xl transition-colors shadow-md shadow-[#FFD23F]/20"
                  >
                    Continue to Store
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 text-sm font-medium text-gray-500 hover:text-[#111111] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
