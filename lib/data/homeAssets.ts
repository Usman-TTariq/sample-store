/** Curated Unsplash images for homepage hero & category cards */
export const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=1000&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=1000&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=1000&fit=crop&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=1000&fit=crop&q=80',
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=1000&fit=crop&q=80',
] as const;

export const CATEGORY_CARDS = [
  {
    name: 'Electronics',
    href: '/categories',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop&q=80',
    emoji: '💻',
    objectPosition: 'center',
  },
  {
    name: 'Fashion',
    href: '/categories',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop&q=80',
    emoji: '👗',
    objectPosition: 'center',
  },
  {
    name: 'Sports & Outdoors',
    href: '/categories',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop&q=80',
    emoji: '⚽',
    objectPosition: 'center top',
  },
  {
    name: 'Travel',
    href: '/categories',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=400&fit=crop&q=80',
    emoji: '✈️',
    objectPosition: 'center',
  },
] as const;
