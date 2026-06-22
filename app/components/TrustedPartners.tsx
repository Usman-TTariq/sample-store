'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLogosWithLayout, Logo } from '@/lib/services/logoService';
import { getStores, Store } from '@/lib/services/storeService';
import StoreLogo from './StoreLogo';

const CASHBACK_RATES = ['7% CB', '10% CB', '5% CB', '7.8% CB', '3% CB', '6% CB', '8% CB', '4% CB', '9% CB', '5.5% CB'];

type CashbackItem = {
  id: string;
  name: string;
  href: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  trackingLink?: string | null;
};

export default function TrustedPartners() {
  const [items, setItems] = useState<CashbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const logos = await getLogosWithLayout();
        const validLogos = logos.filter((l): l is Logo => l !== null);

        if (validLogos.length >= 6) {
          setItems(
            validLogos.slice(0, 14).map((logo) => ({
              id: logo.id || logo.name,
              name: logo.name,
              href: logo.websiteUrl || '/stores',
              logoUrl: logo.logoUrl,
              websiteUrl: logo.websiteUrl,
            }))
          );
          return;
        }

        const stores = await getStores();
        setItems(
          stores.slice(0, 14).map((s: Store) => ({
            id: s.id || s.name,
            name: s.name,
            href: s.slug ? `/stores/${s.slug}` : `/stores/${s.id}`,
            logoUrl: s.logoUrl,
            websiteUrl: s.websiteUrl,
            trackingLink: s.trackingLink,
          }))
        );
      } catch (e) {
        console.error('Error loading cashback stores:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="bg-gradient-to-r from-white via-[#FFFBF0] to-white py-7 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <h2 className="text-sm font-black text-gray-900 whitespace-nowrap">Cash Back Stores</h2>
            <p className="text-[10px] text-gray-500">Earn while you shop</p>
          </div>

          <div className="flex-1 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-1">
              {loading
                ? [...Array(10)].map((_, i) => (
                    <div key={i} className="w-[72px] h-16 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                  ))
                : items.map((item, index) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="w-[72px] shrink-0 flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border border-gray-200 bg-white hover:border-[#1D63FF] hover:shadow-md hover:-translate-y-0.5 transition-all"
                    >
                      <StoreLogo
                        name={item.name}
                        logoUrl={item.logoUrl}
                        websiteUrl={item.websiteUrl}
                        trackingLink={item.trackingLink}
                        className="w-9 h-7"
                        imgClassName="max-w-full max-h-full object-contain"
                      />
                      <span className="text-[10px] font-bold text-[#1D63FF]">
                        {CASHBACK_RATES[index % CASHBACK_RATES.length]}
                      </span>
                    </Link>
                  ))}
            </div>
          </div>

          <Link
            href="/stores"
            className="text-sm font-bold text-[#1D63FF] hover:underline whitespace-nowrap shrink-0"
          >
            All stores →
          </Link>
        </div>
      </div>
    </section>
  );
}
