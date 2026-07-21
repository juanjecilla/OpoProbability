import { useI18n } from '../i18n/context';
import { formatInteger, formatPrecisePercent } from '../lib/format';
import { derivationSteps, type CombinationFactor, type Params } from '../lib/hypergeometric';

/** Renders C(n, k) in the usual stacked notation. */
function Binomial({ factor }: { factor: CombinationFactor }) {
  return (
    <span className="binomial" aria-label={`C(${factor.n}, ${factor.k})`}>
      <span className="binomial__paren">(</span>
      <span className="binomial__stack">
        <span>{factor.n}</span>
        <span>{factor.k}</span>
      </span>
      <span className="binomial__paren">)</span>
    </span>
  );
}

/**
 * The second layer of the explanation: the full derivation, folded away behind
 * a `<details>` so the headline number stays uncluttered.
 */
export function DerivationDrawer({ params }: { params: Params }) {
  const { t, intlLocale } = useI18n();

  const derivation = derivationSteps(params);
  const { total, terms, useComplement, termsSum, result, d } = derivation;
  const unprepared = params.N - params.prepared;

  return (
    <details className="panel derivation">
      <summary className="derivation__summary">{t('derivationToggle')}</summary>

      <p className="derivation__intro">{t('derivationIntro')}</p>
      <p className="derivation__aside">{t('derivationWhyNotBinomial')}</p>

      <h3>{t('derivationTotalTitle')}</h3>
      <p>{t('derivationTotalBody', { k: params.k, N: params.N })}</p>
      <p className="derivation__equation">
        <Binomial factor={{ n: params.N, k: params.k, value: total }} />
        <span className="derivation__equals">=</span>
        <strong>{formatInteger(total, intlLocale)}</strong>
      </p>

      <h3>{useComplement ? t('derivationFailureTitle') : t('derivationSuccessTitle')}</h3>
      <p>
        {useComplement
          ? t('derivationFailureBody', { d, i: 'i', prepared: params.prepared, unprepared })
          : t('derivationSuccessBody', { d, i: 'i', prepared: params.prepared, unprepared })}
      </p>

      <table className="derivation__table">
        <tbody>
          {terms.map((term) => (
            <tr key={term.i}>
              <th scope="row">
                {term.i === 1
                  ? t('derivationTermLabelOne')
                  : t('derivationTermLabel', { i: term.i })}
              </th>
              <td>
                <Binomial factor={term.factors[0]} />
                <span className="derivation__times">·</span>
                <Binomial factor={term.factors[1]} />
              </td>
              <td className="derivation__count">{formatInteger(term.favorable, intlLocale)}</td>
              <td className="derivation__percent">
                {formatPrecisePercent(term.probability, intlLocale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>{t('derivationResultTitle')}</h3>
      <p>{useComplement ? t('derivationComplementBody') : t('derivationDirectBody')}</p>
      <p className="derivation__equation derivation__equation--result">
        {useComplement && <span>100 %&nbsp;−&nbsp;</span>}
        <span>{formatPrecisePercent(termsSum, intlLocale)}</span>
        <span className="derivation__equals">=</span>
        <strong>{formatPrecisePercent(result, intlLocale)}</strong>
      </p>

      <h3>{t('derivationGeneralFormula')}</h3>
      <pre className="derivation__formula">
        <code>{'P(X ≥ d) = Σ  C(P, i) · C(N−P, k−i) / C(N, k)\n           i≥d'}</code>
      </pre>
    </details>
  );
}
