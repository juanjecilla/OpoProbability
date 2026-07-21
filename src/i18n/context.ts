import { createContext, useContext } from 'react';

import { intlLocales, translations, type Locale, type Translation } from './translations';

/** Keys holding a plain string, i.e. everything except the nested `issue` map. */
export type MessageKey = {
  [K in keyof Translation]: Translation[K] extends string ? K : never;
}[keyof Translation];

export interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translates a key, replacing `{placeholders}` with the given values. */
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  messages: Translation;
  /** BCP 47 tag for `Intl` formatters. */
  intlLocale: string;
}

export const I18nContext = createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used inside an I18nProvider');
  return value;
}

/** Builds the context value. Kept out of the component for testability. */
export function createI18nValue(locale: Locale, setLocale: (locale: Locale) => void): I18nValue {
  const messages = translations[locale];

  return {
    locale,
    setLocale,
    messages,
    intlLocale: intlLocales[locale],
    t: (key, vars) =>
      vars
        ? messages[key].replaceAll(/\{(\w+)\}/gu, (match, name: string) =>
            name in vars ? String(vars[name]) : match,
          )
        : messages[key],
  };
}
