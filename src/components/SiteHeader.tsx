import { useI18n } from '../i18n/context';
import { locales, productName } from '../i18n/translations';
import type { Theme } from '../theme/useTheme';

interface SiteHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

/** Curve rising off a baseline: the shape the whole app is about. */
function LogoMark() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" aria-hidden="true" fill="none">
      <rect x="3.5" y="3.5" width="33" height="33" rx="8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9 27c3 0 4.5-4 7.5-9.5S21.5 8 24 8s3.5 3 4 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <circle cx="24" cy="8" r="2.6" fill="currentColor" />
      <path
        d="M9 31.5h22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <path
        d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 14.2A8 8 0 1 1 9.8 4 6.4 6.4 0 0 0 20 14.2z" fill="currentColor" />
    </svg>
  );
}

export function SiteHeader({ theme, onToggleTheme }: SiteHeaderProps) {
  const { t, locale, setLocale } = useI18n();

  const nextMode = theme === 'dark' ? t('themeLight') : t('themeDark');
  const themeLabel = t('themeToggle', { mode: nextMode });

  return (
    <header className="masthead">
      <div className="masthead__top">
        <div className="masthead__brand">
          <span className="masthead__logo" aria-hidden="true">
            <LogoMark />
          </span>

          <div className="masthead__titles">
            {/* The name never translates, so it is spelt out for screen
                readers once and drawn for everyone else. */}
            <h1 className="masthead__wordmark">
              <span className="visually-hidden">{t('appTitle')}</span>
              <span aria-hidden="true">
                <strong>{productName.prefix}</strong>
                <span className="masthead__wordmark-tail">{productName.suffix}</span>
              </span>
            </h1>
            <p className="masthead__tagline">{t('tagline')}</p>
          </div>
        </div>

        <div className="masthead__actions">
          <div className="segmented" role="group" aria-label={t('languageLabel')}>
            {locales.map((candidate) => (
              <button
                key={candidate}
                type="button"
                className="segmented__button"
                aria-pressed={locale === candidate}
                onClick={() => {
                  setLocale(candidate);
                }}
              >
                {candidate.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onToggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>

      <p className="masthead__subtitle">{t('subtitle')}</p>
    </header>
  );
}
