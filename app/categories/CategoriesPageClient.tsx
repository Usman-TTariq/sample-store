'use client';

import Navbar from '@/app/components/Navbar';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import CategoriesGrid from '@/app/components/CategoriesGrid';
import Newsletter from '@/app/components/Newsletter';
import Footer from '@/app/components/Footer';

const CATEGORIES_BANNER = '/banners/categories-banner-1.webp';

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="w-full overflow-hidden bg-[#FFFBF0]">
        <div className="relative w-full min-h-[200px] sm:min-h-[240px] md:min-h-[280px] aspect-[4/3] sm:aspect-[1728/547]">
          <img
            src={CATEGORIES_BANNER}
            alt="Browse all categories — coupons and deals"
            className="absolute inset-0 w-full h-full object-cover object-left sm:object-center"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>

      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Categories' }
        ]}
      />

      {/* Categories Grid Section */}
      <CategoriesGrid />

      {/* Newsletter Subscription Section */}
      <Newsletter />

      {/* Footer */}
      <Footer />
    </div>
  );
}

