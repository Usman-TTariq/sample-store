import { siteConfig } from '@/lib/seo/config';
import TermsAndConditionsPageClient from './TermsAndConditionsPageClient';

export const metadata = {
  title: 'Terms and Conditions',
  description: `Review the terms and conditions for using ${siteConfig.name} coupon and cashback platform.`,
  alternates: { canonical: `${siteConfig.url}/terms-and-conditions` },
  openGraph: {
    title: 'Terms and Conditions',
    description: `Review the terms and conditions for using ${siteConfig.name} coupon and cashback platform.`,
    url: `${siteConfig.url}/terms-and-conditions`,
  },
};

export default function TermsAndConditionsPage() {
  return <TermsAndConditionsPageClient />;
}
