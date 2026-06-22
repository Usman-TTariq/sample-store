import { siteConfig } from '@/lib/seo/config';
import AboutUsPageClient from './AboutUsPageClient';

export const metadata = {
  title: `About ${siteConfig.name} – Our Story & Mission`,
  description: `Learn about ${siteConfig.name} – the platform dedicated to bringing you the best coupons, cashback, and exclusive deals every day.`,
  alternates: { canonical: `${siteConfig.url}/about-us` },
  openGraph: {
    title: `About ${siteConfig.name} – Our Story & Mission`,
    description: `Learn about ${siteConfig.name} – the platform dedicated to bringing you the best coupons, cashback, and exclusive deals every day.`,
    url: `${siteConfig.url}/about-us`,
  },
};

export default function AboutUsPage() {
  return <AboutUsPageClient />;
}
