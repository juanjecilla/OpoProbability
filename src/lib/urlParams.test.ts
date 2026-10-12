import { describe, expect, it } from 'vitest';

import { fieldsFromSearch, runFromSearch, searchFromFields, searchWithRun } from './urlParams';

describe('urlParams', () => {
  it('round-trips the four fields', () => {
    const inputs = { N: '60', k: '4', P: '40', d: '2' };
    expect(fieldsFromSearch(searchFromFields(inputs))).toEqual(inputs);
  });

  it('returns null when a field is missing', () => {
    expect(fieldsFromSearch('?N=60&k=4&P=40')).toBeNull();
    expect(fieldsFromSearch('')).toBeNull();
  });

  it('returns null when a field is not an integer', () => {
    expect(fieldsFromSearch('?N=60&k=4&P=abc&d=2')).toBeNull();
  });
});

describe('run request', () => {
  const inputs = { N: '60', k: '4', P: '40', d: '2' };

  it('round-trips through a link', () => {
    const search = searchWithRun(inputs, 100);
    expect(runFromSearch(search)).toBe(100);
    expect(fieldsFromSearch(search)).toEqual(inputs);
  });

  it('ignores missing, unknown or malformed sizes', () => {
    expect(runFromSearch('?N=60')).toBeNull();
    expect(runFromSearch('?run=5')).toBeNull();
    expect(runFromSearch('?run=abc')).toBeNull();
    expect(runFromSearch('?run=100000')).toBeNull();
  });
});
