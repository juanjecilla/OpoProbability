import { lazy, Suspense, useEffect, useMemo, useState } from 'react';

import { Controls } from './components/Controls';
import { ResultPanel } from './components/ResultPanel';
import { Section } from './components/Section';
import { SimulatorCta } from './components/SimulatorCta';
import { SiteHeader } from './components/SiteHeader';
import { SupportFooter } from './components/SupportFooter';
import { TopicsPanel } from './components/TopicsPanel';
import { useTopicMap } from './hooks/useTopicMap';
import { useI18n } from './i18n/context';
import { DEFAULT_FIELDS, parseFields, type FieldInputs } from './lib/fields';
import { successProbability } from './lib/hypergeometric';
import { toInteger } from './lib/fields';
import { seed, withMapP } from './lib/topicMap';
import { fieldsFromSearch, searchFromFields, searchWithRun } from './lib/urlParams';
import { useTheme } from './theme/useTheme';

// Below-the-fold: not needed for first paint, so split out of the main
// chunk. `Section`'s heading/frame stays eager (cheap, keeps the page's
// structure stable); only the content below it is deferred.
const ProbabilityCurve = lazy(() =>
  import('./components/ProbabilityCurve').then((m) => ({ default: m.ProbabilityCurve })),
);
const OddsTable = lazy(() =>
  import('./components/OddsTable').then((m) => ({ default: m.OddsTable })),
);
const InversePanel = lazy(() =>
  import('./components/InversePanel').then((m) => ({ default: m.InversePanel })),
);
const DerivationDrawer = lazy(() =>
  import('./components/DerivationDrawer').then((m) => ({ default: m.DerivationDrawer })),
);

export default function App() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const [typed, setInputs] = useState<FieldInputs>(
    () => fieldsFromSearch(window.location.search) ?? DEFAULT_FIELDS,
  );
  const [target, setTarget] = useState(0.95);
  const { source, map, seeded, chooseSource, setMap } = useTopicMap();

  // With the Topic map as the source, P is counted from it rather than typed.
  const inputs = useMemo(
    () => (source === 'map' ? withMapP(typed, map) : typed),
    [typed, source, map],
  );

  // Memoised because `params` is the identity every panel keys its own
  // memoisation off: re-parsing on each render would redraw the whole curve.
  const { params, errors } = useMemo(() => parseFields(inputs), [inputs]);

  // Keeps the address in step with the numbers so a link or the back button
  // from the simulator lands on the same exam.
  useEffect(() => {
    window.history.replaceState(null, '', searchFromFields(inputs));
  }, [inputs]);

  const simulatorSearch = params ? searchFromFields(inputs) : null;
  const simulatorRunSearch = params ? searchWithRun(inputs, 100) : null;
  const probability = useMemo(() => (params ? successProbability(params) : null), [params]);

  return (
    <div className="page">
      <article className="sheet">
        <SiteHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          nav={{ href: `/simulacro/${simulatorSearch ?? ''}`, label: t('simNavLink') }}
        />

        <div className="sheet__rule" role="presentation" />

        <main className="sheet__body">
          <Section index="01" id="section-inputs" title={t('inputsTitle')} lead={t('inputsSub')}>
            <Controls
              inputs={inputs}
              errors={errors}
              lockedP={source === 'map'}
              onChange={setInputs}
              onReset={() => {
                setInputs(DEFAULT_FIELDS);
                // The example's P comes from the map, so the map returns to 1..P too.
                if (source === 'map') setMap(seed(Number(DEFAULT_FIELDS.P)));
              }}
            />
            <TopicsPanel
              N={toInteger(inputs.N)}
              randomCount={toInteger(inputs.P)}
              source={source}
              map={map}
              seeded={seeded}
              onSource={(next) => {
                chooseSource(next, toInteger(inputs.P) ?? 0);
                // Back to Random, keep the count the map had given.
                if (next === 'random') setInputs(inputs);
              }}
              onMap={setMap}
            />
            <SimulatorCta variant="quiet" href={simulatorSearch} source={source} />
          </Section>

          <Section index="02" id="section-result" title={t('resultSection')}>
            <ResultPanel params={params} />
            <SimulatorCta variant="primary" href={simulatorRunSearch} probability={probability} />
          </Section>

          <Section index="03" id="section-progress" title={t('progressSection')}>
            <Suspense fallback={null}>
              <ProbabilityCurve params={params} target={target} />

              <h3 className="odds__title">{t('tableTitle')}</h3>
              <p className="odds__sub">{t('tableSub')}</p>
              <OddsTable params={params} />

              <InversePanel params={params} target={target} onTargetChange={setTarget} />
            </Suspense>
          </Section>

          <Section index="04" id="section-working" title={t('workingSection')}>
            <Suspense fallback={null}>
              <DerivationDrawer params={params} />
            </Suspense>
          </Section>
        </main>

        <SupportFooter />
      </article>
    </div>
  );
}
