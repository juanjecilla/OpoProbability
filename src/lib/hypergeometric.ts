/**
 * Probability engine for competitive-exam topic draws.
 *
 * Model: the examining board draws `k` balls at random and without replacement
 * from a syllabus of `N` topics. The candidate discards `discards` of them and
 * must develop the remaining `d = k - discards`. They have studied `prepared`
 * topics.
 *
 * Because the draw is without replacement from a finite population, the
 * variable "how many of the drawn topics are ones I prepared" follows a
 * **hypergeometric** distribution, not a binomial one.
 *
 * All combinatorics run on BigInt: C(N,k) overflows Number.MAX_SAFE_INTEGER on
 * large syllabi (e.g. C(1000,10) ≈ 2.6·10²³).
 */

export interface Params {
  /** Total number of topics in the syllabus. */
  N: number;
  /** Number of balls the board draws. */
  k: number;
  /** Number of drawn balls the candidate may discard. */
  discards: number;
  /** Number of topics the candidate has prepared. */
  prepared: number;
}

/** A single binomial coefficient C(n, k) together with its exact value. */
export interface CombinationFactor {
  n: number;
  k: number;
  value: bigint;
}

/** One term of the summation, with its factors and its probability. */
export interface DerivationTerm {
  /** Number of prepared topics among the drawn ones. */
  i: number;
  factors: [CombinationFactor, CombinationFactor];
  /** Product of the factors: cases favourable to this term. */
  favorable: bigint;
  probability: number;
}

/** Everything needed to render the step-by-step explanation. */
export interface Derivation {
  params: Params;
  /** Topics to develop: `k - discards`. */
  d: number;
  /** Total cases: C(N, k). */
  total: bigint;
  /**
   * When `true`, the listed terms are the **failure** ones and the result is
   * obtained as `1 - Σ`. Whichever path has fewer terms is chosen.
   */
  useComplement: boolean;
  terms: DerivationTerm[];
  /** Sum of the probabilities of the listed terms. */
  termsSum: number;
  /** Final probability of success. */
  result: number;
}

const combinationCache = new Map<string, bigint>();

/**
 * Exact binomial coefficient C(n, k).
 *
 * Computed multiplicatively —C(n,i+1) = C(n,i)·(n-i)/(i+1)— so intermediate
 * values never grow larger than the result, and using the symmetry
 * C(n,k) = C(n,n-k) to halve the number of iterations.
 *
 * Returns `0n` for impossible combinations (k < 0 or k > n), which lets the
 * summations be written without special-casing their edges.
 */
export function combinations(n: number, k: number): bigint {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0) return 0n;
  if (k < 0 || k > n) return 0n;

  const kk = Math.min(k, n - k);
  const cacheKey = `${n},${kk}`;
  const cached = combinationCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let result = 1n;
  const bigN = BigInt(n);
  for (let i = 0n; i < BigInt(kk); i++) {
    result = (result * (bigN - i)) / (i + 1n);
  }

  combinationCache.set(cacheKey, result);
  return result;
}

const RATIO_SCALE = 10n ** 20n;

/**
 * Divides two BigInts returning a `number`.
 *
 * `Number(num) / Number(den)` would yield `Infinity/Infinity` once both exceed
 * the double range, so the numerator is scaled before dividing to keep roughly
 * 20 significant digits of the quotient.
 */
function ratioToNumber(numerator: bigint, denominator: bigint): number {
  if (denominator === 0n) return 0;
  return Number((numerator * RATIO_SCALE) / denominator) / Number(RATIO_SCALE);
}

/** Topics that must be developed once the discards are applied. */
export function topicsToDevelop(params: Params): number {
  return params.k - params.discards;
}

/**
 * Cases favourable to drawing exactly `i` prepared topics:
 *
 *     C(P, i) · C(N-P, k-i)
 */
function favorableFor(N: number, prepared: number, k: number, i: number): bigint {
  return combinations(prepared, i) * combinations(N - prepared, k - i);
}

/**
 * Full distribution: `P(X = i)` for `i = 0..k`, where `X` is the number of
 * prepared topics among the `k` drawn.
 *
 *     P(X = i) = C(P, i) · C(N-P, k-i) / C(N, k)
 */
export function distribution(N: number, prepared: number, k: number): number[] {
  const total = combinations(N, k);

  return Array.from({ length: k + 1 }, (_, i) =>
    ratioToNumber(favorableFor(N, prepared, k, i), total),
  );
}

/**
 * Probability of being able to develop the required topics, i.e. `P(X >= d)`.
 *
 *     P(success) = Σ_{i=d}^{k} C(P, i) · C(N-P, k-i) / C(N, k)
 *
 * Favourable cases accumulate in BigInt and the division happens only at the
 * end. Summing already-rounded probabilities introduced an error large enough
 * to break the monotonicity of the function (P(59) could come out above P(60)).
 */
export function successProbability(params: Params): number {
  const { N, k, prepared } = params;
  const d = topicsToDevelop(params);
  if (d <= 0) return 1;
  if (prepared < d) return 0;

  let favorable = 0n;
  for (let i = d; i <= k; i++) {
    favorable += favorableFor(N, prepared, k, i);
  }

  return ratioToNumber(favorable, combinations(N, k));
}

/**
 * Inverse problem: minimum number of topics to prepare to reach `target`.
 *
 * `successProbability` is monotonically increasing in `prepared`, so it is
 * enough to walk `prepared = 0..N` and return the first value crossing the
 * threshold. Returns `null` when even the whole syllabus falls short (which
 * only happens for `target > 1`).
 */
export function minPreparedFor(
  N: number,
  k: number,
  discards: number,
  target: number,
): number | null {
  for (let prepared = 0; prepared <= N; prepared++) {
    if (successProbability({ N, k, discards, prepared }) >= target) return prepared;
  }
  return null;
}

/** Success probability for every `prepared = 0..N`, used to draw the curve. */
export function curve(N: number, k: number, discards: number): number[] {
  return Array.from({ length: N + 1 }, (_, prepared) =>
    successProbability({ N, k, discards, prepared }),
  );
}

/**
 * How much probability one extra prepared topic adds.
 *
 * This is the crux of diminishing returns: the same effort is worth a lot at
 * the start and almost nothing once most of the syllabus is covered.
 */
export function marginalGain(params: Params): number {
  if (params.prepared >= params.N) return 0;
  const next = successProbability({ ...params, prepared: params.prepared + 1 });
  return next - successProbability(params);
}

/**
 * Data for the step-by-step explanation, using the user's real numbers.
 *
 * Only the shorter path is listed: the failure one (`i < d`, result `1 - Σ`) or
 * the success one (`i >= d`, result `Σ`). In the typical 60/4/2 case the
 * failure path has 2 terms against 3, and it also reads better: "the only
 * draws that sink me are those bringing 0 or 1 of my topics".
 */
export function derivationSteps(params: Params): Derivation {
  const { N, k, prepared } = params;
  const d = topicsToDevelop(params);
  const total = combinations(N, k);
  const unprepared = N - prepared;

  const failureCount = d;
  const successCount = k - d + 1;
  const useComplement = failureCount < successCount;

  const indices = useComplement
    ? Array.from({ length: d }, (_, i) => i)
    : Array.from({ length: successCount }, (_, i) => d + i);

  const terms: DerivationTerm[] = indices.map((i) => {
    const preparedFactor: CombinationFactor = {
      n: prepared,
      k: i,
      value: combinations(prepared, i),
    };
    const unpreparedFactor: CombinationFactor = {
      n: unprepared,
      k: k - i,
      value: combinations(unprepared, k - i),
    };
    const favorable = preparedFactor.value * unpreparedFactor.value;

    return {
      i,
      factors: [preparedFactor, unpreparedFactor],
      favorable,
      probability: ratioToNumber(favorable, total),
    };
  });

  // The sum accumulates in BigInt for the same reason as in successProbability.
  const favorableSum = terms.reduce((acc, term) => acc + term.favorable, 0n);
  const termsSum = ratioToNumber(favorableSum, total);

  return {
    params,
    d,
    total,
    useComplement,
    terms,
    termsSum,
    result: useComplement ? ratioToNumber(total - favorableSum, total) : termsSum,
  };
}

/** Machine-readable validation problems, translated by the UI layer. */
export type ValidationIssue =
  | 'topicsTooFew'
  | 'drawTooFew'
  | 'drawExceedsTopics'
  | 'discardsNegative'
  | 'discardsExceedDraw'
  | 'preparedNegative'
  | 'preparedExceedsTopics';

/**
 * Checks that the parameters are coherent.
 *
 * Returns the issues found (empty when everything is valid) instead of
 * throwing, so the UI can render them next to the offending field. Issues are
 * codes rather than sentences because the app is bilingual.
 */
export function validate(params: Params): ValidationIssue[] {
  const { N, k, discards, prepared } = params;
  const issues: ValidationIssue[] = [];

  if (!Number.isInteger(N) || N < 1) {
    issues.push('topicsTooFew');
  }

  const isDrawValid = Number.isInteger(k) && k >= 1;
  if (!isDrawValid) {
    issues.push('drawTooFew');
  } else if (k > N) {
    issues.push('drawExceedsTopics');
  }

  if (!Number.isInteger(discards) || discards < 0) {
    issues.push('discardsNegative');
  } else if (isDrawValid && discards >= k) {
    // Only meaningful once `k` itself makes sense, otherwise every invalid draw
    // would also report a bogus discard error.
    issues.push('discardsExceedDraw');
  }
  if (!Number.isInteger(prepared) || prepared < 0) {
    issues.push('preparedNegative');
  } else if (prepared > N) {
    issues.push('preparedExceedsTopics');
  }

  return issues;
}
