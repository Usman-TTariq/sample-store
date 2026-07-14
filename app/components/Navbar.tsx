"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCategories, Category } from "@/lib/services/categoryService";
import { getStores, Store } from "@/lib/services/storeService";
import { getFavoritesCount } from "@/lib/services/favoritesService";
import { getUnreadCount, initializeSampleNotifications } from "@/lib/services/notificationsService";
import { categoryPath } from "@/lib/utils/categorySlug";
import { siteConfig } from "@/lib/seo/config";
import SiteLogoText from "@/app/components/SiteLogoText";
import SearchSuggestionsDropdown from "@/app/components/SearchSuggestionsDropdown";
import { useSearchSuggestions } from "@/lib/hooks/useSearchSuggestions";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Search, Menu, X, ChevronDown, User,
  Heart, Moon, Phone
} from "lucide-react";

// Helper function to get favicon URL from store data
const getStoreFaviconUrl = (store: Store): string => {
  // Try to extract domain from websiteUrl or trackingLink
  let domain = '';

  if (store.websiteUrl) {
    try {
      domain = new URL(store.websiteUrl).hostname.replace('www.', '');
    } catch (e) {
      console.error('Invalid websiteUrl:', store.websiteUrl);
    }
  } else if (store.trackingLink) {
    try {
      domain = new URL(store.trackingLink).hostname.replace('www.', '');
    } catch (e) {
      console.error('Invalid trackingLink:', store.trackingLink);
    }
  }

  // If no domain found, try to construct from store name
  if (!domain && store.name) {
    // Check if name already looks like a domain (contains a dot)
    const nameLower = store.name.toLowerCase();
    if (nameLower.includes('.')) {
      // Name already looks like a domain, use it as-is
      domain = nameLower.replace(/\s+/g, '');
    } else {
      // Convert store name to potential domain (e.g., "SamBoat" -> "samboat.com")
      domain = nameLower.replace(/\s+/g, '') + '.com';
    }
  }

  // Return Google's favicon service URL
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
};

type NavbarProps = {
  /** `home` = hide white bottom nav. `full` = complete store navbar (promotions, stores, etc.). */
  variant?: 'home' | 'full';
};

function isNavLinkActive(pathname: string, path: string): boolean {
  if (path === '/') return pathname === '/';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function Navbar({ variant = 'full' }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const mainHeaderRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const [isBottomBarPinned, setIsBottomBarPinned] = useState(false);
  const [bottomBarHeight, setBottomBarHeight] = useState(56);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const [mobileNavHeight, setMobileNavHeight] = useState(0);

  // Data State
  const [categories, setCategories] = useState<Category[]>([]);
  const [trendingStores, setTrendingStores] = useState<Store[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (variant !== 'full') return;
    const header = mainHeaderRef.current;
    if (header) {
      setIsBottomBarPinned(header.getBoundingClientRect().bottom <= 0);
    } else {
      setIsBottomBarPinned(latest > 120);
    }
  });

  useLayoutEffect(() => {
    if (variant !== 'full') return;
    const bar = bottomBarRef.current;
    if (!bar) return;

    const updateHeight = () => setBottomBarHeight(bar.getBoundingClientRect().height);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [variant]);

  useEffect(() => {
    if (variant !== 'full') return;

    const header = mainHeaderRef.current;
    if (!header) return;

    const onScroll = () => {
      setIsBottomBarPinned(header.getBoundingClientRect().bottom <= 0);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [variant]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, stores] = await Promise.all([
          getCategories(),
          getStores()
        ]);
        setCategories(cats);
        setTrendingStores(stores);
      } catch (error) {
        console.error('Error fetching navbar data:', error);
      }
    };
    fetchData();
    initializeSampleNotifications();
    updateCounts();

    const handleUpdate = () => updateCounts();
    window.addEventListener('notificationUpdated', handleUpdate);
    window.addEventListener('favoritesUpdated', handleUpdate);

    return () => {
      window.removeEventListener('notificationUpdated', handleUpdate);
      window.removeEventListener('favoritesUpdated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const measure = () => {
      if (mobileNavRef.current) {
        setMobileNavHeight(mobileNavRef.current.offsetHeight);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (pathname === '/search' && typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('q') || '';
      setSearchQuery(q);
    }
  }, [pathname]);

  const updateCounts = () => {
    setFavoritesCount(getFavoritesCount());
    setNotificationsCount(getUnreadCount());
  };

  const { results: searchResults, loading: searchLoading } = useSearchSuggestions(searchQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    setMobileMenuOpen(false);
    const query = searchQuery.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.trim().length > 0);
  };

  // --- Dropdown Components ---

  // 1. Categories Mega Menu
  const CategoriesMenu = () => (
    <div className="grid grid-cols-4 gap-4 p-5 w-[650px] bg-white rounded-b-xl shadow-xl border border-gray-200 mt-2">
      <div className="col-span-3 grid grid-cols-2 gap-x-6 gap-y-2">
        {categories.slice(0, 10).map((cat) => (
          <Link key={cat.id} href={categoryPath(cat)} className="flex items-center gap-2 group/item p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] text-white font-bold" style={{ backgroundColor: cat.backgroundColor || '#ccc' }}>
              {cat.logoUrl ? <img src={cat.logoUrl} className="w-4 h-4 object-contain" /> : cat.name.charAt(0)}
            </div>
            <span className="text-sm text-gray-700 font-medium group-hover/item:text-[#B8860B] transition-colors">{cat.name}</span>
          </Link>
        ))}
      </div>
      <div className="col-span-1 bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
        <h4 className="font-bold text-gray-900 mb-1 text-sm">All Categories</h4>
        <p className="text-[10px] text-gray-500 mb-3">Explore thousands of products</p>
        <Link href="/categories" className="text-[10px] bg-[#FFD23F] text-black px-3 py-1.5 rounded hover:bg-black hover:text-white transition-colors">
          View All
        </Link>
      </div>
    </div>
  );

  // 2. Stores Mega Menu
  const StoresMenu = () => (
    <div className="grid grid-cols-4 gap-4 p-5 w-[650px] bg-white rounded-b-xl shadow-xl border border-gray-200 mt-2">
      <div className="col-span-3 grid grid-cols-2 gap-x-6 gap-y-2">
        {trendingStores.slice(0, 10).map((store) => (
          <Link key={store.id} href={store.slug ? `/stores/${store.slug}` : `/stores/${store.id}`} className="flex items-center gap-2 group/item p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center overflow-hidden">
              <img
                src={store.logoUrl || getStoreFaviconUrl(store)}
                alt={store.name}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  // If logoUrl failed, try favicon
                  const faviconUrl = getStoreFaviconUrl(store);
                  if (target.src !== faviconUrl && store.logoUrl) {
                    target.src = faviconUrl;
                  } else {
                    // If both failed, show gradient badge
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD23F] to-[#FFE566] flex items-center justify-center text-black text-xs font-bold">${store.name.charAt(0).toUpperCase()}</div>`;
                    }
                  }
                }}
              />
            </div>
            <span className="text-sm text-gray-700 font-medium group-hover/item:text-[#B8860B] transition-colors truncate">{store.name}</span>
          </Link>
        ))}
      </div>
      <div className="col-span-1 bg-gray-50 rounded-lg p-4 flex flex-col items-center justify-center text-center">
        <h4 className="font-bold text-gray-900 mb-1 text-sm">Top Stores</h4>
        <p className="text-[10px] text-gray-500 mb-3">Find best coupons</p>
        <Link href="/stores" className="text-[10px] bg-[#FFD23F] text-black px-3 py-1.5 rounded hover:bg-black hover:text-white transition-colors">
          View All
        </Link>
      </div>
    </div>
  );

  // 3. Simple List Menu
  const SimpleMenu = ({ items }: { items: { label: string; href: string }[] }) => (
    <div className="w-48 bg-white rounded-b-xl shadow-xl border border-gray-200 py-2">
      {items.map((item) => (
        <Link key={item.label} href={item.href} className="block px-4 py-2 text-sm text-gray-600 hover:text-[#E6BC2E] hover:bg-gray-50 font-medium">
          {item.label}
        </Link>
      ))}
    </div>
  );

  const navLinks = [
    { name: "Home", path: "/", component: null },
    { name: "Stores", path: "/stores", component: <StoresMenu /> },
    { name: "Categories", path: "/categories", component: <CategoriesMenu /> },
    { name: "Promotions", path: "/promotions", component: null },
    {
      name: "Pages",
      path: "/about-us",
      component: <SimpleMenu items={[
        { label: "About Us", href: "/about-us" },
        { label: "Contact Us", href: "/contact-us" },
        { label: "Privacy Policy", href: "/privacy-policy" }
      ]} />
    },
  ];

  return (
    <>
      <div ref={mobileNavRef} className="relative z-[120]">
      <div ref={mainHeaderRef} id="navbar-main-header">
      {/* Main header bar */}
      <div className="bg-gradient-to-br from-[#111111] to-black py-2.5 sm:py-2 border-b border-gray-700/50 font-sans text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-8">

            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <img
                src={siteConfig.icon}
                alt={`${siteConfig.name} Icon`}
                className="w-10 h-10 object-contain"
              />
              <SiteLogoText />
            </Link>


            <div className="hidden lg:flex flex-1 max-w-2xl mx-auto relative">
              <form action="/search" method="get" onSubmit={handleSearch} className="flex w-full bg-white rounded-full p-1 shadow-lg items-center relative z-20 h-[46px]">
                <div className="pl-4 pr-2 flex items-center">
                  <Search className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="search"
                  name="q"
                  placeholder="Search for stores, coupons, categories..."
                  className="flex-1 px-2 py-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400 text-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  autoComplete="off"
                />
                <button type="submit" className="mr-1 bg-[#FFD23F] text-black px-6 py-2 rounded-full font-bold text-xs hover:bg-black hover:text-white transition-all hover:shadow-md">
                  Search
                </button>
              </form>

              <SearchSuggestionsDropdown
                query={searchQuery}
                results={searchResults}
                show={showSuggestions && searchQuery.trim().length > 0}
                loading={searchLoading}
                onClose={() => setShowSuggestions(false)}
              />
            </div>

            <div className="flex items-center gap-6 text-white">
              <div className="hidden lg:flex items-center gap-2 pr-4 border-r border-gray-700/50">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"><Phone className="w-4 h-4 text-[#B8860B]" /></div>
                <div className="flex flex-col leading-none">
                  <span className="text-[10px] text-gray-300 font-medium tracking-wide">Hotline:</span>
                  <span className="text-sm font-bold text-black">196475</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="hidden sm:block hover:text-[#FFD23F] transition-colors text-white"><Moon className="w-5 h-5" /></button>
                <Link href="/favorites" className="relative hover:text-[#FFD23F] transition-colors text-white">
                  <Heart className="w-5 h-5" />
                  {favoritesCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#FFD23F] rounded-full"></span>}
                </Link>
                <Link href="/notifications" className="hover:text-[#FFD23F] transition-colors text-white"><User className="w-5 h-5" /></Link>
                <button
                  type="button"
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                  className="lg:hidden p-1.5 ml-1 text-white rounded-md border border-[#FFD23F]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD23F]"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* 3. BOTTOM BAR (Sticky) — desktop only; hidden on homepage */}
      {variant === 'full' && (
      <>
      <div
        ref={bottomBarRef}
        className={`w-full hidden lg:block z-[100] transition-colors duration-300 ${
          isBottomBarPinned
            ? 'fixed top-0 left-0 right-0 bg-[#111111] border-b border-[#FFD23F]/20 shadow-lg shadow-black/30'
            : 'relative bg-[#FFFBF0] border-b border-[#FFD23F]/30'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = isNavLinkActive(pathname, link.path);
                return (
                <div key={link.name} className="relative group h-14 flex items-center" onMouseEnter={() => setActiveDropdown(link.name)} onMouseLeave={() => setActiveDropdown(null)}>
                  <Link
                    href={link.path}
                    className={`text-[13px] font-bold flex items-center gap-1 transition-colors uppercase tracking-wide ${
                      isBottomBarPinned
                        ? isActive
                          ? 'text-[#FFD23F] hover:text-[#FFD23F]'
                          : 'text-gray-300 hover:text-[#FFD23F]'
                        : isActive
                          ? 'text-[#B8860B] hover:text-[#E6BC2E]'
                          : 'text-[#111111] hover:text-[#B8860B]'
                    }`}
                  >
                    {link.name}
                    {link.component && (
                      <ChevronDown className={`w-3.5 h-3.5 mt-0.5 group-hover:rotate-180 transition-transform duration-300 ${
                        isBottomBarPinned
                          ? activeDropdown === link.name
                            ? 'rotate-180 text-[#FFD23F]'
                            : 'text-gray-400 group-hover:text-[#FFD23F]'
                          : activeDropdown === link.name
                            ? 'rotate-180 text-[#B8860B]'
                            : 'text-gray-500'
                      }`} />
                    )}
                  </Link>
                  <AnimatePresence>
                    {activeDropdown === link.name && link.component && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.15 }} className="absolute top-full left-0 z-50 pt-2">
                        {link.component}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );})}
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/contact-us"
                className={`text-[13px] font-bold transition-colors uppercase tracking-wide ${
                  isBottomBarPinned ? 'text-gray-300 hover:text-[#FFD23F]' : 'text-[#111111] hover:text-[#B8860B]'
                }`}
              >
                Submit Coupon
              </Link>
              <Link
                href="/faqs"
                className={`text-[13px] font-bold transition-colors uppercase tracking-wide ${
                  isBottomBarPinned ? 'text-gray-300 hover:text-[#FFD23F]' : 'text-[#111111] hover:text-[#B8860B]'
                }`}
              >
                Support & FAQs
              </Link>
            </div>
          </div>
        </div>
      </div>
      {isBottomBarPinned && (
        <div aria-hidden className="hidden lg:block w-full" style={{ height: bottomBarHeight }} />
      )}
      </>
      )}
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-[115] bg-black/50 border-0 p-0 cursor-default"
              style={{ top: mobileNavHeight }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-x-0 z-[120] bg-gradient-to-br from-[#111111] to-black border-t border-gray-700/50 shadow-xl"
              style={{ top: mobileNavHeight, maxHeight: `calc(100vh - ${mobileNavHeight}px)` }}
            >
            <div className="px-5 py-5 space-y-1 overflow-y-auto text-white" style={{ maxHeight: `calc(100vh - ${mobileNavHeight}px)` }}>
              <div className="mb-5 relative">
                <form action="/search" method="get" onSubmit={handleSearch} className="flex w-full bg-white/10 rounded-full p-1 border border-gray-700/50">
                  <input
                    type="search"
                    name="q"
                    placeholder="Search stores or coupons..."
                    className="flex-1 min-w-0 px-4 py-2.5 bg-transparent outline-none text-white placeholder:text-gray-400 text-sm"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    autoComplete="off"
                  />
                  <button type="submit" aria-label="Search" className="shrink-0 bg-[#FFD23F] hover:bg-black hover:text-white p-2.5 rounded-full text-black transition-colors"><Search className="w-4 h-4" /></button>
                </form>
                <SearchSuggestionsDropdown
                  query={searchQuery}
                  results={searchResults}
                  show={showSuggestions && searchQuery.trim().length > 0}
                  loading={searchLoading}
                  onClose={() => setShowSuggestions(false)}
                />
              </div>
              {navLinks.map((link) => (
                <Link key={link.name} href={link.path} onClick={() => setMobileMenuOpen(false)} className="block py-3 border-b border-gray-700/50 font-medium text-base text-gray-200 hover:text-[#FFD23F]">{link.name}</Link>
              ))}
              <div className="pt-4 flex flex-col gap-1">
                <Link href="/contact-us" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm text-gray-400 hover:text-[#FFD23F]">Submit Coupon</Link>
                <Link href="/faqs" onClick={() => setMobileMenuOpen(false)} className="py-2.5 text-sm text-gray-400 hover:text-[#FFD23F]">Support & FAQs</Link>
              </div>
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
