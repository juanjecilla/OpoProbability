import { useI18n } from '../i18n/context';

interface SimulatorCtaProps {
  /** Query string carrying the exam numbers; `null` while they are invalid. */
  search: string | null;
}

/** Call to action into the simulator. Inert, not hidden, while the numbers are invalid. */
export function SimulatorCta({ search }: SimulatorCtaProps) {
  const { t } = useI18n();

  return (
    <div className="cta">
      <div>
        <div className="cta__title">{t('simCtaTitle')}</div>
        <p className="cta__hint">{t('simCtaHint')}</p>
      </div>
      {search === null ? (
        <span className="button button--primary" aria-disabled="true">
          {t('simCtaButton')}
        </span>
      ) : (
        <a className="button button--primary" href={`/simulacro/${search}`}>
          {t('simCtaButton')}
        </a>
      )}
    </div>
  );
}
