import CouponsPageClient from '../coupons/CouponsPageClient';
import Footer from '@/app/components/Footer';
import { siteConfig } from '@/lib/seo/config';

export const metadata = {
  title: 'Promotions & Verified Deals',
  description: `Browse hand-picked promo codes and exclusive deals from top brands on ${siteConfig.name}. Verified daily — save more on every purchase.`,
  alternates: { canonical: `${siteConfig.url}/promotions` },
  openGraph: {
    title: 'Promotions & Verified Deals',
    description: `Browse hand-picked promo codes and exclusive deals from top brands on ${siteConfig.name}. Verified daily.`,
    url: `${siteConfig.url}/promotions`,
  },
};

export default function PromotionsPage() {
  return (
    <>
      <CouponsPageClient />
      <Footer />
    </>
  );
}
