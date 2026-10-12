import { useI18n } from '../../i18n/context';
import type { Tally as TallyData } from '../../lib/draw';
import { formatPercent } from '../../lib/format';

interface TallyProps {
  tally: TallyData;
  expected: number | null;
}

export function Tally({ tally, expected }: TallyProps) {
  const { t, intlLocale } = useI18n();
  const observed = tally.rounds === 0 ? null : tally.successes / tally.rounds;

  return (
    <dl className="tally">
      <div className="tally__item">
        <dt>{t('simTallyRounds')}</dt>
        <dd>{tally.rounds}</dd>
      </div>
      <div className="tally__item tally__item--success">
        <dt>{t('simTallySuccess')}</dt>
        <dd>{tally.successes}</dd>
      </div>
      <div className="tally__item tally__item--failure">
        <dt>{t('simTallyFailure')}</dt>
        <dd>{tally.failures}</dd>
      </div>
      <div className="tally__item tally__item--wipeout">
        <dt>{t('simTallyWipeout')}</dt>
        <dd>{tally.wipeouts}</dd>
      </div>
      <div className="tally__item">
        <dt>{t('simTallyObserved')}</dt>
        <dd>{observed === null ? '—' : formatPercent(observed, intlLocale)}</dd>
      </div>
      <div className="tally__item">
        <dt>{t('simTallyExpected')}</dt>
        <dd>{expected === null ? '—' : formatPercent(expected, intlLocale)}</dd>
      </div>
    </dl>
  );
}
