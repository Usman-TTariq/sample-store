import { siteConfig } from '@/lib/seo/config';
import PromotionsPageClient from './PromotionsPageClient';

export const metadata = {
  title: 'Promotions — Coupons & Deals',
  description: `Discover the best affiliate coupons, promo codes, and store deals on ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/promotions` },
  openGraph: {
    title: 'Promotions — Coupons & Deals',
    description: `Discover the best affiliate coupons, promo codes, and store deals on ${siteConfig.name}.`,
    url: `${siteConfig.url}/promotions`,
  },
};

export default function PromotionsPage() {
  return <PromotionsPageClient />;
}
