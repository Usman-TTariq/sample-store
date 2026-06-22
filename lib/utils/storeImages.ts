export function extractDomain(url?: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function getStoreDomain(
  websiteUrl?: string | null,
  trackingLink?: string | null,
  storeName?: string
): string | null {
  return extractDomain(websiteUrl) || extractDomain(trackingLink) || guessDomainFromName(storeName);
}

function guessDomainFromName(name?: string): string | null {
  if (!name) return null;
  const known: Record<string, string> = {
    amazon: 'amazon.com',
    nike: 'nike.com',
    "mcdonald's": 'mcdonalds.com',
    mcdonalds: 'mcdonalds.com',
    'booking.com': 'booking.com',
    booking: 'booking.com',
    'best buy': 'bestbuy.com',
    'h&m': 'hm.com',
    'uber eats': 'ubereats.com',
    expedia: 'expedia.com',
    target: 'target.com',
    walmart: 'walmart.com',
    adidas: 'adidas.com',
    apple: 'apple.com',
  };
  const key = name.toLowerCase().trim();
  return known[key] ?? null;
}

/** Ordered fallback URLs — component tries each on error */
export function getStoreLogoCandidates(
  logoUrl?: string | null,
  websiteUrl?: string | null,
  trackingLink?: string | null,
  storeName?: string
): string[] {
  const domain = getStoreDomain(websiteUrl, trackingLink, storeName);
  const candidates: string[] = [];

  if (logoUrl?.trim()) candidates.push(logoUrl.trim());
  if (domain) {
    candidates.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=256`);
    candidates.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
    candidates.push(`https://logo.clearbit.com/${domain}`);
  }
  if (storeName) {
    const label = encodeURIComponent(storeName.slice(0, 2).toUpperCase());
    candidates.push(
      `https://ui-avatars.com/api/?name=${label}&background=FFD23F&color=111111&bold=true&size=128`
    );
  }

  return [...new Set(candidates)];
}
