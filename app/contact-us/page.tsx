import { siteConfig } from '@/lib/seo/config';
import ContactUsPageClient from './ContactUsPageClient';

export const metadata = {
  title: 'Contact Us',
  description: `Get in touch with the ${siteConfig.name} team. We are available 24/7 to help with coupons, cashback, and account support.`,
  alternates: { canonical: `${siteConfig.url}/contact-us` },
  openGraph: {
    title: 'Contact Us',
    description: `Get in touch with the ${siteConfig.name} team. We are available 24/7 to help with coupons, cashback, and account support.`,
    url: `${siteConfig.url}/contact-us`,
  },
};

export default function ContactUsPage() {
  return <ContactUsPageClient />;
}
