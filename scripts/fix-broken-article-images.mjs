/**
 * Patch articles with known broken Unsplash URLs in Supabase.
 * Usage: node scripts/fix-broken-article-images.mjs
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

const REPLACEMENTS = [
  {
    broken: 'photo-1607082348824-0a960f2a4b9a',
    fixed:
      'https://images.unsplash.com/photo-1607083207637-9a4425162f8f?w=1200&h=675&fit=crop&q=85&auto=format',
  },
]

async function main() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, featured_image_url')

  if (error) {
    console.error('Failed to fetch articles:', error.message)
    process.exit(1)
  }

  let updated = 0
  for (const article of articles || []) {
    const imageUrl = article.featured_image_url || ''
    const match = REPLACEMENTS.find((r) => imageUrl.includes(r.broken))
    if (!match) continue

    const { error: updateError } = await supabase
      .from('articles')
      .update({ featured_image_url: match.fixed, updated_at: new Date().toISOString() })
      .eq('id', article.id)

    if (updateError) {
      console.error(`Failed to update "${article.title}":`, updateError.message)
      continue
    }

    console.log(`✓ Fixed image: ${article.title}`)
    updated++
  }

  const empty = (articles || []).filter((a) => !a.featured_image_url?.trim())
  for (const article of empty) {
    const { error: updateError } = await supabase
      .from('articles')
      .update({
        featured_image_url:
          'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=675&fit=crop&q=85&auto=format',
        updated_at: new Date().toISOString(),
      })
      .eq('id', article.id)

    if (!updateError) {
      console.log(`✓ Added fallback image: ${article.title}`)
      updated++
    }
  }

  console.log(`\nDone — ${updated} article(s) updated.`)
}

main()
