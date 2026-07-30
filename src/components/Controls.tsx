import { useI18n, type MessageKey } from '../i18n/context';
import {
  bump,
  maximum,
  MINIMUM,
  sanitize,
  toInteger,
  type FieldInputs,
  type FieldIssue,
  type FieldName,
} from '../lib/fields';
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

interface FieldSpec {
  name: FieldName;
  /** The symbol the maths uses, boxed next to the label. */
  symbol: string;
  label: MessageKey;
  hint: MessageKey;
}

const FIELDS: FieldSpec[] = [
  { name: 'N', symbol: 'N', label: 'fieldTopics', hint: 'fieldTopicsHint' },
  { name: 'k', symbol: 'k', label: 'fieldDraw', hint: 'fieldDrawHint' },
  { name: 'P', symbol: 'P', label: 'fieldPrepared', hint: 'fieldPreparedHint' },
  { name: 'd', symbol: 'd', label: 'fieldRequired', hint: 'fieldRequiredHint' },
];

interface ControlsProps {
  inputs: FieldInputs;
  errors: Partial<Record<FieldName, FieldIssue>>;
  onChange: (inputs: FieldInputs) => void;
  onReset: () => void;
}

export function Controls({ inputs, errors, onChange, onReset }: ControlsProps) {
  const { t, messages } = useI18n();

  /** Presets describe the exam, so they fill N, k and the minimum needed. */
  const applyPreset = (preset: Preset) => {
    onChange({
      ...inputs,
      N: String(preset.N),
      k: String(preset.k),
      d: String(preset.k - preset.discards),
    });
  };

  const isActive = (preset: Preset) =>
    inputs.N === String(preset.N) &&
    inputs.k === String(preset.k) &&
    inputs.d === String(preset.k - preset.discards);

  return (
    <>
      <div className="presets">
        <div className="presets__label">{t('presets')}</div>
        <div className="presets__list">
          {(presets as Preset[]).map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="chip"
              aria-pressed={isActive(preset)}
              onClick={() => {
                applyPreset(preset);
              }}
            >
              {t('presetOption', { N: preset.N, k: preset.k, d: preset.k - preset.discards })}
            </button>
          ))}
        </div>
        <p className="presets__hint">{t('presetHint')}</p>
      </div>

      <div className="fields">
        {FIELDS.map((field) => {
          const id = `field-${field.name}`;
          const hintId = `${id}-hint`;
          const issue = errors[field.name];
          const label = t(field.label);
          const current = toInteger(inputs[field.name]);
          const max = maximum(inputs, field.name);
          const atMin = current !== null && current <= MINIMUM[field.name];
          const atMax = current !== null && max !== null && current >= max;

          return (
            <div className="field" key={field.name}>
              <label className="field__label" htmlFor={id}>
                <span className="field__symbol" aria-hidden="true">
                  {field.symbol}
                </span>
                <span>{label}</span>
              </label>

              <div className="field__control">
                <button
                  type="button"
                  className="field__step"
                  aria-label={t('decrease', { field: label })}
                  disabled={atMin}
                  onClick={() => {
                    onChange(bump(inputs, field.name, -1));
                  }}
                >
                  −
                </button>
                {/* A text box rather than type=number: half-typed values have
                    to survive long enough to be corrected. */}
                <input
                  id={id}
                  className="field__input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={inputs[field.name]}
                  aria-invalid={issue !== undefined}
                  aria-describedby={hintId}
                  onChange={(event) => {
                    onChange({ ...inputs, [field.name]: sanitize(event.target.value) });
                  }}
                />
                <button
                  type="button"
                  className="field__step"
                  aria-label={t('increase', { field: label })}
                  disabled={atMax}
                  onClick={() => {
                    onChange(bump(inputs, field.name, 1));
                  }}
                >
                  +
                </button>
              </div>

              <p className="field__hint" id={hintId}>
                {t(field.hint)}
              </p>

              {issue ? (
                <p className="field__error" role="alert">
                  <span aria-hidden="true">⚠</span>
                  {messages.issue[issue]}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <button type="button" className="button button--quiet" onClick={onReset}>
        {t('reset')}
      </button>
    </>
  );
}
