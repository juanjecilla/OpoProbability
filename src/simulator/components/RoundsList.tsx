import { useI18n } from '../../i18n/context';
import type { Session } from '../../lib/sessions';
import { RoundRow } from './RoundRow';

/** Newest-first rounds in a scroll box that keyboard users can focus and scroll. */
export function RoundsList({ session }: { session: Session }) {
  const { t } = useI18n();
  const studied = new Set(session.studied);

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrollable region must be focusable
    <div className="rounds__scroll" role="region" aria-label={t('simRoundsSection')} tabIndex={0}>
      <ul className="rounds">
        {session.rounds.toReversed().map((round) => (
          <RoundRow key={round.id} round={round} studied={studied} />
        ))}
      </ul>
    </div>
  );
}
