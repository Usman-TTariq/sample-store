'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { useEffect } from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/** Path trail for store pages (Promotions, Stores, etc). Not the home blog nav. */
export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const generateStructuredData = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    const itemListElement = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.label,
        ...(item.href && { item: `${baseUrl}${item.href}` }),
      })),
    ];

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement,
    };
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(generateStructuredData());
      script.id = 'page-breadcrumb-schema';

      const existing = document.getElementById('page-breadcrumb-schema');
      if (existing) existing.remove();

      document.head.appendChild(script);
    }

    return () => {
      document.getElementById('page-breadcrumb-schema')?.remove();
    };
  }, [items]);

  return (
    <nav aria-label="Breadcrumb" className={`w-full bg-white border-b border-[#FFD23F]/20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <ol className="flex items-center flex-wrap gap-2 text-sm">
          <li className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-gray-600 hover:text-[#E6BC2E] transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </li>

          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2 min-w-0">
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                {isLast || !item.href ? (
                  <span
                    className="text-[#B8860B] font-semibold px-3 py-1.5 bg-[#FFFBF0] rounded-lg border border-[#FFD23F]/40 truncate"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-[#E6BC2E] transition-colors font-medium hover:underline hover:underline-offset-4 px-2 py-1 rounded hover:bg-[#FFFBF0] truncate"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
