import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

import { prefersReducedMotion } from '../hooks/useAnimationSettings';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useI18n, type MessageKey } from '../i18n/context';
import type { StudiedSource } from '../lib/sessions';
import {
  applyTopics,
  invert,
  markAll,
  markNone,
  MAX_CHIPS,
  parseRanges,
  studiedWithin,
  toggle,
  type RangeError,
  type TopicMap,
} from '../lib/topicMap';

interface TopicsPanelProps {
  /** The Syllabus size; `null` while the field is not a valid number. */
  N: number | null;
  /** The typed `P`, shown while topics are picked at random. */
  randomCount: number | null;
  source: StudiedSource;
  map: TopicMap;
  /** True until the candidate edits the map the first switch seeded. */
  seeded: boolean;
  /** Topics to pulse after a simulated Draw. */
  highlight?: readonly number[] | undefined;
  onSource: (source: StudiedSource) => void;
  onMap: (map: TopicMap) => void;
}

const RANGE_ERRORS: Record<RangeError, MessageKey> = {
  syntax: 'topicsRangeSyntax',
  reversed: 'topicsRangeReversed',
  outOfRange: 'topicsRangeOut',
};

/** A short squash-and-settle on one chip; skipped when the user asks for less motion. */
function pop(element: Element, delay = 0) {
  if (prefersReducedMotion()) return;
  element.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(0.8)', offset: 0.35 },
      { transform: 'scale(1.12)', offset: 0.7 },
      { transform: 'scale(1)' },
    ],
    { duration: 260, delay, easing: 'ease-out' },
  );
}

/**
 * Where the Studied topics come from, and, for the Topic map, which they are.
 * Shared by the calculator and the simulator so both read and write one map.
 */
export function TopicsPanel({
  N,
  randomCount,
  source,
  map,
  seeded,
  highlight,
  onSource,
  onMap,
}: TopicsPanelProps) {
  const { t } = useI18n();
  const name = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(1);
  const [range, setRange] = useState('');
  const [rangeError, setRangeError] = useState<RangeError | null>(null);

  const studied = N === null ? [] : studiedWithin(map, N);
  const marked = new Set(studied);
  const shown = useAnimatedNumber(studied.length);
  const tabStop = Math.min(active, N ?? 1);
  const showGrid = source === 'map' && N !== null && N <= MAX_CHIPS;

  const chipFor = (topic: number) =>
    gridRef.current?.querySelector<HTMLElement>(`[data-topic="${String(topic)}"]`) ?? null;

  useEffect(() => {
    if (!highlight?.length || prefersReducedMotion()) return;
    for (const topic of highlight) {
      chipFor(topic)?.animate(
        [{ boxShadow: '0 0 0 0 var(--ring)' }, { boxShadow: '0 0 0 8px transparent' }],
        { duration: 700, easing: 'ease-out' },
      );
    }
  }, [highlight]);

  /** Pops every chip whose state differs between two maps, in a short wave. */
  const wave = (before: TopicMap, after: TopicMap) => {
    if (N === null || !showGrid) return;
    const was = new Set(before);
    const now = new Set(after);
    let index = 0;
    for (let topic = 1; topic <= N; topic++) {
      if (was.has(topic) === now.has(topic)) continue;
      const chip = chipFor(topic);
      if (chip) pop(chip, Math.min(index * 5, 300));
      index++;
    }
  };

  const edit = (next: TopicMap) => {
    wave(map, next);
    onMap(next);
  };

  const focusTopic = (topic: number) => {
    if (N === null) return;
    const clamped = Math.min(N, Math.max(1, topic));
    setActive(clamped);
    chipFor(clamped)?.focus();
  };

  const columns = () => {
    const chips = gridRef.current?.querySelectorAll<HTMLElement>('[data-topic]');
    const first = chips?.[0];
    if (!chips || !first) return 1;
    let count = 0;
    for (const chip of chips) {
      if (chip.offsetTop !== first.offsetTop) break;
      count++;
    }
    return Math.max(1, count);
  };

  const onGridKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (N === null) return;
    const step: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: columns(),
      ArrowUp: -columns(),
    };
    const delta = step[event.key];
    if (delta !== undefined) {
      event.preventDefault();
      focusTopic(active + delta);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusTopic(1);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusTopic(N);
    }
  };

  const applyRange = (mark: boolean) => {
    if (N === null) return;
    const result = parseRanges(range, N);
    if (!result.ok || result.topics.length === 0) {
      setRangeError(result.ok ? 'syntax' : result.error);
      return;
    }
    setRangeError(null);
    setRange('');
    edit(applyTopics(map, result.topics, mark));
  };

  const summary =
    source === 'map' && N !== null
      ? t('topicsSummaryMap', { P: studied.length, N })
      : t('topicsSummaryRandom');

  const errorId = `${name}-range-error`;

  return (
    <details className="topics">
      <summary className="topics__summary">
        <span className="topics__title">{t('topicsTitle')}</span>
        <span className="topics__state">{summary}</span>
      </summary>

      <div className="topics__body">
        <fieldset className="seg" data-value={source}>
          <legend className="visually-hidden">{t('topicsSourceLabel')}</legend>
          <span className="seg__thumb" aria-hidden="true" />
          {(['random', 'map'] as const).map((value) => (
            <label key={value} className="seg__option">
              <input
                className="seg__input visually-hidden"
                type="radio"
                name={name}
                value={value}
                checked={source === value}
                onChange={() => {
                  onSource(value);
                }}
              />
              <span className="seg__label">
                {t(value === 'random' ? 'topicsSourceRandom' : 'topicsSourceMap')}
              </span>
            </label>
          ))}
        </fieldset>

        {source === 'random' ? (
          <p className="topics__note">
            {randomCount === null
              ? t('topicsRandomNoteUnknown')
              : t('topicsRandomNote', { P: randomCount })}
          </p>
        ) : N === null ? (
          <p className="topics__note">{t('topicsNeedN')}</p>
        ) : (
          <>
            {seeded ? (
              <p className="topics__note">{t('topicsSeedHint', { P: studied.length })}</p>
            ) : null}

            <p className="topics__counter">
              <span aria-hidden="true">
                P = <strong>{Math.round(shown ?? studied.length)}</strong> / {N}
              </span>
              <span className="visually-hidden" role="status">
                {t('topicsCounterAria', { P: studied.length, N })}
              </span>
            </p>

            <div className="topics__bulk">
              <button
                type="button"
                className="button button--quiet"
                onClick={() => {
                  edit(markAll(map, N));
                }}
              >
                {t('topicsAll')}
              </button>
              <button
                type="button"
                className="button button--quiet"
                onClick={() => {
                  edit(markNone(map, N));
                }}
              >
                {t('topicsNone')}
              </button>
              <button
                type="button"
                className="button button--quiet"
                onClick={() => {
                  edit(invert(map, N));
                }}
              >
                {t('topicsInvert')}
              </button>
            </div>

            <form
              className="topics__range"
              onSubmit={(event) => {
                event.preventDefault();
                applyRange(true);
              }}
            >
              <label className="topics__range-label" htmlFor={`${name}-range`}>
                {t('topicsRangeLabel')}
              </label>
              <div className="topics__range-row">
                <input
                  id={`${name}-range`}
                  className="field__input topics__range-input"
                  type="text"
                  autoComplete="off"
                  placeholder={t('topicsRangeHint')}
                  value={range}
                  aria-invalid={rangeError !== null}
                  aria-describedby={rangeError ? errorId : undefined}
                  onChange={(event) => {
                    setRange(event.target.value);
                    setRangeError(null);
                  }}
                />
                <button type="submit" className="button button--primary">
                  {t('topicsRangeMark')}
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    applyRange(false);
                  }}
                >
                  {t('topicsRangeUnmark')}
                </button>
              </div>
              {rangeError ? (
                <p className="field__error" id={errorId} role="alert">
                  <span aria-hidden="true">⚠</span>
                  {t(RANGE_ERRORS[rangeError], { N })}
                </p>
              ) : null}
            </form>

            {showGrid ? (
              <div
                ref={gridRef}
                className="topics__grid"
                role="group"
                aria-label={t('topicsGridLabel')}
                onKeyDown={onGridKey}
              >
                {Array.from({ length: N }, (_, index) => index + 1).map((topic) => {
                  const on = marked.has(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      className={`topic-chip ${on ? 'topic-chip--studied' : 'topic-chip--unstudied'}`}
                      data-topic={topic}
                      aria-pressed={on}
                      aria-label={t('topicChipAria', { n: topic })}
                      tabIndex={topic === tabStop ? 0 : -1}
                      onFocus={() => {
                        setActive(topic);
                      }}
                      onClick={(event) => {
                        pop(event.currentTarget);
                        onMap(toggle(map, topic));
                      }}
                    >
                      <span aria-hidden="true">{topic}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="topics__note">{t('topicsTooMany', { max: MAX_CHIPS })}</p>
            )}
          </>
        )}
      </div>
    </details>
  );
}
