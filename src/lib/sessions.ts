/**
 * Simulator history: Sessions of Rounds, capped and serialisable.
 *
 * Everything here is pure. Reading and writing `localStorage` lives in the
 * `useSessions` hook so this module stays testable without a browser.
 */

import { classifyRound, drawRound, pickStudiedSet, type Outcome, type Rng } from './draw.js';
import type { Params } from './hypergeometric.js';

export const MAX_SESSIONS = 20;
export const MAX_ROUNDS = 500;
export const STORAGE_VERSION = 1;

export interface Round {
  id: number;
  drawn: number[];
  outcome: Outcome;
}

export interface Session {
  id: string;
  createdAt: number;
  params: Params;
  /** Topic numbers the candidate studied, fixed for the whole Session. */
  studied: number[];
  rounds: Round[];
  /** Id for the next Round; keeps ids unique even after old Rounds are dropped. */
  nextRoundId: number;
}

export function startSession(params: Params, rng: Rng, now: number): Session {
  return {
    id: `${String(now)}-${Math.floor(rng() * 1e9).toString(36)}`,
    createdAt: now,
    params,
    studied: pickStudiedSet(params.N, params.prepared, rng),
    rounds: [],
    nextRoundId: 1,
  };
}

/** Draws `count` Rounds and appends them, dropping the oldest beyond the cap. */
export function playRounds(session: Session, count: number, rng: Rng): Session {
  const { N, k, discards } = session.params;
  const minimum = k - discards;
  const studied = new Set(session.studied);

  const added: Round[] = Array.from({ length: count }, (_, index) => {
    const drawn = drawRound(N, k, rng);
    return {
      id: session.nextRoundId + index,
      drawn,
      outcome: classifyRound(drawn, studied, minimum),
    };
  });

  return {
    ...session,
    rounds: [...session.rounds, ...added].slice(-MAX_ROUNDS),
    nextRoundId: session.nextRoundId + count,
  };
}

/** Newest first, capped. A Session with no Rounds is not worth keeping. */
export function upsertSession(sessions: readonly Session[], session: Session): Session[] {
  const others = sessions.filter((candidate) => candidate.id !== session.id);
  if (session.rounds.length === 0) return others;
  return [session, ...others].slice(0, MAX_SESSIONS);
}

export function deleteSession(sessions: readonly Session[], id: string): Session[] {
  return sessions.filter((session) => session.id !== id);
}

export function sameConfig(a: Params, b: Params): boolean {
  return a.N === b.N && a.k === b.k && a.discards === b.discards && a.prepared === b.prepared;
}

export function serialize(sessions: readonly Session[]): string {
  return JSON.stringify({ version: STORAGE_VERSION, sessions });
}

const OUTCOMES = new Set(['success', 'failure', 'wipeout']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'number');
}

function isRound(value: unknown): value is Round {
  return (
    isRecord(value) &&
    typeof value.id === 'number' &&
    isNumberArray(value.drawn) &&
    typeof value.outcome === 'string' &&
    OUTCOMES.has(value.outcome)
  );
}

function isParams(value: unknown): value is Params {
  return (
    isRecord(value) &&
    typeof value.N === 'number' &&
    typeof value.k === 'number' &&
    typeof value.discards === 'number' &&
    typeof value.prepared === 'number'
  );
}

function isSession(value: unknown): value is Session {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.createdAt === 'number' &&
    typeof value.nextRoundId === 'number' &&
    isParams(value.params) &&
    isNumberArray(value.studied) &&
    Array.isArray(value.rounds) &&
    value.rounds.every(isRound)
  );
}

/** Tolerant of anything: corrupt, foreign or outdated storage yields `[]`. */
export function deserialize(raw: string | null): Session[] {
  if (raw === null) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data) || data.version !== STORAGE_VERSION || !Array.isArray(data.sessions)) {
      return [];
    }
    return data.sessions.filter(isSession).slice(0, MAX_SESSIONS);
  } catch {
    return [];
  }
}
