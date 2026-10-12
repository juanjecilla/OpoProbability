import { useI18n } from '../../i18n/context';

interface BallProps {
  topic: number;
  studied: boolean;
  /** Extra class, e.g. the entrance animation. */
  className?: string;
}

/** A numbered topic ball. Studied is solid, unstudied dashed, so colour is not the only cue. */
export function Ball({ topic, studied, className = '' }: BallProps) {
  const { t } = useI18n();
  const state = t(studied ? 'simStateStudied' : 'simStateUnstudied');

  return (
    <span
      className={`ball ${studied ? 'ball--studied' : 'ball--unstudied'} ${className}`.trim()}
      role="img"
      aria-label={t('simBallAria', { n: topic, state })}
    >
      <span aria-hidden="true">{topic}</span>
    </span>
  );
}
