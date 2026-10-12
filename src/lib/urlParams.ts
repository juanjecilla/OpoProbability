/**
 * Carries the exam configuration between the calculator and the simulator in
 * the URL, so a link or the back button keeps the numbers.
 */

import { type FieldInputs, type FieldName } from './fields.js';

const NAMES: readonly FieldName[] = ['N', 'k', 'P', 'd'];

/**
 * Reads `?N=&k=&P=&d=`. Returns `null` unless all four are present, so a bare
 * URL falls back to the defaults instead of a half-filled form. Values are
 * passed through unvalidated: `parseFields` reports what is wrong with them.
 */
export function fieldsFromSearch(search: string): FieldInputs | null {
  const query = new URLSearchParams(search);
  const values = NAMES.map((name) => query.get(name));
  if (values.some((value) => value === null || !/^-?\d{1,9}$/u.test(value))) return null;

  const [N, k, P, d] = values as [string, string, string, string];
  return { N, k, P, d };
}

export function searchFromFields(inputs: FieldInputs): string {
  const query = new URLSearchParams();
  for (const name of NAMES) query.set(name, inputs[name]);
  return `?${query.toString()}`;
}
