import { siteConfig } from '@/lib/seo/config';
import FaqsPageClient from './FaqsPageClient';

export const metadata = {
  title: 'Support & FAQs',
  description: `Find answers to common questions about ${siteConfig.name} coupons, cashback, and account management.`,
  alternates: { canonical: `${siteConfig.url}/faqs` },
  openGraph: {
    title: 'Support & FAQs',
    description: `Find answers to common questions about ${siteConfig.name} coupons, cashback, and account management.`,
    url: `${siteConfig.url}/faqs`,
  },
};

export default function FAQsPage() {
  return <FaqsPageClient />;
}
