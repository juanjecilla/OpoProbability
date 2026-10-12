import { useCallback, useState } from 'react';

import type { StudiedSource } from '../lib/sessions';
import { deserialize, seed, serialize, type TopicMap } from '../lib/topicMap';

const MAP_KEY = 'opoprobability:topics';
const SOURCE_KEY = 'opoprobability:studied-source';

function readMap(): TopicMap | null {
  try {
    return deserialize(localStorage.getItem(MAP_KEY));
  } catch {
    return null;
  }
}

function readSource(): StudiedSource {
  try {
    return localStorage.getItem(SOURCE_KEY) === 'map' ? 'map' : 'random';
  } catch {
    return 'random';
  }
}

function persist(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked or full; the choice then lives for this visit only.
  }
}

/**
 * The Studied source and the Topic map, mirrored to localStorage.
 *
 * The first switch to the Topic map seeds it from the current `P` (topics
 * 1..P) so the numbers do not jump; `seeded` stays true until the candidate
 * edits it, so the panel can say where those marks came from.
 */
export function useTopicMap() {
  const [source, setSourceState] = useState<StudiedSource>(readSource);
  const [saved, setSaved] = useState<TopicMap | null>(readMap);
  const [seeded, setSeeded] = useState(false);

  const setMap = useCallback((next: TopicMap) => {
    setSaved(next);
    setSeeded(false);
    persist(MAP_KEY, serialize(next));
  }, []);

  const chooseSource = useCallback(
    (next: StudiedSource, currentP: number) => {
      setSourceState(next);
      persist(SOURCE_KEY, next);
      if (next === 'map' && saved === null) {
        const initial = seed(currentP);
        setSaved(initial);
        setSeeded(true);
        persist(MAP_KEY, serialize(initial));
      }
    },
    [saved],
  );

  return { source, map: saved ?? [], seeded, chooseSource, setMap };
}
