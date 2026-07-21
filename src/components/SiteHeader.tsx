import { useI18n } from '../i18n/context';
import { localeNames, locales, type Locale } from '../i18n/translations';
import type { Theme } from '../theme/useTheme';

interface SiteHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function SiteHeader({ theme, onToggleTheme }: SiteHeaderProps) {
  const { t, locale, setLocale } = useI18n();

  const nextMode = theme === 'dark' ? t('themeLight') : t('themeDark');

  return (
    <header className="site-header">
      <div className="site-header__titles">
        <h1>{t('appTitle')}</h1>
        <p>{t('appSubtitle')}</p>
      </div>

      <div className="site-header__actions">
        <label className="visually-hidden" htmlFor="locale">
          {t('languageLabel')}
        </label>
        <select
          id="locale"
          className="site-header__select"
          value={locale}
          onChange={(event) => {
            setLocale(event.target.value as Locale);
          }}
        >
          {locales.map((candidate) => (
            <option key={candidate} value={candidate}>
              {localeNames[candidate]}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="site-header__theme"
          onClick={onToggleTheme}
          aria-label={t('themeToggle', { mode: nextMode })}
          title={t('themeToggle', { mode: nextMode })}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>
    </header>
  );
}
