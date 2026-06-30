import { supabaseServer } from '@/lib/supabase/server';
import { buildIlikeOrFilter, escapeIlike } from '@/lib/utils/searchQuery';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
      return Response.json({
        success: true,
        stores: [],
        coupons: [],
        articles: [],
        categories: [],
      });
    }

    const supabase = supabaseServer();
    const pattern = `%${escapeIlike(query)}%`;

    const [storesRes, couponsRes, articlesRes, categoriesRes] = await Promise.all([
      supabase
        .from('stores')
        .select('*')
        .or(buildIlikeOrFilter(['store_name', 'slug', 'description'], query))
        .limit(30),
      supabase
        .from('coupons')
        .select('*')
        .eq('status', 'active')
        .or(buildIlikeOrFilter(['store_name', 'code', 'description'], query))
        .limit(40),
      supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .or(buildIlikeOrFilter(['title', 'excerpt', 'content'], query))
        .limit(20),
      supabase.from('categories').select('*').ilike('name', pattern).limit(10),
    ]);

    if (storesRes.error) console.error('Search stores error:', storesRes.error);
    if (couponsRes.error) console.error('Search coupons error:', couponsRes.error);
    if (articlesRes.error) console.error('Search articles error:', articlesRes.error);
    if (categoriesRes.error) console.error('Search categories error:', categoriesRes.error);

    const stores = (storesRes.data || []).map((row: Record<string, unknown>) => ({
      id: row.id != null ? String(row.id) : undefined,
      storeId: row.store_id != null ? Number(row.store_id) : undefined,
      name: String(row.store_name || row.name || ''),
      slug: (row.slug as string) || undefined,
      description: (row.description as string) || undefined,
      logoUrl: (row.store_logo_url as string) || (row.logo_url as string) || undefined,
      websiteUrl: (row.website_url as string) || undefined,
      trackingLink: (row.tracking_link as string) || undefined,
      categoryId: (row.category_id as string) || null,
    }));

    const coupons = (couponsRes.data || []).map((row: Record<string, unknown>) => ({
      id: row.id != null ? String(row.id) : undefined,
      code: String(row.code || ''),
      storeName: (row.store_name as string) || undefined,
      description: String(row.description || ''),
      logoUrl: (row.logo_url as string) || undefined,
      url: (row.url as string) || undefined,
      couponType: ((row.coupon_type as string) || 'code') as 'code' | 'deal',
      discount: Number(row.discount_value ?? 0),
      discountType: ((row.discount_type as string) || 'percentage') as 'percentage' | 'fixed',
      categoryId: (row.category_id as string) || null,
    }));

    const articles = (articlesRes.data || []).map((row: Record<string, unknown>) => ({
      id: row.id != null ? String(row.id) : undefined,
      title: String(row.title || ''),
      description: String(row.excerpt || ''),
      imageUrl: (row.featured_image_url as string) || '',
      createdAt: row.created_at as string | undefined,
    }));

    const categories = (categoriesRes.data || []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      name: String(row.name || ''),
      logoUrl: (row.icon_url as string) || undefined,
      backgroundColor: String(row.background_color ?? ''),
    }));

    return Response.json(
      {
        success: true,
        stores,
        coupons,
        articles,
        categories,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        stores: [],
        coupons: [],
        articles: [],
        categories: [],
      },
      { status: 500 }
    );
  }
}
