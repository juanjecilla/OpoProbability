/**
 * Random draws for the simulator.
 *
 * Pure apart from the injected `Rng`, so the maths can be tested with a seeded
 * generator while the app uses the browser's cryptographic one.
 */

/** Returns a float in `[0, 1)`. */
export type Rng = () => number;

export type Outcome = 'success' | 'failure' | 'wipeout';

export interface Tally {
  rounds: number;
  successes: number;
  failures: number;
  /** Failures where no drawn topic was studied; already counted in `failures`. */
  wipeouts: number;
}

/** Uniform float from `crypto.getRandomValues`, 32 bits of resolution. */
export const cryptoRng: Rng = () => {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return (buffer[0] ?? 0) / 2 ** 32;
};

/**
 * `count` distinct topic numbers out of `1..N`, in pick order.
 *
 * Partial Fisher–Yates: only the first `count` slots are shuffled, and the
 * pool is built lazily as a sparse swap map so a huge syllabus stays cheap.
 */
function sample(N: number, count: number, rng: Rng): number[] {
  const swapped = new Map<number, number>();
  const picked: number[] = [];

  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (N - i));
    picked.push(swapped.get(j) ?? j + 1);
    swapped.set(j, swapped.get(i) ?? i + 1);
  }

  return picked;
}

/** The topics the candidate has studied: `P` distinct numbers, ascending. */
export function pickStudiedSet(N: number, P: number, rng: Rng): number[] {
  return sample(N, P, rng).toSorted((a, b) => a - b);
}

/** One board draw: `k` distinct topic numbers in the order they came out. */
export function drawRound(N: number, k: number, rng: Rng): number[] {
  return sample(N, k, rng);
}

export function countStudied(drawn: readonly number[], studied: ReadonlySet<number>): number {
  return drawn.filter((topic) => studied.has(topic)).length;
}

export function classifyRound(
  drawn: readonly number[],
  studied: ReadonlySet<number>,
  minimum: number,
): Outcome {
  const known = countStudied(drawn, studied);
  if (known >= minimum) return 'success';
  return known === 0 ? 'wipeout' : 'failure';
}

export function tally(outcomes: readonly Outcome[]): Tally {
  const wipeouts = outcomes.filter((outcome) => outcome === 'wipeout').length;
  const successes = outcomes.filter((outcome) => outcome === 'success').length;
  return {
    rounds: outcomes.length,
    successes,
    failures: outcomes.length - successes,
    wipeouts,
  };
}
