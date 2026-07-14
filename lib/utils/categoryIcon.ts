const CATEGORY_BLACK_ICONS: Record<string, string> = {
  education: 'mdi:school-outline',
  gifts: 'mdi:gift-outline',
  gift: 'mdi:gift-outline',
  technology: 'mdi:laptop',
  gaming: 'mdi:gamepad-variant-outline',
  baby: 'mdi:baby-carriage',
  hobbies: 'mdi:palette-outline',
  health: 'mdi:leaf',
  toys: 'mdi:toy-brick-outline',
  automotive: 'mdi:car-outline',
  books: 'mdi:book-open-page-variant-outline',
  sports: 'mdi:soccer',
  'sports and outdoor': 'mdi:hiking',
  home: 'mdi:home-outline',
  'home and garden': 'mdi:sprout-outline',
  fashion: 'mdi:tshirt-crew-outline',
  electronics: 'mdi:cellphone',
  travel: 'mdi:airplane',
  pets: 'mdi:paw-outline',
  food: 'mdi:food-outline',
  office: 'mdi:briefcase-outline',
  beauty: 'mdi:face-woman-shimmer-outline',
  fitness: 'mdi:dumbbell',
  furniture: 'mdi:sofa-outline',
  footwear: 'mdi:shoe-formal',
  kids: 'mdi:human-child',
  hotel: 'mdi:bed-outline',
  'e-commerce': 'mdi:cart-outline',
};

/** Light gold circle behind category icons (matches SaveKlick theme) */
export const categoryIconBgClass = 'bg-brand-cyan/15';
export const categoryIconBgHex = '#FFF8E0';

const CATEGORY_EMOJI: Record<string, string> = {
  education: '📚',
  gifts: '🎁',
  gift: '🎁',
  technology: '💻',
  gaming: '🎮',
  baby: '👶',
  hobbies: '🎨',
  health: '💚',
  toys: '🧸',
  automotive: '🚗',
  books: '📖',
  sports: '⚽',
  home: '🏠',
  'home and garden': '🏡',
  fashion: '👗',
  electronics: '📱',
  travel: '✈️',
  pets: '🐾',
  food: '🍔',
  office: '📝',
  beauty: '💄',
  fitness: '💪',
  furniture: '🛋️',
  footwear: '👟',
  kids: '🧸',
  hotel: '🏨',
  'e-commerce': '🛒',
};

export function getCategoryEmoji(name: string): string {
  const key = name.toLowerCase().trim();
  if (CATEGORY_EMOJI[key]) return CATEGORY_EMOJI[key];
  for (const [k, emoji] of Object.entries(CATEGORY_EMOJI)) {
    if (key.includes(k) || k.includes(key)) return emoji;
  }
  return '📦';
}

export function getCategoryBlackIconUrl(name: string): string {
  const key = name.toLowerCase().trim();
  let iconId = 'mdi:tag-outline';

  if (CATEGORY_BLACK_ICONS[key]) {
    iconId = CATEGORY_BLACK_ICONS[key];
  } else {
    for (const [k, icon] of Object.entries(CATEGORY_BLACK_ICONS)) {
      if (key.includes(k) || k.includes(key)) {
        iconId = icon;
        break;
      }
    }
  }

  return `https://api.iconify.design/${iconId}.svg?color=%23000000`;
}

export function getCategoryIconSrc(logoUrl?: string | null, name?: string): string {
  if (isCategoryImageUrl(logoUrl)) return logoUrl!.trim();
  return getCategoryBlackIconUrl(name || 'category');
}

export function isCategoryImageUrl(url?: string | null): boolean {
  if (!url?.trim()) return false;
  const v = url.trim();
  return (
    v.startsWith('http://') ||
    v.startsWith('https://') ||
    v.startsWith('data:') ||
    v.startsWith('/')
  );
}

export function getCategoryIconDisplay(logoUrl?: string | null, name?: string): string {
  if (isCategoryImageUrl(logoUrl)) return logoUrl!.trim();
  if (logoUrl?.trim()) return logoUrl.trim();
  return getCategoryEmoji(name || '');
}

/** Curated cover photos so category cards never look empty. */
const CATEGORY_COVERS: Record<string, string> = {
  fashion: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
  electronics: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80',
  beauty: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
  'sports and outdoor': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
  'sports & outdoor': 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'food & grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  grocery: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80',
  home: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
  'home and garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
  'home & garden': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
  footwear: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  kids: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80',
  automotive: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  gift: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
  gifts: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=800&q=80',
  furniture: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  'office & stationery': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  'e-commerce': 'https://images.unsplash.com/photo-1472851298512-5ea7d3fafeef?auto=format&fit=crop&w=800&q=80',
  ecommerce: 'https://images.unsplash.com/photo-1472851298512-5ea7d3fafeef?auto=format&fit=crop&w=800&q=80',
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  'hotel & resorts': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
  pets: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=800&q=80',
  health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80',
  hobbies: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_COVER =
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80';

function normalizeCategoryKey(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
}

export function getCategoryCoverUrl(name: string): string {
  const key = name.toLowerCase().trim();
  const normalized = normalizeCategoryKey(name);

  if (CATEGORY_COVERS[key]) return CATEGORY_COVERS[key];
  if (CATEGORY_COVERS[normalized]) return CATEGORY_COVERS[normalized];

  for (const [k, url] of Object.entries(CATEGORY_COVERS)) {
    const nk = normalizeCategoryKey(k);
    if (normalized.includes(nk) || nk.includes(normalized) || key.includes(k)) {
      return url;
    }
  }

  return DEFAULT_COVER;
}
