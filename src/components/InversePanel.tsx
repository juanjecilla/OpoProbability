import { useI18n } from '../i18n/context';
import { formatPercent } from '../lib/format';
import { minPreparedFor, type Params } from '../lib/hypergeometric';

const TARGETS = [0.8, 0.9, 0.95, 0.99];

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
              aria-pressed={candidate === target}
              onClick={() => {
                onTargetChange(candidate);
              }}
            >
              {formatPercent(candidate, intlLocale)}
            </button>
          ))}
        </div>
      </div>

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
