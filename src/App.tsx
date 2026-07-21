import { useState } from 'react';

import { Controls } from './components/Controls';
import { DerivationDrawer } from './components/DerivationDrawer';
import { InversePanel } from './components/InversePanel';
import { ProbabilityCurve } from './components/ProbabilityCurve';
import { ResultPanel } from './components/ResultPanel';
import { SiteHeader } from './components/SiteHeader';
import { useI18n } from './i18n/context';
import { validate, type Params } from './lib/hypergeometric';
import { useTheme } from './theme/useTheme';

const REPOSITORY_URL = 'https://github.com/juanjecilla/OpoProbability';

/** The case that motivated the app: 60 topics, 4 drawn, 2 discarded. */
const DEFAULT_PARAMS: Params = { N: 60, k: 4, discards: 2, prepared: 40 };

export default function App() {
  const { t, messages } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const [params, setParams] = useState<Params>(DEFAULT_PARAMS);
  const [target, setTarget] = useState(0.95);

  const issues = validate(params);
  const isValid = issues.length === 0;

  return (
    <div className="app">
      <SiteHeader theme={theme} onToggleTheme={toggleTheme} />

      <main className="layout">
        <Controls params={params} onChange={setParams} />

        {isValid ? (
          <>
            <ResultPanel params={params} />
            <InversePanel params={params} target={target} onTargetChange={setTarget} />
            <ProbabilityCurve params={params} target={target} />
            <DerivationDrawer params={params} />
          </>
        ) : (
          <section className="panel panel--error" role="alert">
            <h2>{t('errorsTitle')}</h2>
            <ul>
              {issues.map((issue) => (
                <li key={issue}>{messages.issue[issue]}</li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <a href={REPOSITORY_URL} rel="noreferrer noopener" target="_blank">
          {t('footerSource')}
        </a>
      </footer>
    </div>
  );
}
