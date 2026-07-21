import { useI18n } from '../i18n/context';
import { formatPercent } from '../lib/format';
import {
  marginalGain,
  successProbability,
  topicsToDevelop,
  type Params,
} from '../lib/hypergeometric';

/**
 * Bucketed reading of the probability, so the number comes with a verdict.
 * Also drives the accent colour of the panel.
 */
function toneFor(probability: number): 'high' | 'medium' | 'low' {
  if (probability >= 0.9) return 'high';
  if (probability >= 0.7) return 'medium';
  return 'low';
}

export function ResultPanel({ params }: { params: Params }) {
  const { t, intlLocale } = useI18n();

  const probability = successProbability(params);
  const gain = marginalGain(params);
  const develop = topicsToDevelop(params);
  const unprepared = params.N - params.prepared;

  return (
    <section className={`panel result result--${toneFor(probability)}`}>
      <h2>{t('resultTitle')}</h2>

      <p className="result__value" role="img" aria-label={t('resultAria')}>
        {formatPercent(probability, intlLocale)}
      </p>

      <ul className="result__facts">
        <li>{t('developSummary', { count: develop, drawn: params.k })}</li>
        <li>{t('unpreparedSummary', { count: unprepared })}</li>
        <li>
          {gain > 0
            ? t('marginalGain', { gain: formatPercent(gain, intlLocale) })
            : t('marginalGainNone')}
        </li>
      </ul>
    </section>
  );
}
