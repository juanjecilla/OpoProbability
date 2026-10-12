import { describe, expect, it } from 'vitest';

import {
  applyTopics,
  deserialize,
  invert,
  markAll,
  markNone,
  normalize,
  parseRanges,
  sameStudied,
  seed,
  serialize,
  studiedWithin,
  toggle,
  withMapP,
} from './topicMap';

describe('normalize', () => {
  it('sorts, dedupes and drops non-positive or non-integer values', () => {
    expect(normalize([5, 1, 5, 0, -2, 2.5, 3])).toEqual([1, 3, 5]);
  });
});

describe('studiedWithin', () => {
  it('clips to the syllabus without touching the stored map', () => {
    const map = [1, 5, 60, 70];
    expect(studiedWithin(map, 60)).toEqual([1, 5, 60]);
    expect(map).toEqual([1, 5, 60, 70]);
  });
});

describe('toggle', () => {
  it('adds a missing topic and removes a present one', () => {
    expect(toggle([1, 3], 2)).toEqual([1, 2, 3]);
    expect(toggle([1, 2, 3], 2)).toEqual([1, 3]);
  });
});

describe('bulk operations', () => {
  it('markAll marks 1..N and keeps marks beyond N', () => {
    expect(markAll([70], 3)).toEqual([1, 2, 3, 70]);
  });

  it('markNone clears 1..N and keeps marks beyond N', () => {
    expect(markNone([1, 2, 70], 3)).toEqual([70]);
  });

  it('invert flips 1..N and keeps marks beyond N', () => {
    expect(invert([1, 3, 70], 4)).toEqual([2, 4, 70]);
  });
});

describe('seed', () => {
  it('marks topics 1..P', () => {
    expect(seed(3)).toEqual([1, 2, 3]);
    expect(seed(0)).toEqual([]);
  });
});

describe('parseRanges', () => {
  it('reads singles and ranges', () => {
    expect(parseRanges('1-3, 7,9-10', 20)).toEqual({ ok: true, topics: [1, 2, 3, 7, 9, 10] });
  });

  it('treats an empty box as nothing to apply', () => {
    expect(parseRanges('  ', 20)).toEqual({ ok: true, topics: [] });
  });

  it('flags garbage, zero and reversed ranges', () => {
    expect(parseRanges('a', 20)).toEqual({ ok: false, error: 'syntax' });
    expect(parseRanges('1-', 20)).toEqual({ ok: false, error: 'syntax' });
    expect(parseRanges('0', 20)).toEqual({ ok: false, error: 'syntax' });
    expect(parseRanges('5-3', 20)).toEqual({ ok: false, error: 'reversed' });
  });

  it('flags topics beyond N without expanding huge ranges', () => {
    expect(parseRanges('18-21', 20)).toEqual({ ok: false, error: 'outOfRange' });
    expect(parseRanges('1-999999999999', 20)).toEqual({ ok: false, error: 'outOfRange' });
  });
});

describe('applyTopics', () => {
  it('marks or unmarks the given topics', () => {
    expect(applyTopics([1], [2, 3], true)).toEqual([1, 2, 3]);
    expect(applyTopics([1, 2, 3], [2, 9], false)).toEqual([1, 3]);
  });
});

describe('sameStudied', () => {
  it('compares as sets of topics', () => {
    expect(sameStudied([1, 2], [1, 2])).toBe(true);
    expect(sameStudied([1, 2], [1, 3])).toBe(false);
    expect(sameStudied([1], [1, 2])).toBe(false);
  });
});

describe('serialize / deserialize', () => {
  it('round-trips', () => {
    expect(deserialize(serialize([1, 4, 9]))).toEqual([1, 4, 9]);
  });

  it('yields null (no saved map) for anything unusable', () => {
    expect(deserialize(null)).toBeNull();
    expect(deserialize('nope')).toBeNull();
    expect(deserialize('{"version":99,"map":[1]}')).toBeNull();
    expect(deserialize('{"version":1,"map":"x"}')).toBeNull();
  });

  it('normalises what it reads', () => {
    expect(deserialize('{"version":1,"map":[3,1,1,"a"]}')).toEqual([1, 3]);
  });
});

describe('withMapP', () => {
  const inputs = { N: '10', k: '3', P: '99', d: '1' };

  it('replaces P with the marked count within N', () => {
    expect(withMapP(inputs, [1, 2, 11]).P).toBe('2');
  });

  it('leaves inputs alone while N is not a number', () => {
    const half = { ...inputs, N: '' };
    expect(withMapP(half, [1, 2])).toBe(half);
  });
});
