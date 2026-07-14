import type { Coupon } from '@/lib/services/couponService'

export type CouponDisplayInput = Pick<
  Coupon,
  'description' | 'code' | 'storeName' | 'couponType'
> & { title?: string | null }

/** Customer-facing coupon headline — description first, never store name. */
export function getCouponDisplayTitle(input: CouponDisplayInput): string {
  const description = resolveCouponDescription(input)
  if (description) return description

  const code = input.code?.trim()
  if (code) return code

  return input.couponType === 'deal' ? 'Special Deal' : 'Special Offer'
}

/** Normalize description from DB fields (handles legacy rows where title held the offer text). */
export function resolveCouponDescription(input: CouponDisplayInput): string {
  const description = input.description?.trim()
  if (description) return description

  const title = input.title?.trim()
  const storeName = input.storeName?.trim()
  if (title && title !== storeName) return title

  return ''
}

/** Value stored in coupons.title — mirrors display title. */
export function getCouponPersistedTitle(input: CouponDisplayInput): string {
  return getCouponDisplayTitle(input)
}

export function mapRowDescription(row: Record<string, unknown>): string {
  return resolveCouponDescription({
    description: row.description as string | undefined,
    title: row.title as string | undefined,
    storeName: row.store_name as string | undefined,
    code: row.code as string | undefined,
    couponType: (row.coupon_type as Coupon['couponType']) || 'code',
  })
}
