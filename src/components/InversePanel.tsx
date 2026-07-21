import { useI18n } from '../i18n/context';
import { formatPercent } from '../lib/format';
import { minPreparedFor, type Params } from '../lib/hypergeometric';

const TARGETS = [0.8, 0.9, 0.95, 0.99];

interface InversePanelProps {
  params: Params;
  target: number;
  onTargetChange: (target: number) => void;
}

/**
 * The inverse question: not "how likely am I to pass" but "how many topics do
 * I have to prepare to sleep at night".
 */
export function InversePanel({ params, target, onTargetChange }: InversePanelProps) {
  const { t, intlLocale } = useI18n();

  const needed = minPreparedFor(params.N, params.k, params.discards, target);

  return (
    <section className="panel">
      <h2>{t('inverseTitle')}</h2>

      <div className="targets" role="group" aria-label={t('inverseTargetLabel')}>
        {TARGETS.map((candidate) => (
          <button
            key={candidate}
            type="button"
            className="targets__button"
            aria-pressed={candidate === target}
            onClick={() => {
              onTargetChange(candidate);
            }}
          >
            {formatPercent(candidate, intlLocale)}
          </button>
        ))}
      </div>

      {needed === null ? (
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
    </section>
  );
}
