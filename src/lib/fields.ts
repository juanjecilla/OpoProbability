/**
 * The bridge between what the user types and what the engine consumes.
 *
 * Fields are held as strings so a half-typed value ("", "6") is representable:
 * the UI never rewrites what you are typing, it just refuses to compute and
 * points at the offending box. That is why nothing here clamps.
 *
 * The visible fourth field is `d`, the minimum number of drawn topics you must
 * develop, because that is how a candidate reads the official call. The engine
 * speaks in discards, so the two are converted here: `discards = k - d`.
 */

import { validate, type Params, type ValidationIssue } from './hypergeometric';

export interface FieldInputs {
  N: string;
  k: string;
  P: string;
  d: string;
}

export type FieldName = keyof FieldInputs;

/** Field-level problems: the engine's codes plus "that is not a number". */
export type FieldIssue = ValidationIssue | 'notAnInteger';

export interface ParsedFields {
  /** Non-null only when every field is valid. */
  params: Params | null;
  errors: Partial<Record<FieldName, FieldIssue>>;
}

/** The case that motivated the app: 60 topics, 4 drawn, 2 of them required. */
export const DEFAULT_FIELDS: FieldInputs = { N: '60', k: '4', P: '40', d: '2' };

/** Lowest value the ± buttons will go to. `P` is the only one that may be 0. */
const MINIMUM: Record<FieldName, number> = { N: 1, k: 1, P: 0, d: 1 };

/** Which field an engine validation issue belongs to. */
const ISSUE_FIELD: Record<ValidationIssue, FieldName> = {
  topicsTooFew: 'N',
  drawTooFew: 'k',
  drawExceedsTopics: 'k',
  discardsNegative: 'd',
  discardsExceedDraw: 'd',
  preparedNegative: 'P',
  preparedExceedsTopics: 'P',
};

/** Keeps typing free but drops anything that could never be part of a count. */
export function sanitize(value: string): string {
  return value.replaceAll(/[^\d-]/gu, '');
}

function toInteger(value: string): number | null {
  const trimmed = value.trim();
  // The pattern has already ruled out anything Number() would mangle.
  return /^-?\d+$/u.test(trimmed) ? Number(trimmed) : null;
}

/**
 * Parses the four boxes and reports what is wrong with which one.
 *
 * `d` is validated through the engine: `discards = k - d`, so "d above k"
 * surfaces as `discardsNegative` and "d below 1" as `discardsExceedDraw`.
 * Both belong to the `d` box, which is what the mapping above says.
 */
export function parseFields(inputs: FieldInputs): ParsedFields {
  const errors: Partial<Record<FieldName, FieldIssue>> = {};

  const N = toInteger(inputs.N);
  const k = toInteger(inputs.k);
  const P = toInteger(inputs.P);
  const d = toInteger(inputs.d);

  if (N === null) errors.N = 'notAnInteger';
  if (k === null) errors.k = 'notAnInteger';
  if (P === null) errors.P = 'notAnInteger';
  if (d === null) errors.d = 'notAnInteger';

  if (N === null || k === null || P === null || d === null) return { params: null, errors };

  const params: Params = { N, k, discards: k - d, prepared: P };

  const issues = validate(params);
  // `d` is only meaningful once `k` is: with an unusable draw every value of
  // `d` is out of range, and flagging both boxes would just add noise.
  const drawIsBroken = issues.some((issue) => ISSUE_FIELD[issue] === 'k');

  for (const issue of issues) {
    const field = ISSUE_FIELD[issue];
    if (field === 'd' && drawIsBroken) continue;
    // First issue per field wins: it is the one that reads most specifically.
    errors[field] ??= issue;
  }

  const isValid = Object.keys(errors).length === 0;
  return { params: isValid ? params : null, errors };
}

/** Steps a field by `delta`, refusing to go below its floor. */
export function bump(inputs: FieldInputs, field: FieldName, delta: number): FieldInputs {
  const current = toInteger(inputs[field]) ?? 0;
  const next = Math.max(MINIMUM[field], current + delta);
  return { ...inputs, [field]: String(next) };
}

/** Minimum topics to develop, i.e. the `d` the user sees. */
export function toRequired(params: Params): number {
  return params.k - params.discards;
}
