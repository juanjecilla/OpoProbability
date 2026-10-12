import { describe, expect, it } from 'vitest';

import {
  classifyRound,
  countStudied,
  cryptoRng,
  drawRound,
  pickStudiedSet,
  tally,
  type Rng,
} from './draw';
import { successProbability } from './hypergeometric';

/** Small deterministic generator (mulberry32). */
function seeded(seed: number): Rng {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
  };
}

describe('drawRound / pickStudiedSet', () => {
  it('draws k distinct topics within 1..N', () => {
    const drawn = drawRound(60, 4, seeded(1));
    expect(drawn).toHaveLength(4);
    expect(new Set(drawn).size).toBe(4);
    expect(drawn.every((topic) => topic >= 1 && topic <= 60)).toBe(true);
  });

  it('can draw the whole syllabus', () => {
    expect(drawRound(5, 5, seeded(2)).toSorted((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });

  it('picks P distinct studied topics, sorted', () => {
    const studied = pickStudiedSet(60, 40, seeded(3));
    expect(studied).toHaveLength(40);
    expect(new Set(studied).size).toBe(40);
    expect(studied).toEqual(studied.toSorted((a, b) => a - b));
  });

  it('picks nothing when P is 0', () => {
    expect(pickStudiedSet(10, 0, seeded(4))).toEqual([]);
  });
});

describe('classifyRound', () => {
  const studied = new Set([1, 2, 3]);

  it('counts studied topics among the drawn', () => {
    expect(countStudied([1, 9, 3], studied)).toBe(2);
  });

  it('is a success at or above the minimum', () => {
    expect(classifyRound([1, 2, 9, 8], studied, 2)).toBe('success');
  });

  it('is a failure below the minimum with some studied', () => {
    expect(classifyRound([1, 7, 9, 8], studied, 2)).toBe('failure');
  });

  it('is a wipeout when nothing drawn is studied', () => {
    expect(classifyRound([7, 9, 8, 6], studied, 2)).toBe('wipeout');
  });
});

describe('tally', () => {
  it('counts wipeouts inside failures', () => {
    expect(tally(['success', 'failure', 'wipeout', 'wipeout'])).toEqual({
      rounds: 4,
      successes: 1,
      failures: 3,
      wipeouts: 2,
    });
  });
});

describe('simulation vs hypergeometric', () => {
  it('converges to the calculated success probability', () => {
    const params = { N: 60, k: 4, discards: 2, prepared: 40 };
    const rng = seeded(42);
    const studied = new Set(pickStudiedSet(params.N, params.prepared, rng));
    const rounds = 20_000;
    let successes = 0;
    for (let i = 0; i < rounds; i++) {
      if (classifyRound(drawRound(params.N, params.k, rng), studied, 2) === 'success') successes++;
    }
    expect(Math.abs(successes / rounds - successProbability(params))).toBeLessThan(0.01);
  });
});

describe('cryptoRng', () => {
  it('returns floats in [0, 1)', () => {
    for (let i = 0; i < 50; i++) {
      const value = cryptoRng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});
