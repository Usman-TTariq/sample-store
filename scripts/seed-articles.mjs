/**
 * Seed dummy blog articles for homepage /blogs.
 * Usage: node scripts/seed-articles.mjs
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvFile(resolve(root, '.env.local'))
loadEnvFile(resolve(root, '.env'))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

const ARTICLES = [
  {
    title: '10 Travel Hacks That Save Hundreds on Your Next Vacation',
    excerpt: 'From flight timing to hotel loyalty tricks, these proven travel hacks help you stretch your budget without sacrificing comfort.',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=500&fit=crop&q=80',
    daysAgo: 1,
  },
  {
    title: 'Best Budget Destinations for 2026: Where Your Dollar Goes Furthest',
    excerpt: 'Discover affordable cities and countries where food, lodging, and activities cost a fraction of typical tourist hotspots.',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=500&fit=crop&q=80',
    daysAgo: 3,
  },
  {
    title: 'How to Find Cheap Flights Using Incognito Mode and Price Alerts',
    excerpt: 'Airfare fluctuates daily. Learn when to book, which tools to use, and how to catch mistake fares before they disappear.',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a192cc71?w=800&h=500&fit=crop&q=80',
    daysAgo: 5,
  },
  {
    title: 'Weekend Getaway Guide: 48 Hours in Chicago on a Shoestring',
    excerpt: 'Free museums, deep-dish deals, and transit tips for a memorable Chicago weekend without overspending.',
    image: 'https://images.unsplash.com/photo-1494522358652-f30e4616febb?w=800&h=500&fit=crop&q=80',
    daysAgo: 7,
  },
  {
    title: 'Spring Fashion Trends You Can Actually Afford This Season',
    excerpt: 'Runway-inspired looks at high-street prices — our editors pick the best budget-friendly pieces for spring wardrobes.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&h=500&fit=crop&q=80',
    daysAgo: 2,
  },
  {
    title: 'Capsule Wardrobe Essentials: 15 Pieces, Endless Outfits',
    excerpt: 'Build a minimalist closet with versatile clothing and accessories that mix and match for work, travel, and weekends.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=500&fit=crop&q=80',
    daysAgo: 4,
  },
  {
    title: 'Best Sneaker Deals Right Now: Nike, Adidas, and New Balance',
    excerpt: 'We tracked prices across major retailers to find the deepest discounts on popular running and lifestyle sneakers.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=500&fit=crop&q=80',
    daysAgo: 6,
  },
  {
    title: 'Accessories Under $50 That Elevate Any Outfit Instantly',
    excerpt: 'Belts, bags, and jewelry picks that look premium without the premium price tag — perfect for gifting or treating yourself.',
    image: 'https://images.unsplash.com/photo-1520903923143-0a02d6570f49?w=800&h=500&fit=crop&q=80',
    daysAgo: 8,
  },
  {
    title: 'Best Laptops for Students and Remote Workers in 2026',
    excerpt: 'Compare battery life, performance, and value across Chromebooks, MacBooks, and Windows ultrabooks for every budget.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&h=500&fit=crop&q=80',
    daysAgo: 2,
  },
  {
    title: 'Smart Home Gadgets That Pay for Themselves Within a Year',
    excerpt: 'Smart thermostats, LED bulbs, and power strips that cut utility bills while making your home more convenient.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=500&fit=crop&q=80',
    daysAgo: 5,
  },
  {
    title: 'Streaming Showdown: Which Service Offers the Best Value?',
    excerpt: 'We break down monthly costs, exclusive content, and bundle deals so you can trim subscriptions without missing favorites.',
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=500&fit=crop&q=80',
    daysAgo: 9,
  },
  {
    title: 'Home Office Setup on a Budget: Desk, Chair, and Lighting Picks',
    excerpt: 'Create a productive workspace with ergonomic essentials that do not require a corporate expense account.',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&h=500&fit=crop&q=80',
    daysAgo: 11,
  },
  {
    title: '5 Daily Habits That Help You Save $200 a Month Without Trying',
    excerpt: 'Small lifestyle tweaks — meal prep, subscription audits, and cashback stacking — add up faster than you think.',
    image: 'https://images.unsplash.com/photo-1554224311-0a1a5882d562?w=800&h=500&fit=crop&q=80',
    daysAgo: 1,
  },
  {
    title: 'Coupon Stacking 101: How to Combine Codes for Maximum Savings',
    excerpt: 'Learn which stores allow stackable promo codes, cashback portals, and gift cards in a single checkout.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop&q=80',
    daysAgo: 4,
  },
  {
    title: 'Grocery Shopping on a Budget: Aisle-by-Aisle Savings Guide',
    excerpt: 'Store brands, unit pricing, and weekly ad strategies to cut your grocery bill by 20% or more every trip.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=500&fit=crop&q=80',
    daysAgo: 6,
  },
  {
    title: 'Back-to-School Deals: Where to Shop for Supplies and Tech',
    excerpt: 'Target, Walmart, and Amazon compared — best prices on backpacks, calculators, and laptops before classes start.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da280a02?w=800&h=500&fit=crop&q=80',
    daysAgo: 10,
  },
  {
    title: 'Amazon Prime Day Preview: What to Buy and What to Skip',
    excerpt: 'Our editors flag the categories with real discounts versus inflated “deals” so you shop smarter on Prime Day.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a960f2a4b9a?w=800&h=500&fit=crop&q=80',
    daysAgo: 3,
  },
  {
    title: 'Cashback Apps Compared: Which One Actually Pays the Most?',
    excerpt: 'We tested Rakuten, Ibotta, and Honey over 30 days to see which app returned the highest real-world earnings.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop&q=80',
    daysAgo: 12,
  },
]

function articleContent(title, excerpt) {
  return `<p>${excerpt}</p>
<p>At Sample Store, we test deals and write guides so you spend less on the things you already buy. This article is part of our ongoing savings series.</p>
<p><strong>Key takeaways:</strong></p>
<ul>
<li>Compare prices across at least two retailers before checkout.</li>
<li>Stack coupons with cashback portals when allowed.</li>
<li>Sign up for store newsletters for exclusive promo codes.</li>
</ul>
<p>Check back weekly for updated picks and verified offers.</p>`
}

async function main() {
  const { count } = await supabase.from('articles').select('*', { count: 'exact', head: true })
  console.log(`Existing articles: ${count ?? 0}`)

  const usedSlugs = new Set()
  const rows = ARTICLES.map((a, index) => {
    let slug = slugify(a.title)
    if (usedSlugs.has(slug)) slug = `${slug}-${index + 1}`
    usedSlugs.add(slug)

    const created = new Date()
    created.setDate(created.getDate() - a.daysAgo)

    return {
      title: a.title,
      slug,
      excerpt: a.excerpt,
      content: articleContent(a.title, a.excerpt),
      featured_image_url: a.image,
      published: true,
      created_at: created.toISOString(),
      updated_at: created.toISOString(),
    }
  })

  const { data, error } = await supabase.from('articles').insert(rows).select('id, title')

  if (error) {
    console.error('Insert failed:', error.message)
    process.exit(1)
  }

  console.log(`✓ Inserted ${data.length} articles`)
  data.forEach((a) => console.log(`  - ${a.title.slice(0, 60)}…`))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
