import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useI18n, type MessageKey } from '../i18n/context';
import { formatPercent } from '../lib/format';
import { marginalGain, successProbability, type Params } from '../lib/hypergeometric';
import { riskLevel, type RiskLevel } from '../lib/risk';

const RISK_LABEL: Record<RiskLevel, MessageKey> = {
  veryHigh: 'riskVeryHigh',
  high: 'riskHigh',
  even: 'riskEven',
  low: 'riskLow',
  veryLow: 'riskVeryLow',
};

export function ResultPanel({ params }: { params: Params | null }) {
  const { t, intlLocale } = useI18n();

  const probability = params ? successProbability(params) : null;
  const shown = useAnimatedNumber(probability);

  const risk = probability === null ? null : riskLevel(probability);
  const gain = params ? marginalGain(params) : 0;

  return (
    <div className="verdict" data-risk={risk ?? 'none'}>
      <div className="verdict__figure">
        <span className="verdict__caption" aria-hidden="true">
          P(X ≥ d)
        </span>
        <p
          className="verdict__value"
          role="status"
          aria-live="polite"
          aria-label={
            probability === null || risk === null
              ? t('resultEmpty')
              : t('resultAria', {
                  risk: t(RISK_LABEL[risk]),
                  value: formatPercent(probability, intlLocale),
                })
          }
        >
          {shown === null ? '—' : formatPercent(shown, intlLocale)}
        </p>
      </div>

      <div className="verdict__reading">
        <div className="verdict__label">{t('resultLabel')}</div>

        <div className="meter" role="presentation">
          <div
            className="meter__fill"
            style={{ width: `${String(Math.max(1, (shown ?? 0) * 100))}%` }}
          />
        </div>

        <div className="verdict__notes">
          <span className="verdict__chip">
            {risk === null ? t('resultEmpty') : t(RISK_LABEL[risk])}
          </span>
          <p>{t('resultSub')}</p>
        </div>

        {params ? (
          <p className="verdict__gain">
            {gain > 0
              ? t('marginalGain', { gain: formatPercent(gain, intlLocale) })
              : t('marginalGainNone')}
          </p>
        ) : null}
      </div>
    </div>
  );
}
