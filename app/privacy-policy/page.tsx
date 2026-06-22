import { siteConfig } from '@/lib/seo/config';
import PrivacyPolicyPageClient from './PrivacyPolicyPageClient';

export const metadata = {
  title: 'Privacy Policy',
  description: `Read ${siteConfig.name} privacy policy to understand how we collect, use, and protect your personal information.`,
  alternates: { canonical: `${siteConfig.url}/privacy-policy` },
  openGraph: {
    title: 'Privacy Policy',
    description: `Read ${siteConfig.name} privacy policy to understand how we collect, use, and protect your personal information.`,
    url: `${siteConfig.url}/privacy-policy`,
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageClient />;
}
