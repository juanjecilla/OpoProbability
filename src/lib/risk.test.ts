import { describe, expect, it } from 'vitest';

import { riskLevel } from './risk';

describe('riskLevel', () => {
  it('reads the probability in five bands', () => {
    expect(riskLevel(0.95)).toBe('veryHigh');
    expect(riskLevel(0.75)).toBe('high');
    expect(riskLevel(0.55)).toBe('even');
    expect(riskLevel(0.35)).toBe('low');
    expect(riskLevel(0.05)).toBe('veryLow');
  });

  it('puts each boundary in the friendlier band', () => {
    expect(riskLevel(0.9)).toBe('veryHigh');
    expect(riskLevel(0.7)).toBe('high');
    expect(riskLevel(0.5)).toBe('even');
    expect(riskLevel(0.3)).toBe('low');
  });

  it('covers the extremes', () => {
    expect(riskLevel(1)).toBe('veryHigh');
    expect(riskLevel(0)).toBe('veryLow');
  });
});
