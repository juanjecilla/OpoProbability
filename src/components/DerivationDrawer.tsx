import { useI18n } from '../i18n/context';
import { formatInteger, formatPercent, formatPrecisePercent } from '../lib/format';
import {
  derivationSteps,
  outcomeBreakdown,
  topicsToDevelop,
  type Params,
} from '../lib/hypergeometric';

/** The counted steps: total draws, then each term, then the answer. */
function WorkedSteps({ params }: { params: Params }) {
  const { t, intlLocale } = useI18n();

  const { total, terms, useComplement, result } = derivationSteps(params);
  const unprepared = params.N - params.prepared;

  return (
    <>
      <p className="working__intro">
        {useComplement ? t('workedIntroComplement') : t('workedIntroDirect')}
      </p>
      <p className="working__aside">{t('workedNotBinomial')}</p>

      <div className="steps">
        <div className="steps__row">
          <span>
            {t('workedTotal')} · C({params.N},{params.k})
          </span>
          <span className="steps__value">{formatInteger(total, intlLocale)}</span>
        </div>

        {terms.map((term) => (
          <div className="steps__row" key={term.i}>
            <span>
              {t('workedTerm', { i: term.i })} · C({params.prepared},{term.i})·C({unprepared},
              {params.k - term.i})
            </span>
            <span className="steps__value">
              {formatInteger(term.favorable, intlLocale)} (
              {formatPrecisePercent(term.probability, intlLocale)})
            </span>
          </div>
        ))}

        <div className="steps__row steps__row--result">
          <span>{t('workedResult')}</span>
          <span className="steps__value">{formatPrecisePercent(result, intlLocale)}</span>
        </div>
      </div>
    </>
  );
}

/** Every possible draw, from "none of mine came up" to "all of them did". */
function OutcomeTable({ params }: { params: Params }) {
  const { t, intlLocale } = useI18n();

  const required = topicsToDevelop(params);
  const rows = outcomeBreakdown(params.N, params.prepared, params.k);

  return (
    <div className="outcomes__scroll">
      <table className="outcomes">
        <thead>
          <tr>
            <th scope="col">{t('thOutcome')}</th>
            <th scope="col">{t('thWays')}</th>
            <th scope="col">{t('thExactly')}</th>
            <th scope="col">{t('thCumulative')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.i} data-success={row.i >= required}>
              <th scope="row">
                <span className="outcomes__dot" aria-hidden="true" />
                {row.i}
              </th>
              <td>{formatInteger(row.ways, intlLocale)}</td>
              <td className="outcomes__strong">{formatPercent(row.pmf, intlLocale)}</td>
              <td>{formatPercent(row.cumulative, intlLocale)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The second layer of the explanation: the full derivation with the user's own
 * numbers, folded away behind a `<details>` so the headline stays uncluttered.
 */
export function DerivationDrawer({ params }: { params: Params | null }) {
  const { t } = useI18n();

  return (
    <details className="working">
      <summary className="working__summary">
        <span>{t('workedTitle')}</span>
        <span className="working__marker" aria-hidden="true">
          ＋
        </span>
      </summary>

      {params === null ? (
        <p className="working__intro">—</p>
      ) : (
        <div className="working__body">
          <WorkedSteps params={params} />

          <h3 className="working__heading">{t('outcomeTitle')}</h3>
          <OutcomeTable params={params} />
          <p className="working__note">{t('outcomeNote')}</p>

          <h3 className="working__heading">{t('generalFormula')}</h3>
          <pre className="working__formula">
            <code>{'P(X ≥ d) = Σ  C(P, i) · C(N−P, k−i) / C(N, k)\n           i≥d'}</code>
          </pre>
        </div>
      )}
    </details>
  );
}
