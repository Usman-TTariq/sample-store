/**
 * Fix broken clearbit logo URLs in stores/coupons → Google favicon CDN.
 * Usage: node scripts/fix-store-logos.mjs
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
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false } })

function domainFromUrl(u) {
  if (!u) return null
  try {
    return new URL(u).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function favicon(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`
}

async function main() {
  const { data: stores, error } = await supabase.from('stores').select('id, store_name, website_url, store_logo_url')
  if (error) {
    console.error(error.message)
    process.exit(1)
  }

  let updated = 0
  for (const store of stores || []) {
    const domain = domainFromUrl(store.website_url)
    if (!domain) continue
    const newLogo = favicon(domain)
    const old = store.store_logo_url || ''
    if (old.includes('clearbit.com') || !old || old.includes('broken')) {
      const { error: upErr } = await supabase
        .from('stores')
        .update({ store_logo_url: newLogo, updated_at: new Date().toISOString() })
        .eq('id', store.id)
      if (!upErr) {
        updated++
        console.log(`  ✓ ${store.store_name} → ${newLogo}`)
      }
    }
  }

  const { data: coupons } = await supabase.from('coupons').select('id, store_name, url, logo_url')
  let couponsUpdated = 0
  for (const c of coupons || []) {
    const domain = domainFromUrl(c.url)
    if (!domain) continue
    const newLogo = favicon(domain)
    if (!c.logo_url || c.logo_url.includes('clearbit.com')) {
      await supabase.from('coupons').update({ logo_url: newLogo }).eq('id', c.id)
      couponsUpdated++
    }
  }

  console.log(`\nUpdated ${updated} stores, ${couponsUpdated} coupons.`)
}

main().catch(console.error)
