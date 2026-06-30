'use client';

import { BLOG_NAV_CATEGORIES } from '@/lib/utils/articleHome';

type BlogCategoryNavProps = {
  activeCategory: string;
  onCategoryChange: (id: string) => void;
};

export default function BlogCategoryNav({ activeCategory, onCategoryChange }: BlogCategoryNavProps) {
  return (
    <nav className="bg-black border-t border-gray-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap justify-center items-center py-3.5 sm:py-4 gap-y-2">
          {BLOG_NAV_CATEGORIES.map((cat, i) => (
            <li key={cat.id} className="flex items-center shrink-0">
              {i > 0 && (
                <span className="text-gray-600 text-sm px-2 sm:px-3 lg:px-5 select-none font-light" aria-hidden>
                  |
                </span>
              )}
              <button
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                className={`text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] sm:tracking-widest whitespace-nowrap pb-1 border-b-[3px] transition-colors ${
                  activeCategory === cat.id
                    ? 'text-white border-[#FFD23F]'
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
