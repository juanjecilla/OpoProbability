import { useI18n } from '../i18n/context';
import { formatPercent } from '../lib/format';
import { successProbability, type Params } from '../lib/hypergeometric';
import { riskLevel } from '../lib/risk';

/**
 * Where to sample the syllabus. Fractions rather than fixed counts so the
 * table reads the same on a 25-topic call as on a 110-topic one.
 */
const FRACTIONS = [1 / 3, 1 / 2, 2 / 3, 3 / 4, 5 / 6, 11 / 12, 1];

/** The same curve as the chart, read as numbers, with your row highlighted. */
export function OddsTable({ params }: { params: Params | null }) {
  const { t, intlLocale } = useI18n();

  if (!params) return null;

  const { N, prepared } = params;
  const sampled = new Set([
    ...FRACTIONS.map((fraction) => Math.max(1, Math.round(fraction * N))),
    prepared,
  ]);

  const rows = [...sampled]
    .filter((value) => value >= 0 && value <= N)
    .toSorted((a, b) => a - b)
    .map((value) => {
      const probability = successProbability({ ...params, prepared: value });
      return { value, probability, risk: riskLevel(probability) };
    });

  return (
    <table className="odds">
      <thead>
        <tr>
          <th scope="col">{t('thStudied')}</th>
          <th scope="col">{t('thProbability')}</th>
          <th scope="col">
            <span className="visually-hidden">{t('chartTitle')}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.value} data-current={row.value === prepared} data-risk={row.risk}>
            <td className="odds__count">
              {row.value}
              <span className="odds__total"> / {N}</span>
            </td>
            <td className="odds__probability">{formatPercent(row.probability, intlLocale)}</td>
            <td className="odds__bar-cell">
              <div className="odds__bar">
                <div
                  className="odds__bar-fill"
                  style={{ width: `${String(Math.max(1, row.probability * 100))}%` }}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
