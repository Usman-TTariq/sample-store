import { supabaseServer } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapStoreRow(row: Record<string, unknown>) {
  return {
    id: row.id?.toString(),
    storeId: row.store_id ? (typeof row.store_id === 'number' ? row.store_id : parseInt(String(row.store_id), 10)) : undefined,
    name: (row.store_name as string) || (row.name as string) || '',
    subStoreName: (row.subStoreName as string) || (row.sub_store_name as string) || undefined,
    slug: (row.slug as string) || undefined,
    description: (row.description as string) || '',
    logoUrl: (row.store_logo_url as string) || (row.logo_url as string) || undefined,
    websiteUrl: (row.website_url as string) || undefined,
    seoTitle: (row.seoTitle as string) || (row.seo_title as string) || undefined,
    seoDescription: (row.seoDescription as string) || (row.seo_description as string) || undefined,
    isTrending: (row.isTrending as boolean) ?? (row.featured as boolean) ?? false,
    layoutPosition: (row.layout_position as number) || null,
    categoryId: (row.category_id as string) || null,
    couponOrder: (row.coupon_order as string[]) || null,
    trackingLink: (row.tracking_link as string) || undefined,
    country: (row.country as string) || undefined,
    status: (row.status as string) || undefined,
    createdAt: (row.created_at as string) || undefined,
  };
}

async function findStoreByParam(supabase: ReturnType<typeof supabaseServer>, idParam: string) {
  if (UUID_RE.test(idParam)) {
    const { data } = await supabase.from('stores').select('id').eq('id', idParam).limit(1).maybeSingle();
    if (data) return data;
  }

  if (/^\d+$/.test(idParam)) {
    const { data } = await supabase
      .from('stores')
      .select('id')
      .eq('store_id', Number(idParam))
      .limit(1)
      .maybeSingle();
    if (data) return data;
  }

  const { data: bySlug } = await supabase
    .from('stores')
    .select('id')
    .eq('slug', idParam)
    .limit(1)
    .maybeSingle();
  if (bySlug) return bySlug;

  const { data: bySlugCi } = await supabase
    .from('stores')
    .select('id')
    .ilike('slug', idParam)
    .limit(1)
    .maybeSingle();
  if (bySlugCi) return bySlugCi;

  if (idParam) {
    const nameGuess = idParam.replace(/-/g, ' ');
    const { data: byName } = await supabase
      .from('stores')
      .select('id')
      .ilike('store_name', nameGuess)
      .limit(1)
      .maybeSingle();
    if (byName) return byName;
  }

  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseServer();
    const { id: slug } = await params;
    const safeSlug = slug ?? '';

    let { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', safeSlug)
      .limit(1)
      .maybeSingle();

    if (!data) {
      const { data: ciData } = await supabase
        .from('stores')
        .select('*')
        .ilike('slug', safeSlug)
        .limit(1)
        .maybeSingle();
      data = ciData || null;
    }

    if (!data && safeSlug) {
      const nameGuess = safeSlug.replace(/-/g, ' ');
      const { data: nameData } = await supabase
        .from('stores')
        .select('*')
        .ilike('store_name', nameGuess)
        .limit(1)
        .maybeSingle();
      data = nameData || null;
    }

    if (!data && UUID_RE.test(safeSlug)) {
      const { data: uuidData } = await supabase
        .from('stores')
        .select('*')
        .eq('id', safeSlug)
        .limit(1)
        .maybeSingle();
      data = uuidData || null;
    }

    if (error) {
      console.error('Supabase get store by slug error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message, store: null }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ success: false, error: 'Store not found', store: null }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, store: mapStoreRow(data as Record<string, unknown>) }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in Supabase store-by-id GET route:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching Supabase store.',
        store: null,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseServer();
    const { id } = await params;
    const idParam = id ?? '';
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.store_id !== undefined) updates.store_id = body.store_id;
    if (body.store_name !== undefined) updates.store_name = body.store_name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.store_logo_url !== undefined) updates.store_logo_url = body.store_logo_url;
    if (body.subStoreName !== undefined) updates.subStoreName = body.subStoreName;
    if (body.sub_store_name !== undefined) updates.sub_store_name = body.sub_store_name;
    if (body.slug !== undefined) updates.slug = body.slug;
    if (body.seoTitle !== undefined) updates.seoTitle = body.seoTitle;
    if (body.seo_title !== undefined) updates.seo_title = body.seo_title;
    if (body.seoDescription !== undefined) updates.seoDescription = body.seoDescription;
    if (body.seo_description !== undefined) updates.seo_description = body.seo_description;
    if (body.isTrending !== undefined) updates.isTrending = body.isTrending;
    if (body.tracking_link !== undefined) updates.tracking_link = body.tracking_link;
    if (body.website_url !== undefined) updates.website_url = body.website_url;
    if (body.country !== undefined) updates.country = body.country;
    if (body.status !== undefined) updates.status = body.status;
    if (body.category_id !== undefined) updates.category_id = body.category_id;

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No fields provided to update.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existing = await findStoreByParam(supabase, idParam);
    if (!existing) {
      return new Response(
        JSON.stringify({ success: false, error: 'Store not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', existing.id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error updating store:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ success: false, error: 'Store not found (update failed)' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, store: mapStoreRow(data as Record<string, unknown>) }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unexpected error in PATCH store route:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error updating store',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = supabaseServer();
    const { id } = await params;
    const idParam = id ?? '';

    const existing = await findStoreByParam(supabase, idParam);
    if (!existing) {
      return new Response(
        JSON.stringify({ success: false, error: 'Store not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase.from('stores').delete().eq('id', existing.id);

    if (error) {
      console.error('Error deleting store:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unexpected error in DELETE store route:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error deleting store',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
