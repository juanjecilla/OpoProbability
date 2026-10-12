import { useCallback, useState } from 'react';

import {
  deleteSession,
  deserialize,
  serialize,
  upsertSession,
  type Session,
} from '../lib/sessions';

const STORAGE_KEY = 'opoprobability:sessions';

function read(): Session[] {
  try {
    return deserialize(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function write(sessions: Session[]) {
  try {
    localStorage.setItem(STORAGE_KEY, serialize(sessions));
  } catch {
    // Storage can be blocked or full; the history then lives for this visit only.
  }
}

/** Saved Sessions, newest first, mirrored to localStorage on every change. */
export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>(read);

  const update = useCallback((change: (current: Session[]) => Session[]) => {
    setSessions((current) => {
      const next = change(current);
      write(next);
      return next;
    });
  }, []);

  const save = useCallback(
    (session: Session) => {
      update((current) => upsertSession(current, session));
    },
    [update],
  );

  const remove = useCallback(
    (id: string) => {
      update((current) => deleteSession(current, id));
    },
    [update],
  );

  const clear = useCallback(() => {
    update(() => []);
  }, [update]);

  return { sessions, save, remove, clear };
}
