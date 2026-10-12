import { useI18n, type MessageKey } from '../../i18n/context';
import type { Outcome } from '../../lib/draw';

const LABEL: Record<Outcome, MessageKey> = {
  success: 'simOutcomeSuccess',
  failure: 'simOutcomeFailure',
  wipeout: 'simOutcomeWipeout',
};

const ICON: Record<Outcome, string> = { success: '✓', failure: '✗', wipeout: '☠' };

export function OutcomeBadge({
  outcome,
  className = '',
}: {
  outcome: Outcome;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <span className={`outcome outcome--${outcome} ${className}`.trim()}>
      <span aria-hidden="true">{ICON[outcome]}</span> {t(LABEL[outcome])}
    </span>
  );
}
