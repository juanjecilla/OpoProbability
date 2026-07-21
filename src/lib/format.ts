/**
 * Locale-aware formatters.
 *
 * `Intl` objects are cached per locale because building one is relatively
 * expensive and these run on every render of the curve.
 */

interface Formatters {
  percent: Intl.NumberFormat;
  precisePercent: Intl.NumberFormat;
  integer: Intl.NumberFormat;
}

const cache = new Map<string, Formatters>();

function formattersFor(locale: string): Formatters {
  const cached = cache.get(locale);
  if (cached) return cached;

  const formatters: Formatters = {
    percent: new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
    precisePercent: new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }),
    integer: new Intl.NumberFormat(locale),
  };

  cache.set(locale, formatters);
  return formatters;
}

/** Percentage with one decimal: `89.7%` / `89,7 %`. */
export function formatPercent(value: number, locale: string): string {
  return formattersFor(locale).percent.format(value);
}

/** Percentage with three decimals, used in the derivation: `89.655%`. */
export function formatPrecisePercent(value: number, locale: string): string {
  return formattersFor(locale).precisePercent.format(value);
}

/** Whole number with thousands separators. Accepts BigInt, as combinatorics are. */
export function formatInteger(value: bigint | number, locale: string): string {
  return formattersFor(locale).integer.format(value);
}
