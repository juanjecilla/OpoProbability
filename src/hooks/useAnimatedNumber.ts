import { useEffect, useRef, useState } from 'react';

const DURATION_MS = 480;

/** Ease-out cubic: fast off the mark, settling gently on the new figure. */
const ease = (t: number) => 1 - (1 - t) ** 3;

/**
 * Tweens towards `target` so the headline percentage counts up instead of
 * snapping. `null` (invalid input) is passed straight through, and so is the
 * first value: there is nothing to animate from on the first paint.
 *
 * Honours `prefers-reduced-motion`, which is the whole reason this is a hook
 * and not a CSS transition — you cannot transition a text node.
 */
export function useAnimatedNumber(target: number | null): number | null {
  const [value, setValue] = useState<number | null>(target);
  const current = useRef<number | null>(target);

  useEffect(() => {
    const from = current.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (target === null || from === null || reduced) {
      current.current = target;
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION_MS);
      const next = from + (target - from) * ease(progress);

      current.current = next;
      setValue(next);

      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return value;
}
