import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Controls } from '../components/Controls';
import { Section } from '../components/Section';
import { SiteHeader } from '../components/SiteHeader';
import { SupportFooter } from '../components/SupportFooter';
import { TopicsPanel } from '../components/TopicsPanel';
import { prefersReducedMotion, useAnimationSettings } from '../hooks/useAnimationSettings';
import { useSessions } from '../hooks/useSessions';
import { useTopicMap } from '../hooks/useTopicMap';
import { useI18n } from '../i18n/context';
import { cryptoRng, tally, type Outcome } from '../lib/draw';
import {
  DEFAULT_FIELDS,
  parseFields,
  toInteger,
  toRequired,
  type FieldInputs,
} from '../lib/fields';
import { successProbability } from '../lib/hypergeometric';
import {
  canResume,
  matchesCurrent,
  playRounds,
  startSession,
  type Round,
  type Session,
} from '../lib/sessions';
import { studiedWithin, withMapP } from '../lib/topicMap';
import { fieldsFromSearch, runFromSearch, searchFromFields } from '../lib/urlParams';
import { useTheme } from '../theme/useTheme';
import { AnimationSettings } from './components/AnimationSettings';
import { ConfirmDialog } from './components/ConfirmDialog';
import { Drum } from './components/Drum';
import { RoundsList } from './components/RoundsList';
import { SessionsArchive } from './components/SessionsArchive';
import { Tally } from './components/Tally';
import { IDLE_STAGE, type Stage } from './stage';

const SPIN_MS = 900;
const BALL_MS = 400;

type Confirm = { kind: 'delete'; session: Session } | { kind: 'clear' } | null;

async function celebrate() {
  const { default: confetti } = await import('canvas-confetti');
  void confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 } });
}

function detailFor(
  outcome: Outcome,
  drawn: readonly number[],
  studied: ReadonlySet<number>,
  minimum: number,
  t: ReturnType<typeof useI18n>['t'],
): string {
  const n = drawn.filter((topic) => studied.has(topic)).length;
  switch (outcome) {
    case 'success':
      return t('simOutcomeSuccessDetail', { n, k: drawn.length });
    case 'failure':
      return t('simOutcomeFailureDetail', { n, k: drawn.length, d: minimum });
    case 'wipeout':
      return t('simOutcomeWipeoutDetail', { k: drawn.length });
  }
}

export default function SimulatorApp() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const { settings, setSettings } = useAnimationSettings();
  const { sessions, save, remove, clear } = useSessions();

  const [typed, setInputs] = useState<FieldInputs>(
    () => fieldsFromSearch(window.location.search) ?? DEFAULT_FIELDS,
  );
  const { source, map, seeded, chooseSource, setMap } = useTopicMap();
  // With the Topic map as the source, P is counted from it rather than typed.
  const inputs = useMemo(
    () => (source === 'map' ? withMapP(typed, map) : typed),
    [typed, source, map],
  );
  const { params, errors } = useMemo(() => parseFields(inputs), [inputs]);

  // A link from the calculator can ask for a batch on arrival. Read once here;
  // the address effect below drops `run`, so a reload does not repeat it.
  const [pendingRun] = useState(() => runFromSearch(window.location.search));
  const ranPending = useRef(false);

  const [session, setSession] = useState<Session | null>(null);
  const [stage, setStage] = useState<Stage>(IDLE_STAGE);
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [confirm, setConfirm] = useState<Confirm>(null);
  const timers = useRef<number[]>([]);

  // Keeps the address in step with the numbers so a reload or a shared link
  // lands on the same exam.
  useEffect(() => {
    window.history.replaceState(null, '', searchFromFields(inputs));
  }, [inputs]);

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);
  useEffect(() => clearTimers, [clearTimers]);

  // Rounds only belong to the numbers they were drawn with: edit the numbers
  // and the Session on screen is simply no longer the current one.
  const active = session && params && matchesCurrent(session, params, source, map) ? session : null;
  const counts = tally(active?.rounds.map((round) => round.outcome) ?? []);
  const expected = params ? successProbability(params) : null;

  const changeInputs = useCallback(
    (next: FieldInputs) => {
      clearTimers();
      setBusy(false);
      setStage(IDLE_STAGE);
      setInputs(next);
    },
    [clearTimers],
  );

  const commit = useCallback(
    (next: Session, round: Round, announce = true) => {
      setSession(next);
      save(next);
      if (announce) {
        setAnnouncement(
          t('simAnnounce', {
            id: round.id,
            outcome: t(
              round.outcome === 'success'
                ? 'simOutcomeSuccess'
                : round.outcome === 'failure'
                  ? 'simOutcomeFailure'
                  : 'simOutcomeWipeout',
            ),
          }),
        );
      }
    },
    [save, t],
  );

  const draw = (count: number) => {
    if (!params || busy) return;
    const base =
      active ??
      startSession(
        params,
        cryptoRng,
        Date.now(),
        source === 'map' ? studiedWithin(map, params.N) : undefined,
      );
    const next = playRounds(base, count, cryptoRng);
    const round = next.rounds.at(-1);
    if (!round) return;

    const level = settings.level;
    const studied = new Set(next.studied);
    const finished: Stage = {
      phase: 'done',
      studied,
      drawn: round.drawn,
      shown: round.drawn.length,
      outcome: round.outcome,
      animated: false,
    };

    // Batches and "off" skip the show: the round is simply there.
    if (count > 1 || level === 'off') {
      setStage(finished);
      commit(next, round);
      return;
    }

    const celebrateIfWon = () => {
      if (round.outcome === 'success' && settings.confetti) void celebrate();
    };

    if (level === 'light') {
      setStage({ ...finished, animated: true });
      commit(next, round);
      celebrateIfWon();
      return;
    }

    // Full: drum spins, then each ball drops, then the verdict lands.
    setBusy(true);
    setStage({
      phase: 'spinning',
      studied,
      drawn: round.drawn,
      shown: 0,
      outcome: null,
      animated: true,
    });
    const schedule = (fn: () => void, ms: number) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    round.drawn.forEach((_, index) => {
      schedule(
        () => {
          setStage((current) => ({ ...current, phase: 'revealing', shown: index + 1 }));
        },
        SPIN_MS + index * BALL_MS,
      );
    });
    schedule(
      () => {
        setStage({ ...finished, animated: true });
        commit(next, round);
        setBusy(false);
        celebrateIfWon();
      },
      SPIN_MS + round.drawn.length * BALL_MS + 200,
    );
  };

  // The calculator's "simulate 100 draws" lands here with `run=100`.
  useEffect(() => {
    if (pendingRun === null || ranPending.current || !params) return;
    ranPending.current = true;
    draw(pendingRun);
    // Once, on arrival: later edits must not replay the request.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resume = (target: Session) => {
    if (!canResume(target, map)) return;
    clearTimers();
    setBusy(false);
    setStage(IDLE_STAGE);
    setSession(target);
    chooseSource(target.source, target.params.prepared);
    const { N, k, discards, prepared } = target.params;
    setInputs({ N: String(N), k: String(k), P: String(prepared), d: String(k - discards) });
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const confirmAction = () => {
    if (confirm?.kind === 'delete') {
      remove(confirm.session.id);
      if (session?.id === confirm.session.id) setSession(null);
    } else if (confirm?.kind === 'clear') {
      clear();
      setSession(null);
    }
    setConfirm(null);
  };

  const detail =
    stage.phase === 'done' && stage.outcome && params
      ? detailFor(stage.outcome, stage.drawn, stage.studied, toRequired(params), t)
      : null;

  const summary = params
    ? t('simConfigSummary', {
        N: params.N,
        k: params.k,
        d: toRequired(params),
        unstudied: params.N - params.prepared,
        P: params.prepared,
      })
    : t('simConfigInvalid');

  const calculatorHref = `/${searchFromFields(inputs)}`;

  return (
    <div className="page">
      <article className="sheet">
        <SiteHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          nav={{ href: calculatorHref, label: t('calcNavLink') }}
          copy={{ title: t('simAppTitle'), tagline: t('simTagline'), subtitle: t('simSubtitle') }}
        />

        <div className="sheet__rule" role="presentation" />

        <main className="sheet__body">
          <Section index="01" id="sim-config" title={t('simConfigSection')}>
            <p className="sim-summary" data-invalid={params === null}>
              {summary}
            </p>
            <TopicsPanel
              N={toInteger(inputs.N)}
              randomCount={toInteger(inputs.P)}
              source={source}
              map={map}
              seeded={seeded}
              highlight={stage.phase === 'done' ? stage.drawn : undefined}
              onSource={(next) => {
                changeInputs(next === 'random' ? inputs : typed);
                chooseSource(next, toInteger(inputs.P) ?? 0);
              }}
              onMap={(next) => {
                changeInputs(typed);
                setMap(next);
              }}
            />
            <details className="sim-edit">
              <summary>{t('simConfigEdit')}</summary>
              <Controls
                inputs={inputs}
                errors={errors}
                lockedP={source === 'map'}
                onChange={changeInputs}
                onReset={() => {
                  changeInputs(DEFAULT_FIELDS);
                }}
              />
            </details>
          </Section>

          <Section index="02" id="sim-draw" title={t('simDrawSection')}>
            <Drum
              stage={stage}
              slots={params?.k ?? 0}
              level={settings.level}
              shake={settings.shake}
              detail={detail}
            />

            <div className="draw-actions">
              <button
                type="button"
                className="button button--primary"
                disabled={!params || busy}
                onClick={() => {
                  draw(1);
                }}
              >
                {busy ? t('simDrawing') : t('simDraw')}
              </button>
              <button
                type="button"
                className="button"
                disabled={!params || busy}
                aria-label={t('simDrawTenAria')}
                onClick={() => {
                  draw(10);
                }}
              >
                {t('simDrawTen')}
              </button>
              <button
                type="button"
                className="button"
                disabled={!params || busy}
                aria-label={t('simDrawHundredAria')}
                onClick={() => {
                  draw(100);
                }}
              >
                {t('simDrawHundred')}
              </button>
              <AnimationSettings
                settings={settings}
                reducedMotion={prefersReducedMotion()}
                onChange={setSettings}
              />
            </div>

            <p className="visually-hidden" role="status" aria-live="polite">
              {announcement}
            </p>

            <Tally tally={counts} expected={expected} />
          </Section>

          <Section index="03" id="sim-rounds" title={t('simRoundsSection')}>
            {active && active.rounds.length > 0 ? (
              <>
                <p className="section__lead">{t('simRoundsNewestFirst', { max: 500 })}</p>
                <RoundsList session={active} />
              </>
            ) : (
              <p className="sessions__empty">{t('simTallyEmpty')}</p>
            )}
          </Section>

          <Section index="04" id="sim-sessions" title={t('simSessionsSection')}>
            <SessionsArchive
              sessions={sessions}
              map={map}
              currentId={active?.id ?? null}
              onResume={resume}
              onDelete={(target) => {
                setConfirm({ kind: 'delete', session: target });
              }}
              onClear={() => {
                setConfirm({ kind: 'clear' });
              }}
            />
          </Section>
        </main>

        <SupportFooter />
      </article>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm?.kind === 'delete' ? t('simConfirmDeleteTitle') : t('simConfirmClearTitle')}
        body={
          confirm?.kind === 'delete'
            ? t('simConfirmDeleteBody', { rounds: confirm.session.rounds.length })
            : t('simConfirmClearBody', { sessions: sessions.length })
        }
        onConfirm={confirmAction}
        onCancel={() => {
          setConfirm(null);
        }}
      />
    </div>
  );
}
