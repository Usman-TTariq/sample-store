/**
 * Drop deprecated merchant_id / network_id columns from stores.
 *
 * Add to .env.local (Supabase → Project Settings → Database → Connection string URI):
 *   DATABASE_URL=postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
 *
 * Usage: node scripts/drop-merchant-network.mjs
 */

import pg from 'pg'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

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

loadEnvFile(resolve(root, '.env'))
loadEnvFile(resolve(root, '.env.local'))
loadEnvFile(resolve(root, '.env.migration'))

const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.NEW_DATABASE_URL ||
  process.env.SUPABASE_DATABASE_URL

if (!DATABASE_URL) {
  console.error('\nMissing DATABASE_URL in .env.local\n')
  console.error('Supabase Dashboard → Project Settings → Database → Connection string (URI, pooler)\n')
  process.exit(1)
}

const sql = readFileSync(resolve(root, 'supabase/drop-merchant-network.sql'), 'utf8')
const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

try {
  await client.connect()
  console.log('Connected. Dropping merchant_id and network_id from stores...')
  await client.query(sql)
  console.log('Done — columns removed (or were already absent).')
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
