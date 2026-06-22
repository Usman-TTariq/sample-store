'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Grid3X3, Store } from 'lucide-react';
import { getCategories, Category } from '@/lib/services/categoryService';
import { getStores, Store as StoreType } from '@/lib/services/storeService';
import StoreLogo from './StoreLogo';

const CATEGORY_EMOJI: Record<string, string> = {
  fashion: '👗',
  electronics: '💻',
  'food & dining': '🍔',
  'food-dining': '🍔',
  travel: '✈️',
  sports: '⚽',
  health: '💊',
  home: '🏠',
};

function getCategoryEmoji(name: string): string {
  const key = name.toLowerCase();
  return CATEGORY_EMOJI[key] || CATEGORY_EMOJI[key.replace(/\s+/g, '-')] || '🏷️';
}

function Accordion({
  title,
  icon,
  count,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count?: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${
        open ? 'border-[#FFD23F] shadow-lg shadow-[#FFD23F]/10' : 'border-gray-200 shadow-sm'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${
          open ? 'bg-gradient-to-r from-[#FFFBF0] to-white' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              open ? 'bg-[#FFD23F] text-black' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {icon}
          </div>
          <div>
            <span className="font-bold text-gray-900 block">{title}</span>
            {count !== undefined && (
              <span className="text-xs text-gray-500">{count} available</span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180 text-[#FFD23F]' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 border-t border-gray-100">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function HomeAccordions() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<StoreType[]>([]);
  const [openCategories, setOpenCategories] = useState(true);
  const [openStores, setOpenStores] = useState(true);

  useEffect(() => {
    Promise.all([getCategories(), getStores()])
      .then(([cats, strs]) => {
        setCategories(cats.slice(0, 12));
        setStores(strs.slice(0, 12));
      })
      .catch(console.error);
  }, []);

  return (
    <section className="bg-gradient-to-b from-[#FFFBF0] to-gray-50 py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="text-center mb-2">
          <h2 className="text-xl md:text-2xl font-black text-gray-900">Browse & Save</h2>
          <p className="text-sm text-gray-500 mt-1">Explore categories and top stores in one place</p>
        </div>

        <Accordion
          title="Popular Categories"
          icon={<Grid3X3 className="w-5 h-5" />}
          count={categories.length}
          open={openCategories}
          onToggle={() => setOpenCategories((v) => !v)}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="group relative flex flex-col items-center text-center p-4 rounded-xl border border-gray-200 bg-white hover:border-[#FFD23F] hover:shadow-xl hover:shadow-[#FFD23F]/15 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1 opacity-80"
                  style={{ backgroundColor: cat.backgroundColor || '#FFD23F' }}
                />
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${cat.backgroundColor || '#FFD23F'}22` }}
                >
                  {cat.logoUrl ? (
                    <img src={cat.logoUrl} alt={cat.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span>{getCategoryEmoji(cat.name)}</span>
                  )}
                </div>
                <span className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-black">
                  {cat.name}
                </span>
              </Link>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-gray-500 col-span-full text-center py-4">No categories available.</p>
            )}
          </div>
        </Accordion>

        <Accordion
          title="Popular Stores"
          icon={<Store className="w-5 h-5" />}
          count={stores.length}
          open={openStores}
          onToggle={() => setOpenStores((v) => !v)}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-4">
            {stores.map((store) => {
              const href = store.slug ? `/stores/${store.slug}` : `/stores/${store.id}`;
              return (
                <Link
                  key={store.id}
                  href={href}
                  className="group relative flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white hover:border-[#FFD23F] hover:shadow-xl hover:shadow-[#FFD23F]/15 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FFD23F] to-[#1D63FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-gray-50 p-1 group-hover:bg-[#FFFBF0] transition-colors">
                    <StoreLogo
                      name={store.name}
                      logoUrl={store.logoUrl}
                      websiteUrl={store.websiteUrl}
                      trackingLink={store.trackingLink}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-black">
                      {store.name}
                    </p>
                    {store.voucherText && (
                      <p className="text-[10px] text-gray-500 truncate">{store.voucherText}</p>
                    )}
                  </div>
                </Link>
              );
            })}
            {stores.length === 0 && (
              <p className="text-sm text-gray-500 col-span-full text-center py-4">No stores available.</p>
            )}
          </div>
        </Accordion>
      </div>
    </section>
  );
}
