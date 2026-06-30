'use client';

import { useRouter } from 'next/navigation';
import { Tag, Store as StoreIcon } from 'lucide-react';
import { Coupon } from '@/lib/services/couponService';
import { Store } from '@/lib/services/storeService';
import { Category } from '@/lib/services/categoryService';
import { getCouponLabel, getCouponSubtitle } from '@/lib/utils/search';
import { SearchSuggestionResults } from '@/lib/hooks/useSearchSuggestions';

function storeFaviconUrl(store: Store): string {
  let domain = '';
  if (store.websiteUrl) {
    try {
      domain = new URL(store.websiteUrl).hostname.replace('www.', '');
    } catch {
      /* ignore */
    }
  } else if (store.trackingLink) {
    try {
      domain = new URL(store.trackingLink).hostname.replace('www.', '');
    } catch {
      /* ignore */
    }
  }
  if (!domain && store.name) {
    const nameLower = store.name.toLowerCase();
    domain = nameLower.includes('.') ? nameLower.replace(/\s+/g, '') : `${nameLower.replace(/\s+/g, '')}.com`;
  }
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

type SearchSuggestionsDropdownProps = {
  query: string;
  results: SearchSuggestionResults;
  show: boolean;
  loading?: boolean;
  onClose: () => void;
  className?: string;
};

export default function SearchSuggestionsDropdown({
  query,
  results,
  show,
  loading = false,
  onClose,
  className = '',
}: SearchSuggestionsDropdownProps) {
  const router = useRouter();
  const trimmed = query.trim();

  if (!show || !trimmed) return null;

  const { stores, coupons, categories } = results;
  const hasResults = stores.length > 0 || coupons.length > 0 || categories.length > 0;

  const goToSearch = () => {
    onClose();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const goToStore = (store: Store) => {
    onClose();
    router.push(`/stores/${store.slug || store.id}`);
  };

  const goToCategory = (category: Category) => {
    onClose();
    router.push(`/categories/${category.id}`);
  };

  const goToCoupon = (coupon: Coupon) => {
    onClose();
    if (coupon.url) {
      window.open(coupon.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (coupon.storeName) {
      router.push(`/search?q=${encodeURIComponent(coupon.storeName)}`);
    }
  };

  return (
    <div
      className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-[150] max-h-96 overflow-y-auto ${className}`}
    >
      {loading && !hasResults && (
        <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
      )}

      {!loading && !hasResults && (
        <div className="px-4 py-3 text-sm text-gray-500">No suggestions — press Search for full results</div>
      )}

      {stores.length > 0 && (
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Stores</div>
          {stores.map((store) => (
            <button
              key={store.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goToStore(store)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                <img
                  src={store.logoUrl || storeFaviconUrl(store)}
                  alt=""
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">{store.name}</div>
                {store.description && (
                  <div className="text-xs text-gray-500 truncate">{store.description}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {coupons.length > 0 && (
        <div className={`p-2 ${stores.length > 0 ? 'border-t border-gray-100' : ''}`}>
          <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Coupons</div>
          {coupons.map((coupon) => (
            <button
              key={coupon.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goToCoupon(coupon)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#FFFBF0] border border-[#FFD23F]/30 flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-[#B8860B]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">{getCouponLabel(coupon)}</div>
                <div className="text-xs text-gray-500 truncate">{getCouponSubtitle(coupon)}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <div className={`p-2 ${stores.length > 0 || coupons.length > 0 ? 'border-t border-gray-100' : ''}`}>
          <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Categories</div>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => goToCategory(category)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: category.backgroundColor || '#ccc' }}
              >
                {category.logoUrl ? (
                  <img src={category.logoUrl} className="w-6 h-6 object-contain" alt="" />
                ) : (
                  category.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 truncate">{category.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="p-2 border-t border-gray-100">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={goToSearch}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-[#B8860B] hover:bg-[#FFFBF0] rounded-lg transition-colors"
        >
          <StoreIcon className="w-4 h-4" />
          View all results for &quot;{trimmed}&quot;
        </button>
      </div>
    </div>
  );
}
