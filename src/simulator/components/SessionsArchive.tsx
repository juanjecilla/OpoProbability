import { useState } from 'react';

import { useI18n } from '../../i18n/context';
import { tally } from '../../lib/draw';
import { formatPercent } from '../../lib/format';
import { MAX_SESSIONS, type Session } from '../../lib/sessions';
import { RoundsList } from './RoundsList';

interface Props {
  sessions: Session[];
  currentId: string | null;
  onResume: (session: Session) => void;
  onDelete: (session: Session) => void;
  onClear: () => void;
}

export function SessionsArchive({ sessions, currentId, onResume, onDelete, onClear }: Props) {
  const { t, intlLocale, locale } = useI18n();
  const [expanded, setExpanded] = useState<string | null>(null);
  const dateFormat = new Intl.DateTimeFormat(intlLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  if (sessions.length === 0) return <p className="sessions__empty">{t('simSessionsEmpty')}</p>;

  return (
    <>
      <p className="section__lead">{t('simSessionsLead', { max: MAX_SESSIONS })}</p>
      <ul className="sessions">
        {sessions.map((session) => {
          const counts = tally(session.rounds.map((round) => round.outcome));
          const { N, k, discards, prepared } = session.params;
          const isOpen = expanded === session.id;
          const detailId = `session-${session.id}`;

          return (
            <li key={session.id} className="session">
              <div className="session__head">
                <div>
                  <strong>{dateFormat.format(session.createdAt)}</strong>
                  {session.id === currentId ? (
                    <span className="session__current"> · {t('simSessionCurrent')}</span>
                  ) : null}
                  <div className="session__meta">
                    {t('simSessionConfig', { N, k, d: k - discards, P: prepared })}
                  </div>
                  <div className="session__meta">
                    {t('simSessionSummary', {
                      rounds: counts.rounds,
                      rate: formatPercent(counts.successes / counts.rounds, intlLocale),
                    })}
                  </div>
                </div>
                <div className="session__actions">
                  <button
                    type="button"
                    className="button button--quiet"
                    aria-expanded={isOpen}
                    aria-controls={detailId}
                    onClick={() => {
                      setExpanded(isOpen ? null : session.id);
                    }}
                  >
                    {isOpen ? '−' : '+'} {t('simRoundsSection')}
                  </button>
                  <button
                    type="button"
                    className="button button--quiet"
                    onClick={() => {
                      onResume(session);
                    }}
                  >
                    {t('simSessionResume')}
                  </button>
                  <button
                    type="button"
                    className="button button--quiet"
                    onClick={() => {
                      onDelete(session);
                    }}
                  >
                    {t('simSessionDelete')}
                  </button>
                </div>
              </div>

              <div id={detailId} hidden={!isOpen}>
                {isOpen ? (
                  <>
                    <p className="session__meta" lang={locale}>
                      {t('simSessionStudied', { list: session.studied.join(', ') || '—' })}
                    </p>
                    <RoundsList session={session} />
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <button type="button" className="button button--quiet" onClick={onClear}>
        {t('simSessionsClear')}
      </button>
    </>
  );
}
