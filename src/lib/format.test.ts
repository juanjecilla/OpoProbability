import { describe, expect, it } from 'vitest';

import { formatInteger, formatPercent, formatPrecisePercent } from './format';

/** Non-breaking and narrow spaces vary by ICU version; compare without them. */
const normalize = (value: string) => value.replaceAll(/[\s  ]/gu, ' ');

describe('formatPercent', () => {
  it('uses one decimal', () => {
    expect(normalize(formatPercent(0.89655, 'en-GB'))).toBe('89.7%');
  });

  it('follows the locale separators', () => {
    expect(normalize(formatPercent(0.89655, 'es-ES'))).toBe('89,7 %');
  });

  it('handles the extremes', () => {
    expect(normalize(formatPercent(0, 'en-GB'))).toBe('0.0%');
    expect(normalize(formatPercent(1, 'en-GB'))).toBe('100.0%');
  });
});

describe('formatPrecisePercent', () => {
  it('keeps three decimals for the derivation', () => {
    expect(normalize(formatPrecisePercent(0.89655, 'en-GB'))).toBe('89.655%');
    expect(normalize(formatPrecisePercent(0.00994, 'es-ES'))).toBe('0,994 %');
  });
});

describe('formatInteger', () => {
  it('groups thousands per locale', () => {
    expect(normalize(formatInteger(487_635, 'en-GB'))).toBe('487,635');
    expect(normalize(formatInteger(487_635, 'es-ES'))).toBe('487.635');
  });

  it('accepts BigInt, which is what the combinatorics return', () => {
    expect(normalize(formatInteger(263409560461970212832400n, 'en-GB'))).toBe(
      '263,409,560,461,970,212,832,400',
    );
  });

  it('reuses the cached formatter across calls', () => {
    expect(formatInteger(1000, 'en-GB')).toBe(formatInteger(1000, 'en-GB'));
  });
});
