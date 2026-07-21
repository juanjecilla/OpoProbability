import { describe, expect, it } from 'vitest';

import {
  combinations,
  curve,
  derivationSteps,
  distribution,
  marginalGain,
  minPreparedFor,
  successProbability,
  topicsToDevelop,
  validate,
  type Params,
} from './hypergeometric';

/** Reference case: 60-topic syllabus, 4 balls drawn, 2 discarded. */
const base = { N: 60, k: 4, discards: 2 } as const;
const withPrepared = (prepared: number): Params => ({ ...base, prepared });

describe('combinations', () => {
  it('computes the reference values', () => {
    expect(combinations(60, 4)).toBe(487635n);
    expect(combinations(20, 4)).toBe(4845n);
    expect(combinations(20, 3)).toBe(1140n);
  });

  it('does not overflow where doubles no longer reach', () => {
    // C(1000,10) ≈ 2.6·10²³, far above Number.MAX_SAFE_INTEGER.
    expect(combinations(1000, 10)).toBe(263409560461970212832400n);
  });

  it('is symmetric', () => {
    expect(combinations(60, 4)).toBe(combinations(60, 56));
  });

  it('returns zero for impossible combinations', () => {
    expect(combinations(4, 5)).toBe(0n);
    expect(combinations(4, -1)).toBe(0n);
  });

  it('is one at the edges', () => {
    expect(combinations(60, 0)).toBe(1n);
    expect(combinations(60, 60)).toBe(1n);
  });
});

describe('distribution', () => {
  it('reproduces the known distribution for 60/40/4', () => {
    const dist = distribution(60, 40, 4);

    expect(dist).toHaveLength(5);
    expect(dist[0]).toBeCloseTo(0.00994, 5);
    expect(dist[1]).toBeCloseTo(0.09351, 5);
    expect(dist[2]).toBeCloseTo(0.30392, 5);
    expect(dist[3]).toBeCloseTo(0.40522, 5);
    expect(dist[4]).toBeCloseTo(0.18741, 5);
  });

  it('sums to one', () => {
    for (const prepared of [0, 1, 17, 40, 59, 60]) {
      const sum = distribution(60, prepared, 4).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 10);
    }
  });

  it('still sums to one on syllabi that would overflow a double', () => {
    const sum = distribution(1000, 400, 10).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 10);
  });
});

describe('successProbability', () => {
  it('solves the reference case 60/4/2 with 40 topics prepared', () => {
    expect(successProbability(withPrepared(40))).toBeCloseTo(0.89655, 5);
  });

  it.each([
    [20, 0.40736],
    [30, 0.69402],
    [45, 0.95521],
    [50, 0.98727],
    [55, 0.99886],
  ])('returns %f with %i topics prepared', (prepared, expected) => {
    expect(successProbability(withPrepared(prepared))).toBeCloseTo(expected, 5);
  });

  it('is one for the whole syllabus and zero below the develop threshold', () => {
    expect(successProbability(withPrepared(60))).toBe(1);
    expect(successProbability(withPrepared(1))).toBe(0);
    expect(successProbability(withPrepared(0))).toBe(0);
  });

  it('increases monotonically with the topics prepared', () => {
    const values = curve(base.N, base.k, base.discards);
    for (let i = 1; i < values.length; i++) {
      expect(values[i]!).toBeGreaterThanOrEqual(values[i - 1]!);
    }
  });

  it('drops as discards shrink, because more topics must be hit', () => {
    const twoDiscards = successProbability({ ...base, prepared: 40 });
    const oneDiscard = successProbability({ ...base, discards: 1, prepared: 40 });
    const noDiscards = successProbability({ ...base, discards: 0, prepared: 40 });

    expect(twoDiscards).toBeGreaterThan(oneDiscard);
    expect(oneDiscard).toBeGreaterThan(noDiscards);
    // With no discards all 4 balls must be known: P(X = 4).
    expect(noDiscards).toBeCloseTo(0.18741, 5);
  });
});

describe('minPreparedFor', () => {
  it.each([
    [0.9, 41],
    [0.95, 45],
    [0.99, 51],
  ])('needs %i topics to reach a target of %f', (target, expected) => {
    expect(minPreparedFor(60, 4, 2, target)).toBe(expected);
  });

  it('agrees with the forward calculation', () => {
    const needed = minPreparedFor(60, 4, 2, 0.95)!;

    expect(successProbability(withPrepared(needed))).toBeGreaterThanOrEqual(0.95);
    expect(successProbability(withPrepared(needed - 1))).toBeLessThan(0.95);
  });

  it('returns zero for a trivial target and null for an unreachable one', () => {
    expect(minPreparedFor(60, 4, 2, 0)).toBe(0);
    expect(minPreparedFor(60, 4, 2, 1.5)).toBeNull();
  });
});

describe('marginalGain', () => {
  it('decreases: the last topics are worth less than the first ones', () => {
    const early = marginalGain(withPrepared(20));
    const late = marginalGain(withPrepared(50));

    expect(early).toBeGreaterThan(late);
  });

  it('is zero once the whole syllabus is prepared', () => {
    expect(marginalGain(withPrepared(60))).toBe(0);
  });
});

describe('derivationSteps', () => {
  const derivation = derivationSteps(withPrepared(40));

  it('takes the complement path when it has fewer terms', () => {
    // d = 2 → 2 failure terms (i = 0, 1) against 3 success ones (i = 2, 3, 4).
    expect(derivation.useComplement).toBe(true);
    expect(derivation.terms.map((t) => t.i)).toEqual([0, 1]);
  });

  it('exposes the exact integers shown in the explanation', () => {
    expect(derivation.total).toBe(487635n);
    expect(derivation.terms[0]!.favorable).toBe(4845n);
    expect(derivation.terms[1]!.favorable).toBe(45600n);
  });

  it('breaks each term down into its two binomial factors', () => {
    const [preparedFactor, unpreparedFactor] = derivation.terms[1]!.factors;

    expect(preparedFactor).toMatchObject({ n: 40, k: 1, value: 40n });
    expect(unpreparedFactor).toMatchObject({ n: 20, k: 3, value: 1140n });
  });

  it('reaches the same result as the direct calculation', () => {
    expect(derivation.result).toBeCloseTo(successProbability(withPrepared(40)), 12);
  });

  it('takes the direct path when the complement is longer', () => {
    // d = 4 → 4 failure terms against a single success one.
    const noDiscards = derivationSteps({ ...base, discards: 0, prepared: 40 });

    expect(noDiscards.useComplement).toBe(false);
    expect(noDiscards.terms.map((t) => t.i)).toEqual([4]);
    expect(noDiscards.result).toBeCloseTo(0.18741, 5);
  });
});

describe('topicsToDevelop', () => {
  it('subtracts the discards from the balls drawn', () => {
    expect(topicsToDevelop(withPrepared(40))).toBe(2);
    expect(topicsToDevelop({ ...base, discards: 0, prepared: 40 })).toBe(4);
  });
});

describe('validate', () => {
  it('accepts the reference case', () => {
    expect(validate(withPrepared(40))).toEqual([]);
  });

  it('rejects drawing more balls than there are topics', () => {
    expect(validate({ N: 3, k: 4, discards: 1, prepared: 2 })).toEqual(['drawExceedsTopics']);
  });

  it('rejects discarding every ball', () => {
    expect(validate({ ...base, discards: 4, prepared: 40 })).toEqual(['discardsExceedDraw']);
  });

  it('rejects preparing more topics than exist', () => {
    expect(validate(withPrepared(61))).toEqual(['preparedExceedsTopics']);
  });

  it('rejects non-integer values', () => {
    expect(validate(withPrepared(40.5))).toEqual(['preparedNegative']);
  });

  it('rejects an empty syllabus and an empty draw', () => {
    expect(validate({ N: 0, k: 0, discards: 0, prepared: 0 })).toEqual([
      'topicsTooFew',
      'drawTooFew',
    ]);
  });

  it('rejects negative discards and negative prepared topics', () => {
    expect(validate({ ...base, discards: -1, prepared: -5 })).toEqual([
      'discardsNegative',
      'preparedNegative',
    ]);
  });
});

describe('edge cases', () => {
  it('is certain when nothing has to be developed', () => {
    // discards === k is rejected by validate, but the engine must not divide by
    // zero or loop forever if it is ever called with it.
    expect(successProbability({ N: 60, k: 4, discards: 4, prepared: 0 })).toBe(1);
  });

  it('handles a syllabus of one topic', () => {
    expect(successProbability({ N: 1, k: 1, discards: 0, prepared: 1 })).toBe(1);
    expect(successProbability({ N: 1, k: 1, discards: 0, prepared: 0 })).toBe(0);
  });

  it('produces a curve with one point per possible number of prepared topics', () => {
    expect(curve(25, 3, 2)).toHaveLength(26);
  });
});
