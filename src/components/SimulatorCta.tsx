import { useI18n } from '../i18n/context';
import { formatPercent } from '../lib/format';
import type { StudiedSource } from '../lib/sessions';

type SimulatorCtaProps =
  | {
      /** A low-key pointer next to the inputs: the numbers are still being set. */
      variant: 'quiet';
      /** Link into the simulator; `null` while the numbers are invalid. */
      href: string | null;
      source: StudiedSource;
    }
  | {
      /** The payoff under the verdict: test that very number by simulation. */
      variant: 'primary';
      /** Link that plays 100 Rounds on arrival; `null` while the numbers are invalid. */
      href: string | null;
      probability: number | null;
    };

/** Entry points into the simulator. Inert, not hidden, while the numbers are invalid. */
export function SimulatorCta(props: SimulatorCtaProps) {
  const { t, intlLocale } = useI18n();

  if (props.variant === 'quiet') {
    const label = t(props.source === 'map' ? 'simCtaQuietMap' : 'simCtaQuietRandom');
    return (
      <p className="sim-link">
        <span className="sim-link__lead">{t('simCtaQuietLead')}</span>{' '}
        {props.href === null ? (
          <span className="sim-link__off">{label}</span>
        ) : (
          <a className="sim-link__anchor" href={`/simulacro/${props.href}`}>
            {label} →
          </a>
        )}
      </p>
    );
  }

  const { href, probability } = props;
  const ready = href !== null && probability !== null;
  const button = t('simCtaResultButton');

  return (
    <div className="cta">
      <div>
        <div className="cta__title">
          {ready
            ? t('simCtaResultTitle', { rate: formatPercent(probability, intlLocale) })
            : t('simCtaTitle')}
        </div>
        <p className="cta__hint">{ready ? t('simCtaResultHint') : t('simConfigInvalid')}</p>
      </div>
      {ready ? (
        <a className="button button--primary" href={`/simulacro/${href}`}>
          {button}
        </a>
      ) : (
        <span className="button button--primary" aria-disabled="true">
          {button}
        </span>
      )}
    </div>
  );
}
