/**
 * The verdict attached to a probability.
 *
 * The buckets are the ones the UI speaks in ("coin toss", "risky"); the colour
 * each one wears lives in the stylesheet, keyed off `data-risk`.
 */

export type RiskLevel = 'veryHigh' | 'high' | 'even' | 'low' | 'veryLow';

export function riskLevel(probability: number): RiskLevel {
  if (probability >= 0.9) return 'veryHigh';
  if (probability >= 0.7) return 'high';
  if (probability >= 0.5) return 'even';
  if (probability >= 0.3) return 'low';
  return 'veryLow';
}
