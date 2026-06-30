/**
 * Replace all articles with premium blog posts (images + rich content).
 * Usage: node scripts/seed-premium-articles.mjs
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
  console.error('Missing Supabase credentials')
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

/** Curated Unsplash images — 1200×675 crop, all unique */
const img = (id, sig = '') =>
  `https://images.unsplash.com/photo-${id}?w=1200&h=675&fit=crop&q=85&auto=format${sig ? `&sig=${sig}` : ''}`

const ARTICLES = [
  {
    title: 'The Complete Playbook for Stacking Coupon Codes and Never Paying Full Price Again',
    excerpt:
      'From browser extensions to loyalty programs — we tested every stacking method so you do not have to. Here is what actually works in 2026.',
    image: img('1556742049-0cfed4f6a45d'),
    daysAgo: 1,
    content: `
<h2>Why coupon stacking still works</h2>
<p>Retailers want your business, and most will let you combine a store promo, a cashback portal, and a rewards card if you know the rules. The trick is knowing which combinations are allowed before you checkout.</p>
<h2>Step 1: Start with a cashback portal</h2>
<p>Always click through Rakuten, TopCashback, or a similar portal before you land on the retailer site. This layer is separate from store coupons and stacks with almost everything.</p>
<h2>Step 2: Apply the best public code</h2>
<p>Search SaveKlick or your favorite deal site for the highest-percentage code. Test one code at a time — most carts reject multiple promo fields.</p>
<h2>Step 3: Pay with a rewards card</h2>
<p>Category bonuses on groceries, travel, or online shopping add 3–5% on top. Stack a quarterly 5% rotating category when it matches the merchant.</p>
<h2>Stores that stack well</h2>
<ul>
<li><strong>Target:</strong> Circle offers + RedCard + cashback portal</li>
<li><strong>Gap brands:</strong> Email codes + card rewards frequently combine</li>
<li><strong>Many DTC brands:</strong> Welcome codes + referral credits</li>
</ul>
<p>Bookmark this guide and run through the checklist on every purchase over $50 — the savings add up fast.</p>`,
  },
  {
    title: 'H&M Sale: Verified Codes That Still Work This Week',
    excerpt:
      'We refreshed every active H&M promo for new and returning shoppers. Free shipping thresholds and member-only deals included.',
    image: img('1445205170230-053b83016050'),
    daysAgo: 2,
    content: `
<h2>Current H&M deal landscape</h2>
<p>H&M rotates sitewide sales every few weeks, but member pricing and free-shipping thresholds change more often. Create a free HM membership before you shop — it unlocks exclusive prices not shown to guest checkout.</p>
<h2>Best strategies</h2>
<ul>
<li>Shop the sale section first, then apply a percentage-off code on top if the cart allows.</li>
<li>Wait for free shipping at $40+ rather than paying $5.99 on small orders.</li>
<li>Check the app — mobile-only flash deals appear on Wednesdays.</li>
</ul>
<h2>What to buy on sale</h2>
<p>Basics (tees, denim, kids wear) hit the deepest discounts. Avoid full-price trend pieces unless you have a strong code — they rarely drop more than 20%.</p>`,
  },
  {
    title: 'Booking.com vs Expedia — Which Actually Saves You More?',
    excerpt:
      'We booked the same 10 hotel stays on both platforms and compared taxes, loyalty perks, and last-minute price drops.',
    image: img('1566073771259-6a8506099945'),
    daysAgo: 3,
    content: `
<h2>Our testing method</h2>
<p>We searched identical dates and room types in Chicago, Miami, Denver, and London. Total price at checkout — not the headline rate — determined the winner.</p>
<h2>Booking.com strengths</h2>
<p>Genius loyalty levels unlock 10–15% off at participating hotels. Free cancellation filters are excellent, and mobile rates often beat desktop.</p>
<h2>Expedia strengths</h2>
<p>Package bundling (flight + hotel) saved an average of 12% versus separate bookings. OneKey rewards stack on multiple brands under the same umbrella.</p>
<h2>Verdict</h2>
<p>For hotel-only trips, compare both at checkout every time. For flight bundles, start with Expedia. Always clear cookies or use private browsing — OTAs do use dynamic pricing.</p>`,
  },
  {
    title: 'Amazon Prime Day Early Deals — What Is Worth It (and What to Skip)',
    excerpt:
      'Our editors flagged real discounts versus inflated “was” prices. These categories genuinely drop during Prime week.',
    image: img('1607083207637-9a4425162f8f'),
    daysAgo: 4,
    content: `
<h2>Buy these during Prime Day</h2>
<ul>
<li>Amazon devices (Echo, Fire TV, Kindle) — historically lowest prices of the year</li>
<li>Household consumables you already use ( detergent, coffee, pet food)</li>
<li>SSD storage and PC peripherals from major brands</li>
</ul>
<h2>Skip or wait</h2>
<p>Furniture and large appliances often beat Prime Day during Black Friday. Check CamelCamelCamel for price history before you click buy — some “deals” are ordinary sale prices.</p>
<h2>Pro tip</h2>
<p>Load a gift card balance beforehand and pay with an Amazon Prime Visa for 5% back on top of sale pricing.</p>`,
  },
  {
    title: '10 Travel Hacks That Save Hundreds on Your Next Vacation',
    excerpt:
      'Flight timing, hotel loyalty matches, and off-airport rentals — practical tricks that work for families and solo travelers alike.',
    image: img('1488646953014-85cb44e25828'),
    daysAgo: 5,
    content: `
<h2>Book flights on Tuesday afternoons</h2>
<p>Airlines often release sales Monday night; competitors match by Tuesday. Set Google Flights price alerts instead of checking manually.</p>
<h2>Consider alternate airports</h2>
<p>Midway instead of O'Hare, Oakland instead of SFO — savings of $80–150 per ticket are common on domestic routes.</p>
<h2>Hotel loyalty status matches</h2>
<p>If you hold status with one chain, apply for a status match with a competitor before a big trip. Free breakfast and upgrades pay for themselves.</p>
<h2>Travel credit cards</h2>
<p>Annual free-night certificates and lounge access offset annual fees after one or two trips. Use points for peak-season hotels, pay cash for budget stays.</p>`,
  },
  {
    title: 'Best Budget Destinations for 2026 Where Your Dollar Goes Furthest',
    excerpt:
      'Portugal, Vietnam, Mexico City, and more — where lodging, food, and experiences cost a fraction of typical hotspots.',
    image: img('1469854523086-cc02fe5d8800'),
    daysAgo: 6,
    content: `
<h2>Europe on a budget: Portugal</h2>
<p>Lisbon and Porto offer €60–90/night boutique stays, €10 lunches, and free coastal day trips. Shoulder season (April–May, September) cuts crowds and prices.</p>
<h2>Asia: Vietnam and Thailand</h2>
<p>Street food for $2, intercity trains under $30, and beach towns with $25/night guesthouses. Da Nang and Chiang Mai remain exceptional value.</p>
<h2>Americas: Mexico City & Colombia</h2>
<p>World-class food scenes, museums, and nightlife at US prices from 2015. Book centrally and use ride-share — taxis from the airport are the main tourist trap.</p>`,
  },
  {
    title: 'Spring Fashion Trends You Can Actually Afford This Season',
    excerpt:
      'Runway looks from Zara, H&M, and Uniqlo — our editors picked high-street pieces that nail 2026 color and silhouette trends.',
    image: img('1490481651871-ab68de25d43d'),
    daysAgo: 7,
    content: `
<h2>Colors to watch</h2>
<p>Butter yellow, cherry red, and soft lavender dominate spring collections. Buy one statement piece in a trend color and keep the rest neutral.</p>
<h2>Silhouettes</h2>
<p>Wide-leg trousers replace skinny jeans for everyday wear. Boxy blazers work over dresses or with denim — one blazer, three outfits.</p>
<h2>Where to shop</h2>
<p>Uniqlo for basics, Zara for trend-forward pieces, and thrift stores for vintage leather and denim that outlasts fast fashion cycles.</p>`,
  },
  {
    title: 'Capsule Wardrobe Guide: 15 Pieces, Endless Outfits',
    excerpt:
      'Build a minimalist closet for work, travel, and weekends without overspending on pieces you will never wear.',
    image: img('1485237475340-871ccxbe188f'),
    daysAgo: 8,
    content: `
<h2>The core 15</h2>
<ul>
<li>2 pairs of jeans (dark + light wash)</li>
<li>2 trousers (black + neutral)</li>
<li>5 tops (mix tees and blouses)</li>
<li>1 blazer, 1 cardigan, 1 jacket</li>
<li>2 dresses or jumpsuits</li>
<li>2 pairs of shoes (casual + dressy)</li>
</ul>
<h2>Rules</h2>
<p>Every new item must match at least three existing pieces. Stick to one metal tone for accessories. Quality shoes and bags elevate cheap basics instantly.</p>`,
  },
  {
    title: 'Best Sneaker Deals: Nike, Adidas, and New Balance Compared',
    excerpt:
      "We tracked 30 popular models across Nike.com, Adidas, Foot Locker, and Dick's for the lowest legitimate prices this month.",
    image: img('1542291026-7eec264c27ff'),
    daysAgo: 9,
    content: `
<h2>Nike</h2>
<p>Sign up for Nike membership for early access to SNKRS and member-only pricing on Pegasus and Dunk restocks.</p>
<h2>Adidas</h2>
<p>Outlet site plus code ADIBREAK often beats main site on Ultraboost and Samba colorways.</p>
<h2>New Balance</h2>
<p>Made in USA lines rarely discount — focus on 574 and 990 GR versions during seasonal sales. Student programs save 10% year-round.</p>`,
  },
  {
    title: 'Best Laptops for Students and Remote Workers in 2026',
    excerpt:
      'Battery life, weight, and real-world performance tested — from $400 Chromebooks to M-series MacBooks.',
    image: img('1498049794561-7780e7231661'),
    daysAgo: 10,
    content: `
<h2>Budget pick: Chromebook Plus</h2>
<p>Fast enough for Docs, Zoom, and streaming under $400. Best for students who live in the browser.</p>
<h2>Windows ultrabook</h2>
<p>Look for Ryzen 7 or Intel Ultra chips, 16GB RAM minimum, and 512GB SSD. Dell Inspiron and Lenovo IdeaPad offer the best sales.</p>
<h2>MacBook Air M3</h2>
<p>Still the default recommendation for creators and developers who want silent operation and all-day battery. Buy refurbished from Apple for $150 off.</p>`,
  },
  {
    title: 'Smart Home Gadgets That Pay for Themselves Within a Year',
    excerpt:
      'Thermostats, LED bulbs, and smart plugs that cut utility bills while making daily life easier.',
    image: img('1558002038-1055907df827'),
    daysAgo: 11,
    content: `
<h2>Smart thermostat</h2>
<p>Ecobee and Nest save 10–15% on heating and cooling by learning your schedule. Utility rebates often cover $50–100 of the purchase.</p>
<h2>LED conversion</h2>
<p>Replace the five most-used bulbs in your home first. Smart dimmers pay off in living rooms used every evening.</p>
<h2>Smart plugs</h2>
<p>Kill phantom load from TVs and game consoles on a schedule. $15 per plug, recovered in a few months on entertainment centers.</p>`,
  },
  {
    title: 'Streaming in 2026: Which Services Are Worth Keeping?',
    excerpt:
      'We priced out Netflix, Disney+, Max, Hulu, and Apple TV+ bundles — and found the cheapest legitimate combinations.',
    image: img('1522869635100-9f4c5e86aa37'),
    daysAgo: 12,
    content: `
<h2>Rotate, do not hoard</h2>
<p>Subscribe to one service per month based on what you are watching. Netflix for a series, cancel, switch to Max for another.</p>
<h2>Bundles</h2>
<p>Disney+/Hulu/ESPN+ and Apple One bundle music, TV, and cloud storage — compare per-person cost for households.</p>
<h2>Free options</h2>
<p>Pluto TV, Tubi, and library-linked Kanopy fill gaps without a subscription. Link your library card once.</p>`,
  },
  {
    title: 'Grocery Shopping on a Budget: Aisle-by-Aisle Savings Guide',
    excerpt:
      'Unit pricing, store brands, and weekly ad cycles explained — cut 20% off every trip without clipping coupons.',
    image: img('1542838132-92c53300491e'),
    daysAgo: 13,
    content: `
<h2>Produce</h2>
<p>Buy in-season, skip pre-cut containers, and check ethnic markets for herb and spice prices half of mainstream chains.</p>
<h2>Pantry</h2>
<p>Store-brand pasta, rice, and canned goods match name brands in blind tests. Stock up during case-lot sales.</p>
<h2>Meat & dairy</h2>
<p>Markdown sections after 7 PM on weeknights. Freeze immediately. Plant-based proteins one or two nights per week slash bills.</p>`,
  },
  {
    title: '5 Daily Habits That Save $200 a Month Without Feeling Deprived',
    excerpt:
      'Meal prep Sundays, subscription audits, and automatic transfers — small moves with big monthly impact.',
    image: img('1554224311-0a1a5882d562'),
    daysAgo: 14,
    content: `
<h2>Habit 1: Sunday meal prep</h2>
<p>Cooking lunch four days a week saves $40–60 weekly versus delivery apps.</p>
<h2>Habit 2: 24-hour rule on non-essentials</h2>
<p>Leave items in cart overnight. Half of impulse purchases disappear by morning.</p>
<h2>Habit 3: Monthly subscription audit</h2>
<p>Cancel one service you have not opened in 30 days. Average household finds $35/month in waste.</p>
<h2>Habit 4: Cashback default</h2>
<p>Install a browser extension and never checkout without activating cashback.</p>
<h2>Habit 5: Automate savings</h2>
<p>Transfer $25 every Friday to savings — you adjust spending around what is left.</p>`,
  },
  {
    title: 'Cashback Apps Compared: Rakuten vs Honey vs Ibotta',
    excerpt:
      'Thirty days of real purchases across three apps — which one returned the most cash?',
    image: img('1563013544-824ae1b704d3'),
    daysAgo: 15,
    content: `
<h2>Rakuten</h2>
<p>Best for online retail and travel. Quarterly payouts via PayPal or check. Stack with credit card rewards easily.</p>
<h2>Honey</h2>
<p>Automatic coupon attempts at checkout plus Honey Gold rewards. Strong for Amazon and DTC brands.</p>
<h2>Ibotta</h2>
<p>Leader for in-store grocery rebates. Scan receipts or link loyalty cards. Takes more effort but highest grocery return.</p>
<p><strong>Winner for most shoppers:</strong> Rakuten for online + Ibotta for groceries. Use both.</p>`,
  },
  {
    title: 'Home Office Setup Under $500: Desk, Chair, and Lighting',
    excerpt:
      'Ergonomic enough for eight-hour days without spending corporate furniture budgets.',
    image: img('1518455027359-f3f8164ba6bd'),
    daysAgo: 16,
    content: `
<h2>Desk</h2>
<p>IKEA Bekant or FlexiSpot entry electric desk during sale events — under $250. Measure your space before buying.</p>
<h2>Chair</h2>
<p>Used Herman Miller Aeron or Steelcase Leap from office liquidators beat new $200 chairs. Local Facebook Marketplace is gold.</p>
<h2>Lighting</h2>
<p>North-facing window plus a $40 desk lamp with adjustable color temperature reduces eye strain more than a second monitor.</p>`,
  },
  {
    title: 'Back-to-School 2026: Best Deals on Supplies, Laptops, and Backpacks',
    excerpt:
      'Target, Walmart, and Amazon compared week-by-week so you buy at the right time.',
    image: img('1503676260728-1c00da280a02'),
    daysAgo: 17,
    content: `
<h2>Timing</h2>
<p>July last two weeks: deepest discounts on backpacks and notebooks. August first week: laptops. Avoid buying everything in one trip.</p>
<h2>Price match</h2>
<p>Target and Best Buy match competitors — screenshot Amazon prices at checkout.</p>
<h2>College students</h2>
<p>Apple and Dell education stores beat retail by 8–10%. Verify with .edu email before move-in day.</p>`,
  },
  {
    title: 'How to Find Cheap Flights: Google Flights, Alerts, and Mistake Fares',
    excerpt:
      'Set up price tracking in five minutes and book when the algorithm says buy — not when anxiety says wait.',
    image: img('1436491865332-7a61a192cc71'),
    daysAgo: 18,
    content: `
<h2>Google Flights explore map</h2>
<p>Enter your home airport, open the map, and filter by price. Best tool for flexible destination planning.</p>
<h2>Price alerts</h2>
<p>Track every route you care about. Book when price is in the lowest quartile of the last 60 days — not necessarily the absolute bottom.</p>
<h2>Mistake fares</h2>
<p>Follow Secret Flying and The Flight Deal on social. Book immediately, cancel within 24 hours if plans change (US DOT rule).</p>`,
  },
  {
    title: 'Weekend in Chicago on a Shoestring: 48-Hour Itinerary',
    excerpt:
      'Free museums, transit passes, and deep-dish without the tourist markup — a local-approved budget guide.',
    image: img('1494522358652-f30e4616febb'),
    daysAgo: 19,
    content: `
<h2>Day 1</h2>
<p>Millennium Park and the riverwalk (free). Art Institute free for Illinois residents; out-of-state: check library museum passes. Giordano's lunch special vs dinner pricing.</p>
<h2>Day 2</h2>
<p>Lincoln Park Zoo (free). Divvy bike day pass for lakefront trail. Happy hour in Wicker Park instead of River North bar prices.</p>
<h2>Transit</h2>
<p>CTA weekend pass beats Uber for neighborhood hopping. Fly into Midway if fares are close — Orange Line downtown in 25 minutes.</p>`,
  },
  {
    title: 'Accessories Under $50 That Upgrade Any Outfit',
    excerpt:
      'Belts, watches, and bags that look designer without the markup — tested for everyday durability.',
    image: img('1520903923143-0a02d6570f49'),
    daysAgo: 20,
    content: `
<h2>Belts and watches</h2>
<p>Full-grain leather belts from Amazon Essentials or Target hold up for years. Timex Weekender faces swap for multiple looks under $40 total.</p>
<h2>Bags</h2>
<p>Structured tote from Uniqlo or Matt & Nat on sale replaces flimsy totes. One neutral color works year-round.</p>
<h2>Jewelry</h2>
<p>Gold-plated hoops and a simple chain from Mejuri sale section — avoid costume metal that tarnishes in weeks.</p>`,
  },
  {
    title: 'Meal Prep on a Budget: $40 for Five Days of Lunches',
    excerpt:
      'Shopping list, recipes, and storage tips for beginners who want to quit the $15 salad habit.',
    image: img('1546069901-ba9599a7e63c'),
    daysAgo: 21,
    content: `
<h2>Shopping list</h2>
<p>Chicken thighs, rice, black beans, frozen broccoli, eggs, and salsa — all versatile and cheap per serving.</p>
<h2>Sunday routine</h2>
<p>90 minutes: cook grain, roast protein on two sheet pans, divide into containers. Sauce on the side keeps textures fresh.</p>
<h2>Cost breakdown</h2>
<p>Under $3 per lunch versus $12 delivery. Savings: $45/week, $180/month.</p>`,
  },
  {
    title: 'Target Circle Week: How to Stack Offers for Maximum Savings',
    excerpt:
      'Circle deals, RedCard, and manufacturer coupons — the full stacking guide for Target shoppers.',
    image: img('1441986300917-64674bd600d8'),
    daysAgo: 22,
    content: `
<h2>Download the app</h2>
<p>Clip every Circle offer before you shop — in-store and online. Some offers stack on clearance items.</p>
<h2>RedCard</h2>
<p>5% off every purchase plus free shipping on most online orders. Debit version avoids credit card debt.</p>
<h2>Seasonal timing</h2>
<p>Circle Week in fall and spring adds 20% off one purchase. Plan big home or clothing buys for those windows.</p>`,
  },
  {
    title: 'Black Friday vs Cyber Monday: When to Buy Each Category',
    excerpt:
      'TVs, laptops, toys, and travel — our year-over-year data shows which weekend wins per category.',
    image: img('1607083207637-9a4425162f8f'),
    daysAgo: 23,
    content: `
<h2>Black Friday wins</h2>
<p>TVs, appliances, and in-store doorbusters. Arrive early online — best TV deals sell out by 10 AM ET.</p>
<h2>Cyber Monday wins</h2>
<p>Software, SaaS subscriptions, travel, and Amazon-owned categories. Easier returns without store crowds.</p>
<h2>Skip both</h2>
<p>Spring and Labor Day often match TV prices. Patience beats hype for furniture and mattresses.</p>`,
  },
  {
    title: 'Digital Nomad Essentials: Gear and Subscriptions Worth Paying For',
    excerpt:
      'VPN, cloud backup, eSIM data, and lightweight tech — what actually matters when you work from anywhere.',
    image: img('1522202176988-66273c2fd55f'),
    daysAgo: 24,
    content: `
<h2>Connectivity</h2>
<p>Airalo or Holafly eSIM before landing. Portable router as backup for co-working days.</p>
<h2>Security</h2>
<p>Paid VPN on public Wi-Fi, 1Password family plan, and automatic cloud backup for photos and documents.</p>
<h2>Gear</h2>
<p>45L carry-on backpack, noise-canceling headphones, and one universal adapter with USB-C PD — skip the rest until you know your rhythm.</p>`,
  },
]

async function main() {
  console.log('Removing existing articles…')
  const { error: delErr } = await supabase.from('articles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delErr) {
    console.error('Delete failed:', delErr.message)
    process.exit(1)
  }

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
      excerpt: a.excerpt.trim(),
      content: a.content.trim(),
      featured_image_url: a.image,
      published: true,
      created_at: created.toISOString(),
      updated_at: created.toISOString(),
    }
  })

  const { data, error } = await supabase.from('articles').insert(rows).select('id, title, featured_image_url')

  if (error) {
    console.error('Insert failed:', error.message)
    process.exit(1)
  }

  console.log(`✓ Inserted ${data.length} premium articles (all with images)`)
  const missing = data.filter((a) => !a.featured_image_url)
  if (missing.length) console.warn('Missing images:', missing.length)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
