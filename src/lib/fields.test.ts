import { describe, expect, it } from 'vitest';

import {
  bump,
  DEFAULT_FIELDS,
  maximum,
  parseFields,
  sanitize,
  toRequired,
  type FieldInputs,
} from './fields';

const fields = (overrides: Partial<FieldInputs> = {}): FieldInputs => ({
  ...DEFAULT_FIELDS,
  ...overrides,
});

describe('parseFields', () => {
  it('converts the visible minimum into discards for the engine', () => {
    const { params, errors } = parseFields(fields());

    expect(params).toEqual({ N: 60, k: 4, discards: 2, prepared: 40 });
    expect(errors).toEqual({});
  });

  it('rejects anything that is not a whole number, per field', () => {
    const { params, errors } = parseFields(fields({ N: '', P: '4.5' }));

    expect(params).toBeNull();
    expect(errors).toEqual({ N: 'notAnInteger', P: 'notAnInteger' });
  });

  it('points syllabus and draw problems at their own boxes', () => {
    // An unusable syllabus drags the boxes measured against it down with it.
    expect(parseFields(fields({ N: '0' })).errors).toEqual({
      N: 'topicsTooFew',
      k: 'drawExceedsTopics',
      P: 'preparedExceedsTopics',
    });
    expect(parseFields(fields({ k: '80' })).errors).toEqual({ k: 'drawExceedsTopics' });
    expect(parseFields(fields({ P: '80' })).errors).toEqual({ P: 'preparedExceedsTopics' });
    expect(parseFields(fields({ P: '-1' })).errors).toEqual({ P: 'preparedNegative' });
  });

  it('reports a minimum above the draw on the minimum box', () => {
    // d = 5 with k = 4 means negative discards.
    expect(parseFields(fields({ d: '5' })).errors).toEqual({ d: 'discardsNegative' });
  });

  it('reports a minimum below one on the minimum box', () => {
    // d = 0 means discarding everything drawn: nothing left to develop.
    expect(parseFields(fields({ d: '0' })).errors).toEqual({ d: 'discardsExceedDraw' });
  });

  it('stays quiet about the minimum while the draw itself is unusable', () => {
    expect(parseFields(fields({ k: '0' })).errors).toEqual({ k: 'drawTooFew' });
  });

  it('accepts a draw with no discards at all', () => {
    const { params } = parseFields(fields({ k: '3', d: '3' }));
    expect(params).toEqual({ N: 60, k: 3, discards: 0, prepared: 40 });
  });
});

describe('maximum', () => {
  it('has no ceiling for N', () => {
    expect(maximum(fields(), 'N')).toBeNull();
  });

  it('bounds k and P by N', () => {
    expect(maximum(fields(), 'k')).toBe(60);
    expect(maximum(fields(), 'P')).toBe(60);
  });

  it('bounds d by k', () => {
    expect(maximum(fields(), 'd')).toBe(4);
  });

  it('is null when the bounding field is not a number yet', () => {
    expect(maximum(fields({ N: '' }), 'k')).toBeNull();
    expect(maximum(fields({ k: '' }), 'd')).toBeNull();
  });
});

describe('bump', () => {
  it('steps the field it is given and leaves the rest alone', () => {
    expect(bump(fields(), 'N', 1)).toEqual(fields({ N: '61' }));
    expect(bump(fields(), 'P', -1)).toEqual(fields({ P: '39' }));
  });

  it('stops at the floor of each field', () => {
    expect(bump(fields({ N: '1' }), 'N', -1).N).toBe('1');
    expect(bump(fields({ k: '1' }), 'k', -1).k).toBe('1');
    expect(bump(fields({ d: '1' }), 'd', -1).d).toBe('1');
    expect(bump(fields({ P: '0' }), 'P', -1).P).toBe('0');
  });

  it('does not clamp upwards: out of range is what the error message is for', () => {
    expect(bump(fields({ P: '60' }), 'P', 1).P).toBe('61');
  });

  it('treats an unparseable box as zero', () => {
    expect(bump(fields({ N: '' }), 'N', 1).N).toBe('1');
  });
});

describe('sanitize', () => {
  it('keeps digits and drops everything else', () => {
    expect(sanitize('6a0')).toBe('60');
    expect(sanitize('4,5')).toBe('45');
    expect(sanitize('')).toBe('');
  });
});

describe('toRequired', () => {
  it('is the draw minus the discards', () => {
    expect(toRequired({ N: 60, k: 4, discards: 2, prepared: 40 })).toBe(2);
  });
});
