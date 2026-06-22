/**
 * Seed sample categories, stores, and coupons.
 * Usage: node scripts/seed-sample-data.mjs
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

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
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const logo = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=256`

const categories = [
  { name: 'Fashion', slug: 'fashion', background_color: '#E91E63' },
  { name: 'Electronics', slug: 'electronics', background_color: '#2196F3' },
  { name: 'Food & Dining', slug: 'food-dining', background_color: '#FF9800' },
  { name: 'Travel', slug: 'travel', background_color: '#009688' },
]

const stores = [
  {
    store_name: 'Amazon',
    slug: 'amazon',
    description: 'Shop millions of products with verified Amazon promo codes and deals.',
    store_logo_url: logo('amazon.com'),
    website_url: 'https://www.amazon.com',
    voucher_text: 'Up to 70% Off',
    isTrending: true,
    layout_position: 1,
    categorySlug: 'electronics',
    seoTitle: 'Amazon Coupons & Promo Codes',
    seoDescription: 'Save on Amazon with verified coupon codes and limited-time deals.',
  },
  {
    store_name: 'Nike',
    slug: 'nike',
    description: 'Athletic wear, shoes, and gear at discounted prices.',
    store_logo_url: logo('nike.com'),
    website_url: 'https://www.nike.com',
    voucher_text: '25% Off Sitewide',
    isTrending: true,
    layout_position: 2,
    categorySlug: 'fashion',
    seoTitle: 'Nike Coupons & Discount Codes',
    seoDescription: 'Get Nike promo codes for shoes, apparel, and accessories.',
  },
  {
    store_name: "McDonald's",
    slug: 'mcdonalds',
    description: 'Burgers, fries, and meal deals for less.',
    store_logo_url: logo('mcdonalds.com'),
    website_url: 'https://www.mcdonalds.com',
    voucher_text: 'Buy 1 Get 1 Free',
    isTrending: true,
    layout_position: 3,
    categorySlug: 'food-dining',
    seoTitle: "McDonald's Coupons & Deals",
    seoDescription: "Save on McDonald's orders with exclusive vouchers and app deals.",
  },
  {
    store_name: 'Booking.com',
    slug: 'booking-com',
    description: 'Hotels and accommodations worldwide at the best rates.',
    store_logo_url: logo('booking.com'),
    website_url: 'https://www.booking.com',
    voucher_text: '15% Off Stays',
    isTrending: true,
    layout_position: 4,
    categorySlug: 'travel',
    seoTitle: 'Booking.com Promo Codes',
    seoDescription: 'Book hotels and save with Booking.com coupon codes.',
  },
  {
    store_name: 'Best Buy',
    slug: 'best-buy',
    description: 'Electronics, appliances, and tech gadgets on sale.',
    store_logo_url: logo('bestbuy.com'),
    website_url: 'https://www.bestbuy.com',
    voucher_text: 'Save $50+',
    isTrending: false,
    layout_position: 5,
    categorySlug: 'electronics',
    seoTitle: 'Best Buy Coupons',
    seoDescription: 'Best Buy promo codes for laptops, TVs, and more.',
  },
  {
    store_name: 'H&M',
    slug: 'hm',
    description: 'Trendy fashion for men, women, and kids.',
    store_logo_url: logo('hm.com'),
    website_url: 'https://www.hm.com',
    voucher_text: '20% Off New Arrivals',
    isTrending: false,
    layout_position: 6,
    categorySlug: 'fashion',
    seoTitle: 'H&M Discount Codes',
    seoDescription: 'H&M coupons for clothing, accessories, and seasonal sales.',
  },
  {
    store_name: 'Uber Eats',
    slug: 'uber-eats',
    description: 'Food delivery from your favourite restaurants.',
    store_logo_url: logo('ubereats.com'),
    website_url: 'https://www.ubereats.com',
    voucher_text: '$10 Off First Order',
    isTrending: false,
    layout_position: 7,
    categorySlug: 'food-dining',
    seoTitle: 'Uber Eats Promo Codes',
    seoDescription: 'Uber Eats vouchers for free delivery and order discounts.',
  },
  {
    store_name: 'Expedia',
    slug: 'expedia',
    description: 'Flights, hotels, and vacation packages in one place.',
    store_logo_url: logo('expedia.com'),
    website_url: 'https://www.expedia.com',
    voucher_text: 'Up to 30% Off Packages',
    isTrending: false,
    layout_position: 8,
    categorySlug: 'travel',
    seoTitle: 'Expedia Coupon Codes',
    seoDescription: 'Expedia deals on flights, hotels, and holiday packages.',
  },
]

const couponTemplates = [
  { suffix: 'SAVE10', discount: 10, type: 'percentage', coupon_type: 'code', desc: '10% off your entire order' },
  { suffix: 'DEAL20', discount: 20, type: 'percentage', coupon_type: 'code', desc: '20% off selected items' },
  { suffix: 'FLAT15', discount: 15, type: 'fixed', coupon_type: 'deal', desc: '$15 off orders over $75' },
]

const expiry = new Date()
expiry.setMonth(expiry.getMonth() + 3)

async function main() {
  const { count: storeCount } = await supabase.from('stores').select('*', { count: 'exact', head: true })
  if (storeCount > 0) {
    console.log(`Database already has ${storeCount} stores — skipping seed.`)
    console.log('Delete existing data first if you want a fresh seed.')
    process.exit(0)
  }

  console.log('Seeding categories...')
  const { data: insertedCategories, error: catErr } = await supabase
    .from('categories')
    .insert(categories)
    .select('id, slug')

  if (catErr) {
    console.error('Categories error:', catErr.message)
    process.exit(1)
  }

  const categoryBySlug = Object.fromEntries(insertedCategories.map((c) => [c.slug, c.id]))
  console.log(`  ✓ ${insertedCategories.length} categories`)

  console.log('Seeding stores...')
  const storeRows = stores.map((s, i) => {
    const { categorySlug, seoTitle, seoDescription, ...rest } = s
    return {
      ...rest,
      category_id: categoryBySlug[categorySlug],
      seoTitle,
      seoDescription,
      status: 'active',
      country: 'US',
    }
  })

  const { data: insertedStores, error: storeErr } = await supabase
    .from('stores')
    .insert(storeRows)
    .select('id, store_name, slug, store_logo_url, category_id')

  if (storeErr) {
    console.error('Stores error:', storeErr.message)
    process.exit(1)
  }
  console.log(`  ✓ ${insertedStores.length} stores`)

  console.log('Seeding coupons...')
  const couponRows = []
  let layout = 1

  for (const store of insertedStores) {
    couponTemplates.forEach((tpl, idx) => {
      const code = `${store.slug.toUpperCase().replace(/-/g, '')}${tpl.suffix}`
      couponRows.push({
        store_id: store.id,
        store_name: store.store_name,
        store_ids: [store.id],
        title: `${store.store_name} — ${tpl.desc}`,
        code,
        description: tpl.desc,
        discount_type: tpl.type,
        discount_value: tpl.discount,
        status: 'active',
        expiry_date: expiry.toISOString(),
        logo_url: store.store_logo_url,
        url: stores.find((s) => s.slug === store.slug)?.website_url,
        coupon_type: tpl.coupon_type,
        get_code_text: 'Get Code',
        get_deal_text: 'Get Deal',
        featured: idx === 0,
        layout_position: layout <= 12 ? layout : null,
        is_latest: layout <= 6,
        latest_layout_position: layout <= 6 ? layout : null,
        category_id: store.category_id,
        max_uses: 0,
        current_uses: 0,
      })
      layout++
    })
  }

  const { data: insertedCoupons, error: couponErr } = await supabase
    .from('coupons')
    .insert(couponRows)
    .select('id')

  if (couponErr) {
    console.error('Coupons error:', couponErr.message)
    process.exit(1)
  }

  console.log(`  ✓ ${insertedCoupons.length} coupons`)
  console.log('\nDone! Refresh the site to see sample data.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
