/**
 * Insert 50 coupons onto existing stores (no new stores).
 * Usage: node scripts/seed-extra-coupons.mjs
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

/** 50 coupons — Store Name must match an existing store */
const COUPONS = [
  { store: 'Amazon', title: 'Prime Day Early Access', code: 'AMZPRIME25', type: 'code', discount: 25, discountType: 'percentage', description: '25% off select Prime Day deals' },
  { store: 'Amazon', title: 'Free Same-Day Delivery', code: '', type: 'deal', discount: 0, discountType: 'percentage', description: 'Free same-day delivery on eligible orders over $35' },
  { store: 'Amazon', title: '$15 Off $75 Electronics', code: 'AMZTECH15', type: 'code', discount: 15, discountType: 'fixed', description: '$15 off electronics orders of $75 or more' },
  { store: 'Nike', title: 'Members Only 30% Off', code: 'NIKEMEM30', type: 'code', discount: 30, discountType: 'percentage', description: '30% off for Nike members on full-price items' },
  { store: 'Nike', title: 'Free Shipping on Running', code: '', type: 'deal', discount: 0, discountType: 'percentage', description: 'Free shipping on all running shoes and apparel' },
  { store: 'Target', title: 'Circle Week Extra 20%', code: 'CIRCLE20', type: 'code', discount: 20, discountType: 'percentage', description: '20% off one purchase with Target Circle' },
  { store: 'Target', title: '$5 Off $25 Home', code: 'HOME5', type: 'code', discount: 5, discountType: 'fixed', description: '$5 off home essentials orders over $25' },
  { store: 'Walmart', title: 'Flash Pick Daily Deal', code: '', type: 'deal', discount: 10, discountType: 'percentage', description: 'Extra 10% off today\'s Flash Pick item' },
  { store: 'Walmart', title: 'Grocery Pickup $10 Off', code: 'PICKUP10', type: 'code', discount: 10, discountType: 'fixed', description: '$10 off your first grocery pickup order' },
  { store: 'Best Buy', title: 'Student Discount 10%', code: 'BBSTUDENT', type: 'code', discount: 10, discountType: 'percentage', description: '10% off for verified students on laptops and tablets' },
  { store: 'Best Buy', title: 'Open-Box Extra Savings', code: '', type: 'deal', discount: 15, discountType: 'percentage', description: 'Save up to 15% on open-box electronics' },
  { store: 'Sephora', title: 'Beauty Insider 15% Off', code: 'BI15OFF', type: 'code', discount: 15, discountType: 'percentage', description: '15% off for Beauty Insider members' },
  { store: 'Sephora', title: 'Free Deluxe Sample Kit', code: '', type: 'deal', discount: 0, discountType: 'percentage', description: 'Free deluxe sample kit with $50 beauty purchase' },
  { store: 'Adidas', title: 'Outlet Extra 40%', code: 'ADIOUT40', type: 'code', discount: 40, discountType: 'percentage', description: 'Extra 40% off outlet styles online' },
  { store: 'Adidas', title: 'Back to School Bundle', code: '', type: 'deal', discount: 20, discountType: 'percentage', description: '20% off when you buy 2+ items' },
  { store: 'Booking.com', title: 'Genius 10% Off Stays', code: '', type: 'deal', discount: 10, discountType: 'percentage', description: '10% off select properties for Genius members' },
  { store: 'Booking.com', title: '$25 Off $150+ Booking', code: 'BOOK25', type: 'code', discount: 25, discountType: 'fixed', description: '$25 off hotel bookings over $150' },
  { store: 'Expedia', title: 'Bundle & Save 25%', code: '', type: 'deal', discount: 25, discountType: 'percentage', description: 'Save up to 25% on flight + hotel packages' },
  { store: 'Expedia', title: 'Weekend Getaway Deal', code: 'WEEKEND15', type: 'code', discount: 15, discountType: 'percentage', description: '15% off weekend hotel stays' },
  { store: 'Airbnb', title: 'Long Stay Weekly Discount', code: '', type: 'deal', discount: 12, discountType: 'percentage', description: 'Up to 12% off weekly stays' },
  { store: 'Airbnb', title: '$30 Off First Booking', code: 'AIR30NEW', type: 'code', discount: 30, discountType: 'fixed', description: '$30 off your first booking of $150+' },
  { store: "McDonald's", title: 'App Exclusive BOGO', code: 'MCDAPP', type: 'code', discount: 50, discountType: 'percentage', description: 'Buy one get one free via McDonald\'s app' },
  { store: "McDonald's", title: 'Free Fries with Meal', code: '', type: 'deal', discount: 0, discountType: 'percentage', description: 'Free medium fries with any extra value meal' },
  { store: 'DoorDash', title: 'DashPass Free Trial', code: '', type: 'deal', discount: 0, discountType: 'percentage', description: '30-day free DashPass trial — zero delivery fees' },
  { store: 'DoorDash', title: '$8 Off $30 Order', code: 'EAT8OFF', type: 'code', discount: 8, discountType: 'fixed', description: '$8 off orders of $30 or more' },
  { store: 'Uber Eats', title: 'First Order 50% Off', code: 'UBEREATS50', type: 'code', discount: 50, discountType: 'percentage', description: '50% off your first Uber Eats order (max $15)' },
  { store: 'Uber Eats', title: 'Free Delivery Weekend', code: '', type: 'deal', discount: 0, discountType: 'percentage', description: 'Free delivery on all orders this weekend' },
  { store: 'H&M', title: 'New Member 20% Off', code: 'HMNEW20', type: 'code', discount: 20, discountType: 'percentage', description: '20% off your first H&M order as a new member' },
  { store: 'H&M', title: 'Summer Sale Extra 10%', code: '', type: 'deal', discount: 10, discountType: 'percentage', description: 'Extra 10% off already-reduced summer styles' },
  { store: 'Zara', title: 'Season End 30% Off', code: 'ZARA30', type: 'code', discount: 30, discountType: 'percentage', description: '30% off end-of-season collection' },
  { store: 'Zara', title: 'Free Returns Extended', code: '', type: 'deal', discount: 0, discountType: 'percentage', description: 'Extended 60-day free returns on all orders' },
  { store: 'Shein', title: 'Flash Sale 40% Off', code: 'SHEIN40', type: 'code', discount: 40, discountType: 'percentage', description: '40% off flash sale items for 24 hours' },
  { store: 'Shein', title: 'Points Double Rewards', code: '', type: 'deal', discount: 5, discountType: 'percentage', description: 'Earn double Shein points on every order' },
  { store: 'IKEA', title: 'Family Member 15% Off', code: 'IKEAFAM15', type: 'code', discount: 15, discountType: 'percentage', description: '15% off selected IKEA Family products' },
  { store: 'IKEA', title: 'Free Click & Collect', code: '', type: 'deal', discount: 0, discountType: 'percentage', description: 'Free click-and-collect on all orders' },
  { store: 'Wayfair', title: 'Clearance Extra 20%', code: 'WAYCLR20', type: 'code', discount: 20, discountType: 'percentage', description: 'Extra 20% off clearance furniture' },
  { store: 'Wayfair', title: 'Free Assembly on Select', code: '', type: 'deal', discount: 0, discountType: 'percentage', description: 'Free professional assembly on select items' },
  { store: 'Costco', title: 'Online-Only Instant Savings', code: '', type: 'deal', discount: 15, discountType: 'percentage', description: 'Instant savings on select Costco.com items' },
  { store: 'Costco', title: '$10 Shop Card Promo', code: 'COSTCO10', type: 'code', discount: 10, discountType: 'fixed', description: '$10 Costco Shop Card with qualifying purchase' },
  { store: 'Chewy', title: 'Autoship 35% Off First', code: 'AUTO35', type: 'code', discount: 35, discountType: 'percentage', description: '35% off your first Autoship order' },
  { store: 'Chewy', title: 'Free Vet Chat Access', code: '', type: 'deal', discount: 0, discountType: 'percentage', description: 'Free 24/7 vet chat with any pet food order' },
  { store: 'Ulta', title: 'Platinum 20% Off', code: 'PLAT20', type: 'code', discount: 20, discountType: 'percentage', description: '20% off for Ultamate Rewards Platinum members' },
  { store: 'Ulta', title: 'Gift with $40 Purchase', code: '', type: 'deal', discount: 0, discountType: 'percentage', description: 'Free deluxe gift with $40 beauty purchase' },
  { store: 'Amazon', title: 'Audible 3 Months $0.99', code: 'AUDIBLE99', type: 'code', discount: 99, discountType: 'percentage', description: '3 months of Audible for $0.99/month' },
  { store: 'Nike', title: 'Clearance Up to 50%', code: '', type: 'deal', discount: 50, discountType: 'percentage', description: 'Up to 50% off Nike clearance section' },
  { store: 'Target', title: 'RedCard 5% Everyday', code: '', type: 'deal', discount: 5, discountType: 'percentage', description: '5% off every purchase with Target RedCard' },
  { store: 'Walmart', title: 'Walmart+ Free Trial', code: 'WPLUS30', type: 'code', discount: 0, discountType: 'percentage', description: '30-day free Walmart+ membership trial' },
  { store: 'Best Buy', title: 'Trade-In Bonus $50', code: '', type: 'deal', discount: 50, discountType: 'fixed', description: 'Extra $50 trade-in value on eligible devices' },
  { store: 'Sephora', title: 'Rouge 20% Off Sale', code: 'ROUGE20', type: 'code', discount: 20, discountType: 'percentage', description: '20% off for Rouge members during sale event' },
  { store: 'Booking.com', title: 'Mobile Rate 15% Off', code: '', type: 'deal', discount: 15, discountType: 'percentage', description: 'Exclusive 15% off when booking via mobile app' },
  { store: 'Expedia', title: 'Member Prices Unlocked', code: 'EXPMEM', type: 'code', discount: 10, discountType: 'percentage', description: '10% off member-only hotel rates' },
]

const expiry = new Date('2026-12-31T23:59:59Z')

async function main() {
  const { data: stores, error: storeErr } = await supabase
    .from('stores')
    .select('id, store_name, website_url, store_logo_url, category_id')

  if (storeErr || !stores?.length) {
    console.error('Failed to load stores:', storeErr?.message || 'none found')
    process.exit(1)
  }

  const storeByName = new Map(
    stores.map((s) => [s.store_name.trim().toLowerCase(), s])
  )

  const rows = []
  const skipped = []

  for (const c of COUPONS) {
    const store = storeByName.get(c.store.trim().toLowerCase())
    if (!store) {
      skipped.push(c.store)
      continue
    }

    rows.push({
      store_id: store.id,
      store_name: store.store_name,
      store_ids: [store.id],
      title: c.title,
      code: c.code || null,
      description: c.description,
      discount_type: c.discountType,
      discount_value: c.discount,
      status: 'active',
      expiry_date: expiry.toISOString(),
      logo_url: store.store_logo_url,
      url: store.website_url,
      coupon_type: c.type,
      get_code_text: c.type === 'code' ? 'Get Code' : null,
      get_deal_text: c.type === 'deal' ? 'Get Deal' : null,
      featured: false,
      max_uses: 500,
      current_uses: 0,
      category_id: store.category_id,
    })
  }

  if (skipped.length) {
    console.warn('Skipped (store not found):', [...new Set(skipped)].join(', '))
  }

  if (rows.length === 0) {
    console.error('No coupons to insert')
    process.exit(1)
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('coupons')
    .insert(rows)
    .select('id, store_name, title')

  if (insertErr) {
    console.error('Insert failed:', insertErr.message)
    process.exit(1)
  }

  console.log(`✓ Inserted ${inserted.length} coupons across existing stores`)
  const byStore = {}
  for (const row of inserted) {
    byStore[row.store_name] = (byStore[row.store_name] || 0) + 1
  }
  console.log('Breakdown:', byStore)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
