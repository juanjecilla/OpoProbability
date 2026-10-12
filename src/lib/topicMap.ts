/**
 * The Topic map: which Syllabus topics the candidate has studied.
 *
 * Stored by topic number and never trimmed when the Syllabus shrinks, so a
 * typo in `N` cannot wipe the work; every read that matters clips to `1..N`.
 * Pure, like the rest of `lib`: persistence lives in `useTopicMap`.
 */

import { toInteger, type FieldInputs } from './fields.js';

/** Sorted, unique, positive integers. */
export type TopicMap = number[];

/** Above this many topics the editor drops the chip grid for the range box. */
export const MAX_CHIPS = 500;

export const STORAGE_VERSION = 1;

export function normalize(topics: Iterable<number>): TopicMap {
  const valid = [...topics].filter((topic) => Number.isInteger(topic) && topic >= 1);
  return [...new Set(valid)].toSorted((a, b) => a - b);
}

/** The marked topics that exist in a Syllabus of `N`. */
export function studiedWithin(map: readonly number[], N: number): number[] {
  return map.filter((topic) => topic <= N);
}

/**
 * In Topic-map mode `P` is not typed but counted. While `N` is half-typed
 * there is nothing to count against, so the inputs are left as they are.
 */
export function withMapP(inputs: FieldInputs, map: readonly number[]): FieldInputs {
  const N = toInteger(inputs.N);
  if (N === null) return inputs;
  return { ...inputs, P: String(studiedWithin(map, N).length) };
}

export function toggle(map: readonly number[], topic: number): TopicMap {
  return map.includes(topic) ? map.filter((t) => t !== topic) : normalize([...map, topic]);
}

function range(N: number): number[] {
  return Array.from({ length: N }, (_, index) => index + 1);
}

export function markAll(map: readonly number[], N: number): TopicMap {
  return normalize([...map, ...range(N)]);
}

export function markNone(map: readonly number[], N: number): TopicMap {
  return map.filter((topic) => topic > N);
}

export function invert(map: readonly number[], N: number): TopicMap {
  const marked = new Set(map);
  const flipped = range(N).filter((topic) => !marked.has(topic));
  return normalize([...flipped, ...map.filter((topic) => topic > N)]);
}

/** Topics `1..P`: the starting point that leaves the calculator's numbers unchanged. */
export function seed(P: number): TopicMap {
  return range(Math.max(0, P));
}

export function applyTopics(
  map: readonly number[],
  topics: readonly number[],
  mark: boolean,
): TopicMap {
  if (mark) return normalize([...map, ...topics]);
  const removed = new Set(topics);
  return map.filter((topic) => !removed.has(topic));
}

export function sameStudied(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((topic, index) => topic === b[index]);
}

export type RangeError = 'syntax' | 'reversed' | 'outOfRange';

export type RangeResult = { ok: true; topics: number[] } | { ok: false; error: RangeError };

/**
 * Reads "1-20, 35, 40-45" into topic numbers within `1..N`.
 * Ranges are checked against `N` before being expanded, so "1-999999999" is cheap to refuse.
 */
export function parseRanges(text: string, N: number): RangeResult {
  const parts = text
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part !== '');
  const topics: number[] = [];

  for (const part of parts) {
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/u.exec(part);
    if (!match) return { ok: false, error: 'syntax' };
    const from = Number(match[1]);
    const to = match[2] === undefined ? from : Number(match[2]);
    if (from < 1 || to < 1) return { ok: false, error: 'syntax' };
    if (to < from) return { ok: false, error: 'reversed' };
    if (to > N) return { ok: false, error: 'outOfRange' };
    for (let topic = from; topic <= to; topic++) topics.push(topic);
  }

  return { ok: true, topics: normalize(topics) };
}

export function serialize(map: readonly number[]): string {
  return JSON.stringify({ version: STORAGE_VERSION, map });
}

/** Tolerant of anything: `null` means "no usable saved map". */
export function deserialize(raw: string | null): TopicMap | null {
  if (raw === null) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return null;
    const { version, map } = data as { version?: unknown; map?: unknown };
    if (version !== STORAGE_VERSION || !Array.isArray(map)) return null;
    return normalize(map.filter((topic): topic is number => typeof topic === 'number'));
  } catch {
    return null;
  }
}
