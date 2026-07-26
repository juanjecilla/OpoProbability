import { useMemo } from 'react';

import { useI18n } from '../i18n/context';
import { formatPercent } from '../lib/format';
import { curve, successProbability, type Params } from '../lib/hypergeometric';

interface ProbabilityCurveProps {
  params: Params | null;
  /** Confidence target from the inverse panel, drawn as the dashed guide. */
  target: number;
}

/** Roughly 60 points is enough to read the shape, however long the syllabus. */
function sampleStep(N: number): number {
  return Math.max(1, Math.round(N / 60));
}

/**
 * Success probability as a function of topics prepared.
 *
 * Hand-rolled SVG rather than a charting library: the whole chart is one
 * polyline plus a marker, and pulling in a dependency for that would cost more
 * bytes than the rest of the app. The viewBox is a flat 0–100 square stretched
 * to the container, so every coordinate below is already a percentage.
 */
export function ProbabilityCurve({ params, target }: ProbabilityCurveProps) {
  const { t, intlLocale } = useI18n();

  const values = useMemo(
    () => (params ? curve(params.N, params.k, params.discards) : null),
    [params],
  );

  const geometry = useMemo(() => {
    if (!params || !values) return null;

    const { N, prepared } = params;
    const step = sampleStep(N);
    const samples: number[] = [];
    for (let x = 0; x <= N; x += step) samples.push(x);
    if (samples.at(-1) !== N) samples.push(N);

    const points = samples
      .map((x) => `${((x / N) * 100).toFixed(2)} ${(100 - (values[x] ?? 0) * 100).toFixed(2)}`)
      .join(' L ');

    const ticks = [...new Set([0, Math.round(N / 2), N, prepared])]
      .filter((value) => value >= 0 && value <= N)
      .toSorted((a, b) => a - b);

    return {
      line: `M ${points}`,
      area: `M 0 100 L ${points} L 100 100 Z`,
      markerX: (prepared / N) * 100,
      markerY: successProbability(params) * 100,
      ticks,
    };
  }, [params, values]);

  return (
    <>
      <div className="chart__header">
        <h3>{t('chartTitle')}</h3>
        <span className="chart__axis">{t('chartAxis')}</span>
      </div>
      <p className="chart__sub">{t('chartSub')}</p>

      <div
        className="chart"
        role="img"
        aria-label={params ? t('chartAria', { N: params.N }) : t('resultEmpty')}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="chart__svg">
          <line
            className="chart__target"
            x1="0"
            x2="100"
            y1={100 - target * 100}
            y2={100 - target * 100}
            vectorEffect="non-scaling-stroke"
          />
          {geometry ? (
            <>
              <path className="chart__area" d={geometry.area} />
              <path className="chart__line" d={geometry.line} vectorEffect="non-scaling-stroke" />
            </>
          ) : null}
        </svg>

        <span className="chart__target-label" style={{ bottom: `${String(target * 100)}%` }}>
          {t('chartTarget')} {formatPercent(target, intlLocale)}
        </span>

        {geometry ? (
          <>
            <span
              className="chart__guide"
              style={{
                left: `${String(geometry.markerX)}%`,
                height: `${String(geometry.markerY)}%`,
              }}
            />
            <span
              className="chart__dot"
              style={{
                left: `${String(geometry.markerX)}%`,
                bottom: `${String(geometry.markerY)}%`,
              }}
            />
          </>
        ) : null}
      </div>

      <div className="chart__ticks">
        {geometry?.ticks.map((tick) => {
          const left = (tick / (params?.N ?? 1)) * 100;
          // The end labels are pulled inside the plot so they do not hang off
          // the edge of the sheet.
          const transform =
            left <= 0 ? 'none' : left >= 100 ? 'translateX(-100%)' : 'translateX(-50%)';

          return (
            <span
              key={tick}
              className="chart__tick"
              data-current={params?.prepared === tick}
              style={{ left: `${String(left)}%`, transform }}
            >
              {tick}
            </span>
          );
        })}
      </div>
    </>
  );
}
