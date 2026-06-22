import { siteConfig } from '@/lib/seo/config';
import CouponsPageClient from './CouponsPageClient';

export const metadata = {
  title: 'Latest Coupons & Promo Codes',
  description: `Browse the latest verified coupons and promo codes on ${siteConfig.name}. Updated daily with fresh discounts from top brands.`,
  alternates: { canonical: `${siteConfig.url}/coupons` },
  openGraph: {
    title: 'Latest Coupons & Promo Codes',
    description: `Browse the latest verified coupons and promo codes on ${siteConfig.name}. Updated daily with fresh discounts from top brands.`,
    url: `${siteConfig.url}/coupons`,
  },
};

export default function CouponsPage() {
  return <CouponsPageClient />;
}
