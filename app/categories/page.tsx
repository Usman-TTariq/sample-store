import { siteConfig } from '@/lib/seo/config';
import CategoriesPageClient from './CategoriesPageClient';

export const metadata = {
  title: 'Coupon Categories – Shop by Deal Type',
  description: `Explore coupon categories on ${siteConfig.name}. Find deals on fashion, electronics, food, travel, and more.`,
  alternates: { canonical: `${siteConfig.url}/categories` },
  openGraph: {
    title: 'Coupon Categories – Shop by Deal Type',
    description: `Explore coupon categories on ${siteConfig.name}. Find deals on fashion, electronics, food, travel, and more.`,
    url: `${siteConfig.url}/categories`,
  },
};

export default function CategoriesPage() {
  return <CategoriesPageClient />;
}
