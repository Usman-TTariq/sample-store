'use client';

import { useEffect, useState } from 'react';
import { getBannerByLayoutPosition, Banner } from '@/lib/services/bannerService';
import Navbar from '@/app/components/Navbar';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import CategoriesGrid from '@/app/components/CategoriesGrid';

const CATEGORIES_HERO =
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80';

function CategoriesHero({
  imageUrl,
  title,
  subtitle,
}: {
  imageUrl: string;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="relative w-full aspect-[1728/547] min-h-[180px] sm:min-h-[240px] max-h-[420px] overflow-hidden">
      <img
        src={imageUrl}
        alt={title || 'Shop by category'}
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== CATEGORIES_HERO) {
            target.src = CATEGORIES_HERO;
          }
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/75 via-brand-navy/45 to-brand-navy/20" />
      <div className="absolute inset-0 flex items-center">
        <div className="home-container w-full py-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-brand-cyan mb-2">
            Browse &amp; Save
          </p>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight max-w-xl leading-tight">
            {title || 'Shop by Category'}
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-white/85 max-w-md">
            {subtitle ||
              'Find verified coupons across fashion, electronics, beauty, travel, and more.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      setLoading(true);
      try {
        const data = await getBannerByLayoutPosition(6);
        setBanner(data);
      } catch (error) {
        console.error('Error fetching categories banner:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  const heroImage =
    banner?.imageUrl && banner.imageUrl.length > 20 ? banner.imageUrl : CATEGORIES_HERO;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="w-full">
        {loading ? (
          <div className="w-full aspect-[1728/547] min-h-[180px] bg-brand-navy/10 animate-pulse" />
        ) : (
          <CategoriesHero
            imageUrl={heroImage}
            title={banner?.title || undefined}
          />
        )}
      </div>

      <Breadcrumbs items={[{ label: 'Categories' }]} />

      <CategoriesGrid />
    </div>
  );
}
