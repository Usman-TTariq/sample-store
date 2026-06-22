'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { getStores, Store } from '@/lib/services/storeService';
import StoreLogo from './StoreLogo';

export default function FeaturedDeals() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStores()
      .then((data) => {
        const featured = data.filter((s) => s.isTrending);
        const pool = featured.length >= 4 ? featured : data;
        setStores(pool.slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stores.length === 0) return null;

  return (
    <section className="bg-white py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FFD23F]" />
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Featured Deals</h2>
          </div>
          <Link href="/stores" className="text-sm font-semibold text-gray-700 hover:text-black hover:underline">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {stores.map((store, i) => {
            const href = store.slug ? `/stores/${store.slug}` : `/stores/${store.id}`;
            const discount = store.voucherText || 'Exclusive offer';

            return (
              <div
                key={store.id}
                className="group relative border border-gray-200 rounded-xl p-4 flex flex-col items-center text-center bg-white hover:border-[#FFD23F] hover:shadow-xl hover:shadow-[#FFD23F]/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD23F] to-[#1D63FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                {i === 0 && (
                  <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide bg-[#FFD23F] text-black px-2 py-0.5 rounded-full">
                    Hot
                  </span>
                )}
                <div className="w-12 h-12 mb-2 p-1 rounded-xl bg-gray-50 group-hover:bg-[#FFFBF0] transition-colors">
                  <StoreLogo
                    name={store.name}
                    logoUrl={store.logoUrl}
                    websiteUrl={store.websiteUrl}
                    trackingLink={store.trackingLink}
                    className="w-full h-full"
                  />
                </div>
                <p className="text-xs font-bold text-gray-900 line-clamp-1 mb-0.5">{store.name}</p>
                <p className="text-[10px] text-gray-500 line-clamp-2 mb-3 min-h-[2rem]">{discount}</p>
                <Link
                  href={href}
                  className="w-full py-2 rounded-full bg-[#FFD23F] text-black text-[10px] font-bold hover:bg-black hover:text-white transition-colors shadow-sm"
                >
                  Get Deal
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
