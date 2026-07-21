import { useMemo } from 'react';

import { useI18n } from '../i18n/context';
import { formatPercent } from '../lib/format';
import { curve, successProbability, type Params } from '../lib/hypergeometric';

const WIDTH = 640;
const HEIGHT = 320;
const PADDING = { top: 24, right: 24, bottom: 40, left: 52 };

const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

const Y_TICKS = [0, 0.25, 0.5, 0.75, 1];

interface ProbabilityCurveProps {
  params: Params;
  target: number;
}

/**
 * Success probability as a function of topics prepared.
 *
 * Hand-rolled SVG rather than a charting library: the whole chart is one
 * polyline plus a marker, and pulling in a dependency for that would cost more
 * bytes than the rest of the app.
 */
export function ProbabilityCurve({ params, target }: ProbabilityCurveProps) {
  const { t, intlLocale } = useI18n();

  const values = useMemo(
    () => curve(params.N, params.k, params.discards),
    [params.N, params.k, params.discards],
  );

  const x = (prepared: number) => PADDING.left + (prepared / params.N) * PLOT_WIDTH;
  const y = (probability: number) => PADDING.top + (1 - probability) * PLOT_HEIGHT;

  const line = values.map((value, prepared) => `${x(prepared)},${y(value)}`).join(' ');
  const area = `${PADDING.left},${y(0)} ${line} ${x(params.N)},${y(0)}`;

  const current = successProbability(params);
  const xTicks = [
    0,
    Math.round(params.N / 4),
    Math.round(params.N / 2),
    Math.round((params.N * 3) / 4),
    params.N,
  ];

  return (
    <section className="panel">
      <h2>{t('chartTitle')}</h2>

      <svg
        className="chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`${t('chartTitle')}. ${t('chartYou')}: ${formatPercent(current, intlLocale)}`}
      >
        {Y_TICKS.map((tick) => (
          <g key={tick}>
            <line
              className="chart__gridline"
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={y(tick)}
              y2={y(tick)}
            />
            <text className="chart__tick chart__tick--y" x={PADDING.left - 10} y={y(tick)}>
              {formatPercent(tick, intlLocale)}
            </text>
          </g>
        ))}

        {xTicks.map((tick) => (
          <text key={tick} className="chart__tick chart__tick--x" x={x(tick)} y={HEIGHT - 14}>
            {tick}
          </text>
        ))}

        <polygon className="chart__area" points={area} />
        <polyline className="chart__line" points={line} />

        <line
          className="chart__target"
          x1={PADDING.left}
          x2={WIDTH - PADDING.right}
          y1={y(target)}
          y2={y(target)}
        />
        {/* High targets sit close to the top gridline, so the caption drops
            below the line to avoid colliding with the 100% tick. */}
        <text
          className="chart__label"
          x={WIDTH - PADDING.right}
          y={target > 0.85 ? y(target) + 16 : y(target) - 8}
        >
          {t('chartTarget')} {formatPercent(target, intlLocale)}
        </text>

        <line
          className="chart__marker-line"
          x1={x(params.prepared)}
          x2={x(params.prepared)}
          y1={y(current)}
          y2={y(0)}
        />
        <circle className="chart__marker" cx={x(params.prepared)} cy={y(current)} r={6} />
      </svg>

      <p className="chart__caption">{t('chartCaption')}</p>
      <p className="chart__axis-note">
        {t('chartAxisX')} · {t('chartAxisY')}
      </p>
    </section>
  );
}
