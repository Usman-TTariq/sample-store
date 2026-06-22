import { Metadata } from 'next';
import { siteConfig } from '@/lib/seo/config';
import CategoryPageClient from './CategoryPageClient';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { getCategoryById } = await import('@/lib/services/categoryService');
  const category = await getCategoryById(id).catch(() => null);

  const title = category?.name ? `${category.name} Coupons & Deals` : 'Category';
  const description = category?.name
    ? `Browse the best ${category.name} coupons and discount codes on ${siteConfig.name}. Save on top brands in ${category.name}.`
    : `Browse coupons by category on ${siteConfig.name}.`;
  const canonical = `${siteConfig.url}/categories/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  return <CategoryPageClient params={resolvedParams} />;
}
