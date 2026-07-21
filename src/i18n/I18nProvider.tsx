import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { createI18nValue, I18nContext } from './context';
import { detectLocale, locales, type Locale } from './translations';

const STORAGE_KEY = 'opoprobability:locale';

function readStoredLocale(): Locale | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return locales.find((locale) => locale === stored) ?? null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readStoredLocale() ?? detectLocale());

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  // Keeps screen readers and browser features (hyphenation, translation
  // prompts) in sync with the language actually rendered.
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => createI18nValue(locale, setLocale), [locale, setLocale]);

  return <I18nContext value={value}>{children}</I18nContext>;
}
