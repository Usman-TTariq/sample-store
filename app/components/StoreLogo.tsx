'use client';

import { useMemo, useState } from 'react';
import { getStoreLogoCandidates } from '@/lib/utils/storeImages';

type StoreLogoProps = {
  name: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  trackingLink?: string | null;
  className?: string;
  imgClassName?: string;
};

export default function StoreLogo({
  name,
  logoUrl,
  websiteUrl,
  trackingLink,
  className = 'w-12 h-12',
  imgClassName = 'w-full h-full object-contain',
}: StoreLogoProps) {
  const candidates = useMemo(
    () => getStoreLogoCandidates(logoUrl, websiteUrl, trackingLink, name),
    [logoUrl, websiteUrl, trackingLink, name]
  );
  const [index, setIndex] = useState(0);

  const src = candidates[index];
  const initial = name?.charAt(0)?.toUpperCase() || '?';

  if (!src) {
    return (
      <div
        className={`${className} rounded-lg bg-gradient-to-br from-[#FFD23F] to-[#E6BC2E] flex items-center justify-center text-black font-black text-lg`}
      >
        {initial}
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center overflow-hidden`}>
      <img
        src={src}
        alt={name}
        className={imgClassName}
        loading="lazy"
        onError={() => {
          if (index < candidates.length - 1) setIndex((i) => i + 1);
        }}
      />
    </div>
  );
}
