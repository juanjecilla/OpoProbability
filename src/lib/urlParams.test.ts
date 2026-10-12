import { describe, expect, it } from 'vitest';

import { fieldsFromSearch, searchFromFields } from './urlParams';

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
