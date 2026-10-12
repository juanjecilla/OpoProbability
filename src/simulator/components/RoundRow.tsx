import { useI18n } from '../../i18n/context';
import type { Round } from '../../lib/sessions';
import { Ball } from './Ball';
import { OutcomeBadge } from './OutcomeBadge';

export function RoundRow({ round, studied }: { round: Round; studied: ReadonlySet<number> }) {
  const { t } = useI18n();

  return (
    <li className={`round round--${round.outcome}`}>
      <span className="round__id">{t('simRoundLabel', { id: round.id })}</span>
      <span className="round__balls">
        {round.drawn.map((topic) => (
          <Ball key={topic} topic={topic} studied={studied.has(topic)} />
        ))}
      </span>
      <OutcomeBadge outcome={round.outcome} />
    </li>
  );
}
