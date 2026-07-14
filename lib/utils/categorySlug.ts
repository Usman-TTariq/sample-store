export function slugifyCategoryName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function isCategoryUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

/** Public path for a category — prefers slug over raw id. */
export function categoryPath(category: {
  id?: string;
  name?: string;
  slug?: string | null;
}): string {
  const slug =
    category.slug?.trim() ||
    (category.name ? slugifyCategoryName(category.name) : '');
  if (slug) return `/categories/${slug}`;
  if (category.id) return `/categories/${category.id}`;
  return '/categories';
}
