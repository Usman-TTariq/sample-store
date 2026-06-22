import { siteConfig } from '@/lib/seo/config';
import BlogsPageClient from './BlogsPageClient';

export const metadata = {
  title: 'Blog – Savings Tips & Deal News',
  description: `Read the ${siteConfig.name} blog for money-saving tips, coupon guides, and the latest cashback news.`,
  alternates: { canonical: `${siteConfig.url}/blogs` },
  openGraph: {
    title: 'Blog – Savings Tips & Deal News',
    description: `Read the ${siteConfig.name} blog for money-saving tips, coupon guides, and the latest cashback news.`,
    url: `${siteConfig.url}/blogs`,
  },
};

export default function BlogsPage() {
  return <BlogsPageClient />;
}
