import { siteConfig } from '@/lib/seo/config';
import StoresPageClient from './StoresPageClient';

export const metadata = {
  title: 'All Stores – Coupons & Cashback',
  description: `Browse all stores on ${siteConfig.name} and find the best coupons, discount codes, and cashback deals in one place.`,
  alternates: { canonical: `${siteConfig.url}/stores` },
  openGraph: {
    title: 'All Stores – Coupons & Cashback',
    description: `Browse all stores on ${siteConfig.name} and find the best coupons, discount codes, and cashback deals in one place.`,
    url: `${siteConfig.url}/stores`,
  },
};

export default function StoresPage() {
  return <StoresPageClient />;
}
