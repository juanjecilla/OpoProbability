import { useI18n } from '../../i18n/context';
import type { AnimationLevel } from '../../hooks/useAnimationSettings';
import type { Stage } from '../stage';
import { Ball } from './Ball';
import { OutcomeBadge } from './OutcomeBadge';

interface DrumProps {
  stage: Stage;
  slots: number;
  level: AnimationLevel;
  shake: boolean;
  detail: string | null;
}

const DRUM_BALLS = [
  [38, 52],
  [60, 40],
  [82, 54],
  [50, 74],
  [72, 78],
  [92, 76],
  [30, 78],
] as const;

export function Drum({ stage, slots, level, shake, detail }: DrumProps) {
  const { t } = useI18n();
  const shaking = stage.phase === 'done' && stage.outcome === 'wipeout' && shake && stage.animated;

  return (
    <div
      className="stage"
      data-level={level}
      data-phase={stage.phase}
      data-outcome={stage.phase === 'done' ? (stage.outcome ?? 'none') : 'none'}
      data-shake={shaking}
    >
      <svg
        className="drum"
        viewBox="0 0 120 120"
        role="img"
        aria-label={t('simDrumLabel')}
        data-spinning={stage.phase === 'spinning'}
      >
        <circle cx="60" cy="60" r="54" className="drum__shell" />
        <g className="drum__balls">
          {DRUM_BALLS.map(([x, y]) => (
            <circle key={`${String(x)}-${String(y)}`} cx={x} cy={y} r="8" className="drum__ball" />
          ))}
        </g>
        <path d="M60 6v10M60 104v10M6 60h10M104 60h10" className="drum__ticks" />
      </svg>

      <div className="stage__balls">
        {Array.from({ length: slots }, (_, index) => {
          const topic = stage.drawn[index];
          const visible = topic !== undefined && index < stage.shown;
          return visible ? (
            <Ball
              key={`${String(index)}-${String(topic)}`}
              topic={topic}
              studied={stage.studied.has(topic)}
              className={stage.animated ? 'ball--drop' : ''}
            />
          ) : (
            <span key={`empty-${String(index)}`} className="ball ball--empty" aria-hidden="true" />
          );
        })}
      </div>

      <div className="stage__verdict">
        {stage.phase === 'done' && stage.outcome ? (
          <>
            <OutcomeBadge outcome={stage.outcome} className="outcome--stamp" />
            {detail ? <p className="stage__detail">{detail}</p> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
