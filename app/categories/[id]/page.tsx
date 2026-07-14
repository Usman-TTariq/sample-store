import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CategoryPageClient from './CategoryPageClient';
import Footer from '@/app/components/Footer';
import { siteConfig } from '@/lib/seo/config';
import { getCategoryBySlugOrId } from '@/lib/services/categoryService';
import { categoryPath, isCategoryUuid } from '@/lib/utils/categorySlug';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const category = await getCategoryBySlugOrId(id).catch(() => null);
  const path = category ? categoryPath(category) : `/categories/${id}`;

  const title = category?.name ? `${category.name} Coupons & Deals` : 'Category';
  const description = category?.name
    ? `Browse the best ${category.name} coupons and discount codes on ${siteConfig.name}. Save on top brands in ${category.name}.`
    : `Browse coupons by category on ${siteConfig.name}.`;
  const canonical = `${siteConfig.url}${path}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  };
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const category = await getCategoryBySlugOrId(resolvedParams.id).catch(() => null);

  // Old UUID links → pretty slug URLs (e.g. /categories/fashion)
  if (category && isCategoryUuid(resolvedParams.id) && category.slug) {
    redirect(`/categories/${category.slug}`);
  }

  return (
    <>
      <CategoryPageClient params={resolvedParams} />
      <Footer />
    </>
  );
}
