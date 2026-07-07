const VALID_COUNTRY_CODES = new Set([
  'US', 'UK', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'DK', 'FI',
  'IE', 'AT', 'CH', 'PL', 'PT', 'IN', 'SG', 'AE', 'SA', 'NZ', 'MX', 'BR', 'JP', 'KR', 'HK',
]);

const COUNTRY_HINTS: Array<{ code: string; pattern: RegExp }> = [
  { code: 'UK', pattern: /\b(uk|united kingdom|britain|england|\.co\.uk)\b/i },
  { code: 'US', pattern: /\b(us|usa|united states|u\.s\.a)\b/i },
  { code: 'CA', pattern: /\b(canada|\.ca)\b/i },
  { code: 'AU', pattern: /\b(australia|\.com\.au|\.au)\b/i },
  { code: 'DE', pattern: /\b(germany|deutschland|\.de)\b/i },
  { code: 'FR', pattern: /\b(france|\.fr)\b/i },
  { code: 'IT', pattern: /\b(italy|italia|\.it)\b/i },
  { code: 'ES', pattern: /\b(spain|españa|\.es)\b/i },
  { code: 'NL', pattern: /\b(netherlands|holland|\.nl)\b/i },
  { code: 'IN', pattern: /\b(india|\.in)\b/i },
  { code: 'SG', pattern: /\b(singapore|\.sg)\b/i },
  { code: 'AE', pattern: /\b(uae|emirates|\.ae)\b/i },
  { code: 'JP', pattern: /\b(japan|\.jp)\b/i },
];

/** Infer a 2-letter country code from slug and/or store name during bulk import. */
export function inferCountryCode(
  slug: string | null | undefined,
  storeName: string | null | undefined
): string | null {
  const text = `${slug ?? ''} ${storeName ?? ''}`.trim();
  if (!text) return null;

  const trailingCode = text.match(/\s([A-Za-z]{2})\s*$/);
  if (trailingCode) {
    const code = trailingCode[1].toUpperCase();
    if (VALID_COUNTRY_CODES.has(code)) return code;
  }

  for (const { code, pattern } of COUNTRY_HINTS) {
    if (pattern.test(text)) return code;
  }

  return null;
}
