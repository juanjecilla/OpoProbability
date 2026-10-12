import { describe, expect, it } from 'vitest';

import type { Rng } from './draw';
import {
  MAX_ROUNDS,
  MAX_SESSIONS,
  deleteSession,
  canResume,
  deserialize,
  matchesCurrent,
  playRounds,
  sameConfig,
  serialize,
  startSession,
  upsertSession,
  type Session,
} from './sessions';

const params = { N: 20, k: 3, discards: 1, prepared: 10 };
const rng: Rng = (() => {
  let n = 0;
  return () => {
    n = (n + 0.137) % 1;
    return n;
  };
})();

function played(count: number, now = 1): Session {
  return playRounds(startSession(params, rng, now), count, rng);
}

describe('startSession / playRounds', () => {
  it('starts empty with a fixed studied set of size P', () => {
    const session = startSession(params, rng, 5);
    expect(session.rounds).toEqual([]);
    expect(session.studied).toHaveLength(10);
  });

  it('appends rounds with increasing ids', () => {
    const session = playRounds(played(2), 3, rng);
    expect(session.rounds.map((round) => round.id)).toEqual([1, 2, 3, 4, 5]);
    expect(session.rounds.every((round) => round.drawn.length === 3)).toBe(true);
  });

  it('drops the oldest rounds beyond the cap', () => {
    const session = playRounds(played(MAX_ROUNDS), 10, rng);
    expect(session.rounds).toHaveLength(MAX_ROUNDS);
    expect(session.rounds[0]?.id).toBe(11);
    expect(session.nextRoundId).toBe(MAX_ROUNDS + 11);
  });
});

describe('upsertSession / deleteSession', () => {
  it('puts the newest first and replaces by id', () => {
    const a = played(1, 1);
    const b = played(1, 2);
    const list = upsertSession(upsertSession([], a), b);
    expect(list.map((s) => s.id)).toEqual([b.id, a.id]);
    expect(upsertSession(list, playRounds(a, 1, rng))[0]?.rounds).toHaveLength(2);
  });

  it('ignores sessions with no rounds', () => {
    expect(upsertSession([], startSession(params, rng, 1))).toEqual([]);
  });

  it('caps the number of sessions', () => {
    let list: Session[] = [];
    for (let i = 0; i < MAX_SESSIONS + 5; i++) list = upsertSession(list, played(1, i));
    expect(list).toHaveLength(MAX_SESSIONS);
  });

  it('deletes by id', () => {
    const a = played(1, 1);
    expect(deleteSession([a], a.id)).toEqual([]);
  });
});

describe('sameConfig', () => {
  it('compares every field', () => {
    expect(sameConfig(params, { ...params })).toBe(true);
    expect(sameConfig(params, { ...params, prepared: 11 })).toBe(false);
  });
});

describe('serialize / deserialize', () => {
  it('round-trips', () => {
    const list = [played(3)];
    expect(deserialize(serialize(list))).toEqual(list);
  });

  it.each([
    ['null', null],
    ['not json', '{nope'],
    ['wrong version', '{"version":99,"sessions":[]}'],
    ['not an object', '3'],
    ['sessions not array', '{"version":1,"sessions":3}'],
  ])('returns [] for %s', (_label, raw) => {
    expect(deserialize(raw)).toEqual([]);
  });

  it('drops malformed sessions but keeps valid ones', () => {
    const good = played(1);
    const raw = JSON.stringify({ version: 1, sessions: [{ id: 1 }, good] });
    expect(deserialize(raw)).toEqual([good]);
  });

  it('rejects rounds with an unknown outcome', () => {
    const bad = { ...played(1), rounds: [{ id: 1, drawn: [1], outcome: 'draw' }] };
    expect(deserialize(JSON.stringify({ version: 1, sessions: [bad] }))).toEqual([]);
  });
});

describe('Studied source', () => {
  it('tags a random Session and picks P topics', () => {
    const session = startSession(params, rng, 1);
    expect(session.source).toBe('random');
    expect(session.studied).toHaveLength(10);
  });

  it('uses the given Topic map as-is and tags it', () => {
    const session = startSession(params, rng, 1, [2, 4, 6]);
    expect(session.source).toBe('map');
    expect(session.studied).toEqual([2, 4, 6]);
  });

  it('reads Sessions saved before sources existed as random', () => {
    const { source: _source, ...legacy } = startSession(params, rng, 1);
    const raw = JSON.stringify({
      version: 1,
      sessions: [{ ...legacy, rounds: [{ id: 1, drawn: [1, 2, 3], outcome: 'success' }] }],
    });
    expect(deserialize(raw)[0]?.source).toBe('random');
  });
});

describe('matchesCurrent', () => {
  const map = [1, 2, 3, 99];
  const mapParams = { ...params, prepared: 3 };
  const mapSession = startSession(mapParams, rng, 1, [1, 2, 3]);

  it('matches a Topic-map Session while the map (clipped to N) is unchanged', () => {
    expect(matchesCurrent(mapSession, mapParams, 'map', map)).toBe(true);
  });

  it('rejects an edited map', () => {
    expect(matchesCurrent(mapSession, mapParams, 'map', [1, 2, 4])).toBe(false);
  });

  it('rejects a source switch even with identical numbers', () => {
    const random = startSession(params, rng, 1);
    expect(matchesCurrent(random, params, 'map', map)).toBe(false);
    expect(matchesCurrent(mapSession, mapParams, 'random', map)).toBe(false);
    expect(matchesCurrent(random, params, 'random', map)).toBe(true);
  });
});

describe('canResume', () => {
  it('always allows a random Session', () => {
    expect(canResume(startSession(params, rng, 1), [])).toBe(true);
  });

  it('allows a Topic-map Session only while the map still agrees', () => {
    const session = startSession(params, rng, 1, [1, 2]);
    expect(canResume(session, [1, 2, 99])).toBe(true);
    expect(canResume(session, [1, 3])).toBe(false);
  });
});
