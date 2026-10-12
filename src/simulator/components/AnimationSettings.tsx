import { useId, useState } from 'react';

import type {
  AnimationLevel,
  AnimationSettings as Settings,
} from '../../hooks/useAnimationSettings';
import { useI18n, type MessageKey } from '../../i18n/context';

const LEVELS: { level: AnimationLevel; label: MessageKey }[] = [
  { level: 'full', label: 'simAnimFull' },
  { level: 'light', label: 'simAnimLight' },
  { level: 'off', label: 'simAnimOff' },
];

interface Props {
  settings: Settings;
  reducedMotion: boolean;
  onChange: (settings: Settings) => void;
}

export function AnimationSettings({ settings, reducedMotion, onChange }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="anim-settings">
      <button
        type="button"
        className="button button--quiet"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen(!open);
        }}
      >
        <span aria-hidden="true">⚙</span> {t('simAnimSettings')}
      </button>

      <div id={panelId} className="anim-settings__panel" hidden={!open}>
        <div role="group" aria-label={t('simAnimLevel')} className="segmented">
          {LEVELS.map(({ level, label }) => (
            <button
              key={level}
              type="button"
              className="segmented__button"
              aria-pressed={settings.level === level}
              onClick={() => {
                onChange({ ...settings, level });
              }}
            >
              {t(label)}
            </button>
          ))}
        </div>

        <label className="check">
          <input
            type="checkbox"
            checked={settings.confetti}
            onChange={(event) => {
              onChange({ ...settings, confetti: event.target.checked });
            }}
          />
          {t('simAnimConfetti')}
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={settings.shake}
            onChange={(event) => {
              onChange({ ...settings, shake: event.target.checked });
            }}
          />
          {t('simAnimShake')}
        </label>

        {reducedMotion ? <p className="anim-settings__note">{t('simAnimReduced')}</p> : null}
      </div>
    </div>
  );
}
