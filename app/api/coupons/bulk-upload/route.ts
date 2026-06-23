import { supabaseServer } from '@/lib/supabase/server';

interface IncomingCouponRow {
  store_id?: number | string | null;
  code?: string | null;
  title?: string | null;
  categoryId?: string | null;
  currentUses?: number | null;
  description?: string | null;
  discount?: number | null;
  discountType?: string | null;
  expiryDate?: string | null;
  getCodeText?: string | null;
  getDealText?: string | null;
  isActive?: boolean | null;
  isLatest?: boolean | null;
  isPopular?: boolean | null;
  latestLayoutPosition?: number | null;
  layoutPosition?: number | null;
  logoUrl?: string | null;
  maxUses?: number | null;
  url?: string | null;
  couponType?: string | null;
  storeName?: string | null;
}

interface StoreLookup {
  id: string;
  storeId?: number;
  name: string;
  slug?: string;
  websiteUrl?: string;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function loadStoresFromDb(raw: Record<string, unknown>[]): StoreLookup[] {
  return raw.map((item) => ({
    id: String(item.id),
    storeId: item.store_id != null ? Number(item.store_id) : undefined,
    name: String(item.store_name || ''),
    slug: item.slug ? String(item.slug) : undefined,
    websiteUrl: item.website_url ? String(item.website_url) : undefined,
  }));
}

function extractHostname(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;
    return new URL(withProtocol).hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return null;
  }
}

function resolveStore(
  row: IncomingCouponRow,
  storesList: StoreLookup[]
): { uuid: string; storeName: string; method: string } | null {
  const storeNameRaw = row.storeName?.trim();

  if (storeNameRaw) {
    const needle = storeNameRaw.toLowerCase();
    const exact = storesList.find((s) => s.name?.toLowerCase() === needle);
    if (exact) {
      return { uuid: exact.id, storeName: exact.name, method: 'exact name' };
    }

    const partial = storesList.find((s) => {
      const name = s.name?.toLowerCase() || '';
      return name.includes(needle) || needle.includes(name);
    });
    if (partial) {
      return { uuid: partial.id, storeName: partial.name, method: 'partial name' };
    }
  }

  const idCandidate = row.store_id != null ? String(row.store_id).trim() : '';
  if (idCandidate && UUID_RE.test(idCandidate)) {
    const byUuid = storesList.find((s) => s.id === idCandidate);
    if (byUuid) {
      return { uuid: byUuid.id, storeName: byUuid.name, method: 'UUID' };
    }
  }

  if (row.store_id != null && row.store_id !== '') {
    const num =
      typeof row.store_id === 'number' ? row.store_id : parseInt(String(row.store_id), 10);
    if (!Number.isNaN(num)) {
      const match = storesList.find((s) => s.storeId === num);
      if (match) {
        return { uuid: match.id, storeName: match.name, method: 'serial store_id' };
      }
    }
  }

  const urlHost = extractHostname(row.url);
  if (urlHost) {
    const byWebsite = storesList.find((s) => {
      const storeHost = extractHostname(s.websiteUrl);
      const slugHost = s.slug ? `${s.slug}.com` : null;
      return storeHost === urlHost || slugHost === urlHost || s.slug === urlHost.split('.')[0];
    });
    if (byWebsite) {
      return { uuid: byWebsite.id, storeName: byWebsite.name, method: 'URL hostname' };
    }
  }

  return null;
}

async function autoCreateStore(
  supabase: ReturnType<typeof supabaseServer>,
  storeName: string,
  websiteUrl?: string | null,
  logoUrl?: string | null,
  existingSlugs?: Set<string>
): Promise<string | null> {
  const baseSlug = slugify(storeName);
  if (!baseSlug) return null;

  let slug = baseSlug;
  let suffix = 2;
  while (existingSlugs?.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  existingSlugs?.add(slug);

  const { data, error } = await supabase
    .from('stores')
    .insert({
      store_name: storeName,
      slug,
      website_url: websiteUrl || null,
      store_logo_url: logoUrl || null,
      status: 'active',
      country: 'US',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id, store_name, store_id, slug, website_url')
    .single();

  if (error || !data) {
    console.error('autoCreateStore failed:', error);
    return null;
  }

  return String(data.id);
}

function mapCouponRow(
  row: IncomingCouponRow,
  storeUuid: string,
  resolvedStoreName: string
) {
  const code = row.code?.trim() || '';
  const storeName = row.storeName?.trim() || resolvedStoreName;
  const title = row.title?.trim() || `${storeName} - ${code || 'Coupon'}`;

  return {
    code,
    title,
    store_name: storeName,
    store_ids: [storeUuid],
    store_id: storeUuid,
    discount_value: row.discount ?? 0,
    discount_type: row.discountType || 'percentage',
    description: row.description || '',
    status: row.isActive !== false ? 'active' : 'inactive',
    max_uses: row.maxUses ?? 0,
    current_uses: row.currentUses ?? 0,
    expiry_date: row.expiryDate || null,
    logo_url: row.logoUrl || null,
    url: row.url || null,
    coupon_type: row.couponType || 'code',
    get_code_text: row.getCodeText || null,
    get_deal_text: row.getDealText || null,
    featured: row.isPopular ?? false,
    layout_position: row.layoutPosition ?? null,
    is_latest: row.isLatest ?? false,
    latest_layout_position: row.latestLayoutPosition ?? null,
    category_id: row.categoryId || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rows = (body?.rows ?? []) as IncomingCouponRow[];

    if (!rows.length) {
      return new Response(
        JSON.stringify({ success: false, error: 'No rows provided.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = supabaseServer();

    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .select('id, store_id, store_name, slug, website_url');

    if (storeError) {
      console.error('Failed to load stores for coupon bulk upload:', storeError);
      return new Response(
        JSON.stringify({ success: false, error: storeError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let storesList = loadStoresFromDb(storeData || []);
    const { data: slugRows } = await supabase.from('stores').select('slug');
    const existingSlugs = new Set(
      (slugRows || []).map((r) => String(r.slug || '').toLowerCase()).filter(Boolean)
    );
    const pendingCreates = new Set<string>();
    const storeNamesCreated: string[] = [];

    const mappedRows: ReturnType<typeof mapCouponRow>[] = [];
    const errors: string[] = [];
    let skipped = 0;

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const rowNum = index + 1;
      let resolved = resolveStore(row, storesList);

      if (!resolved) {
        const storeLabel = row.storeName?.trim() || `store_id ${row.store_id ?? '?'}`;
        const createKey = storeLabel.toLowerCase();

        if (!pendingCreates.has(createKey)) {
          pendingCreates.add(createKey);
          const newId = await autoCreateStore(
            supabase,
            row.storeName?.trim() || storeLabel,
            row.url,
            row.logoUrl,
            existingSlugs
          );

          if (newId) {
            const newName = row.storeName?.trim() || storeLabel;
            storesList = [
              ...storesList,
              {
                id: newId,
                name: newName,
                storeId: undefined,
                websiteUrl: row.url || undefined,
              },
            ];
            storeNamesCreated.push(newName);
            resolved = { uuid: newId, storeName: newName, method: 'auto-created' };
          }
        } else {
          const existing = storesList.find(
            (s) => s.name.toLowerCase() === createKey || s.name.toLowerCase().includes(createKey)
          );
          if (existing) {
            resolved = { uuid: existing.id, storeName: existing.name, method: 'pending batch create' };
          }
        }
      }

      if (!resolved) {
        skipped += 1;
        const hints: string[] = [];
        if (row.storeName) hints.push(`Store Name "${row.storeName}"`);
        if (row.store_id != null) hints.push(`store_id ${row.store_id}`);
        if (row.url) hints.push(`URL "${row.url}"`);
        errors.push(
          `Row ${rowNum}: could not resolve store (${hints.join(', ') || 'no store identifier'})`
        );
        continue;
      }

      mappedRows.push(mapCouponRow(row, resolved.uuid, resolved.storeName));
    }

    if (!mappedRows.length) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No valid coupon rows after store resolution.',
          uploaded: 0,
          skipped,
          errors,
          storesCreated: storeNamesCreated.length,
          storeNames: storeNamesCreated,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error: insertError, count } = await supabase
      .from('coupons')
      .insert(mappedRows, { count: 'exact' });

    if (insertError) {
      console.error('Supabase bulk upload error:', insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: insertError.message,
          uploaded: 0,
          skipped,
          errors,
          storesCreated: storeNamesCreated.length,
          storeNames: storeNamesCreated,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const uploaded = count ?? mappedRows.length;

    return new Response(
      JSON.stringify({
        success: true,
        count: uploaded,
        uploaded,
        skipped,
        errors,
        storesCreated: storeNamesCreated.length,
        storeNames: storeNamesCreated,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Bulk upload handler error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during bulk upload.',
        uploaded: 0,
        skipped: 0,
        errors: [],
        storesCreated: 0,
        storeNames: [],
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
