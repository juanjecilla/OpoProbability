import { useId, useState } from 'react';

import { useI18n } from '../i18n/context';
import { formatPercent } from '../lib/format';
import { minPreparedFor, type Params } from '../lib/hypergeometric';

const TARGETS = [0.8, 0.9, 0.95, 0.99];

/** Whole percent shown in the custom box, e.g. `0.95` → `"95"`. */
function percentFromTarget(target: number): string {
  return String(Math.round(target * 100));
}

/** A custom target must be a whole percent strictly between 0 and 100. */
function parseCustomPercent(text: string): number | null {
  if (!/^\d{1,2}$/u.test(text)) return null;
  const value = Number(text);
  return value >= 1 && value <= 99 ? value : null;
}

interface InversePanelProps {
  params: Params | null;
  target: number;
  onTargetChange: (target: number) => void;
}

/**
 * The inverse question: not "how likely am I to pass" but "how many topics do
 * I have to prepare to sleep at night". The chosen target is also the dashed
 * line drawn across the chart above.
 */
export function InversePanel({ params, target, onTargetChange }: InversePanelProps) {
  const { t, intlLocale } = useI18n();
  const customInputId = useId();

  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState(() => percentFromTarget(target));
  const customValue = parseCustomPercent(customText);

  const needed = params ? minPreparedFor(params.N, params.k, params.discards, target) : null;

  return (
    <div className="inverse">
      <div className="inverse__header">
        <h3>{t('inverseTitle')}</h3>
        <div className="segmented" role="group" aria-label={t('inverseTargetLabel')}>
          {TARGETS.map((candidate) => (
            <button
              key={candidate}
              type="button"
              className="segmented__button"
              aria-pressed={!customMode && candidate === target}
              onClick={() => {
                setCustomMode(false);
                onTargetChange(candidate);
              }}
            >
              {formatPercent(candidate, intlLocale)}
            </button>
          ))}
          <button
            type="button"
            className="segmented__button"
            aria-pressed={customMode}
            onClick={() => {
              setCustomMode(true);
              setCustomText(percentFromTarget(target));
            }}
          >
            {t('inverseCustomOption')}
          </button>
        </div>
      </div>

      {customMode ? (
        <div className="inverse__custom">
          <label className="inverse__custom-label" htmlFor={customInputId}>
            {t('inverseCustomLabel')}
          </label>
          <div className="inverse__custom-control">
            <input
              id={customInputId}
              className="inverse__custom-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={customText}
              aria-invalid={customValue === null}
              onChange={(event) => {
                const next = event.target.value.replaceAll(/\D/gu, '').slice(0, 2);
                setCustomText(next);
                const parsed = parseCustomPercent(next);
                if (parsed !== null) onTargetChange(parsed / 100);
              }}
            />
            <span className="inverse__custom-suffix" aria-hidden="true">
              %
            </span>
          </div>
          {customValue === null ? (
            <p className="field__error" role="alert">
              <span aria-hidden="true">⚠</span>
              {t('inverseCustomInvalid')}
            </p>
          ) : null}
        </div>
      ) : null}

      {params === null ? null : needed === null ? (
        <p className="inverse__answer">{t('inverseImpossible')}</p>
      ) : (
        <>
          <p className="inverse__answer">{t('inverseAnswer', { needed, total: params.N })}</p>
          <p className="inverse__detail">
            {needed < params.N
              ? t('inverseSlack', { count: params.N - needed })
              : t('inverseSlackNone')}
          </p>
          <p className="inverse__detail">
            {params.prepared >= needed
              ? t('inverseAlreadyThere', { prepared: params.prepared })
              : t('inverseMissing', { count: needed - params.prepared })}
          </p>
        </>
      )}
    </div>
  );
}
