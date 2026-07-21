import { useI18n } from '../i18n/context';
import type { Params } from '../lib/hypergeometric';
import presets from '../data/presets.json';

/**
 * A common exam shape. Presets carry no label of their own: it is built from
 * the numbers so it stays in sync with the data and translates for free.
 */
export interface Preset {
  id: string;
  N: number;
  k: number;
  discards: number;
}

interface ControlsProps {
  params: Params;
  onChange: (params: Params) => void;
}

/** A slider paired with a number box, both driving the same value. */
function NumberField({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  const id = `field-${label.replaceAll(/\s+/gu, '-').toLowerCase()}`;

  return (
    <div className="field">
      <div className="field__header">
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type="number"
          className="field__number"
          value={value}
          min={min}
          max={max}
          onChange={(event) => {
            onChange(event.target.valueAsNumber);
          }}
        />
      </div>
      <input
        type="range"
        className="field__range"
        aria-label={label}
        value={Number.isNaN(value) ? min : value}
        min={min}
        max={max}
        step={1}
        onChange={(event) => {
          onChange(event.target.valueAsNumber);
        }}
      />
      <p className="field__hint">{hint}</p>
    </div>
  );
}

export function Controls({ params, onChange }: ControlsProps) {
  const { t } = useI18n();

  const activePreset = (presets as Preset[]).find(
    (preset) =>
      preset.N === params.N && preset.k === params.k && preset.discards === params.discards,
  );

  const applyPreset = (id: string) => {
    const preset = (presets as Preset[]).find((candidate) => candidate.id === id);
    if (!preset) return;

    onChange({
      N: preset.N,
      k: preset.k,
      discards: preset.discards,
      // Keep the study effort already entered, capped to the new syllabus.
      prepared: Math.min(params.prepared, preset.N),
    });
  };

  return (
    <section className="panel">
      <h2>{t('setupTitle')}</h2>

      <div className="field">
        <label htmlFor="preset">{t('presetLabel')}</label>
        <select
          id="preset"
          className="field__select"
          value={activePreset?.id ?? ''}
          onChange={(event) => {
            applyPreset(event.target.value);
          }}
        >
          {!activePreset && <option value="">{t('presetCustom')}</option>}
          {(presets as Preset[]).map((preset) => (
            <option key={preset.id} value={preset.id}>
              {t('presetOption', { N: preset.N, k: preset.k, discards: preset.discards })}
            </option>
          ))}
        </select>
        <p className="field__hint">{t('presetHint')}</p>
      </div>

      <NumberField
        label={t('fieldTopics')}
        hint={t('fieldTopicsHint')}
        value={params.N}
        min={1}
        max={300}
        onChange={(N) => {
          onChange({
            ...params,
            N,
            k: Math.min(params.k, N),
            prepared: Math.min(params.prepared, N),
          });
        }}
      />

      <NumberField
        label={t('fieldDraw')}
        hint={t('fieldDrawHint')}
        value={params.k}
        min={1}
        max={Math.min(params.N, 12)}
        onChange={(k) => {
          onChange({ ...params, k, discards: Math.min(params.discards, k - 1) });
        }}
      />

      <NumberField
        label={t('fieldDiscards')}
        hint={t('fieldDiscardsHint')}
        value={params.discards}
        min={0}
        max={Math.max(0, params.k - 1)}
        onChange={(discards) => {
          onChange({ ...params, discards });
        }}
      />

      <NumberField
        label={t('fieldPrepared')}
        hint={t('fieldPreparedHint')}
        value={params.prepared}
        min={0}
        max={params.N}
        onChange={(prepared) => {
          onChange({ ...params, prepared });
        }}
      />
    </section>
  );
}
