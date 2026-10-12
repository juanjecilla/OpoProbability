import { useCallback, useState } from 'react';

export type AnimationLevel = 'full' | 'light' | 'off';

export interface AnimationSettings {
  level: AnimationLevel;
  confetti: boolean;
  shake: boolean;
}

const STORAGE_KEY = 'opoprobability:animations';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function defaults(): AnimationSettings {
  return { level: prefersReducedMotion() ? 'off' : 'full', confetti: true, shake: true };
}

function read(): AnimationSettings {
  const base = defaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return base;
    const data = JSON.parse(raw) as Partial<AnimationSettings>;
    return {
      level:
        data.level === 'full' || data.level === 'light' || data.level === 'off'
          ? data.level
          : base.level,
      confetti: typeof data.confetti === 'boolean' ? data.confetti : base.confetti,
      shake: typeof data.shake === 'boolean' ? data.shake : base.shake,
    };
  } catch {
    return base;
  }
}

/**
 * How much the simulator may move. Until the user chooses, a system request
 * for reduced motion wins; once they choose, their choice is stored and kept.
 */
export function useAnimationSettings() {
  const [settings, setSettingsState] = useState<AnimationSettings>(read);

  const setSettings = useCallback((next: AnimationSettings) => {
    setSettingsState(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Not persisted; still applies for this visit.
    }
  }, []);

  return { settings, setSettings };
}
