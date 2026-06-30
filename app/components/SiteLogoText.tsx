import { siteConfig } from '@/lib/seo/config';

type SiteLogoTextProps = {
  className?: string;
  primaryClassName?: string;
  accentClassName?: string;
};

export default function SiteLogoText({
  className = 'text-2xl font-bold tracking-tight leading-none',
  primaryClassName = 'text-white',
  accentClassName = 'text-[#FFD23F]',
}: SiteLogoTextProps) {
  return (
    <span className={className}>
      <span className={primaryClassName}>{siteConfig.logo.primary}</span>
      <span className={accentClassName}>{siteConfig.logo.accent}</span>
    </span>
  );
}
