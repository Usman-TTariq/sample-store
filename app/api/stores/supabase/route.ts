import { supabaseServer } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = supabaseServer();

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase get stores error:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message, stores: [] }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rows = (data || []) as Record<string, unknown>[];

    const stores = rows.map((row) => ({
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
    }));

    return new Response(
      JSON.stringify({ success: true, stores }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in Supabase stores GET route:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error fetching Supabase stores.',
        stores: [],
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
