import { useEffect, useRef, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Label, LabelList, Legend, Pie, PieChart, PolarAngleAxis, PolarGrid,
  PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { COLORS, SERIES, bandColor, heatColor, rankOpacity } from '../lib/colors';
import { formatIndex, formatNumber, formatPct, isKhmer, shortSchool, truncate } from '../lib/format';
import { EmptyState } from '../components/StateViews';
import { useLanguage } from '../lib/i18n';

/** Extra Y/X-axis label space Khmer script needs over the Latin default. */
const KHMER_LABEL_PAD = 40;

const AXIS = { fontSize: 12, fill: COLORS.secondary };
const GRID = { stroke: COLORS.border };

/**
 * Tracks a wrapper element's rendered width so a chart's label column can
 * shrink on narrow (phone-width) screens instead of a fixed pixel width
 * consuming the whole card and leaving no room for the bars/dots themselves.
 */
function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

/**
 * Shrinks a desired label-column width to fit a narrow container, and caps
 * how many characters the tick text truncates to at that width — both
 * unchanged (return the desired width, no extra truncation) once there's
 * enough room.
 */
function responsiveLabelSizing(desiredWidth, containerWidth, lang) {
  if (!containerWidth) return { width: desiredWidth, maxChars: null };
  const width = Math.max(70, Math.min(desiredWidth, containerWidth * 0.42));
  if (width >= desiredWidth) return { width: desiredWidth, maxChars: null };
  const pxPerChar = lang === 'kh' ? 11 : 7;
  const maxChars = Math.max(6, Math.floor(width / pxPerChar));
  return { width, maxChars };
}

/* ------------------------------------------------------------------ */
/* Ranked horizontal bars — rankings and comparisons                   */
/* ------------------------------------------------------------------ */

export function RankedBarChart({
  data, unit = 'percent', banded = false, color = COLORS.blue, colors, highlightLabels,
  mutedColor = '#CBD5E1', valueLabel, higherIsBetter = true,
  height, labelWidth = 190, shortenSchoolNames = false, labelMaxChars = 24, domainMax, showValues = false,
  fadeByRank = false,
}) {
  const { lang, t } = useLanguage();
  const [wrapRef, containerWidth] = useElementWidth();
  const rows = data.filter((d) => d.value !== null);
  if (rows.length === 0) return <EmptyState />;

  const chartData = rows.map((d) => ({
    ...d,
    display: shortenSchoolNames ? shortSchool(d.label, labelMaxChars) : d.label,
  }));
  const computedHeight = height ?? Math.max(160, chartData.length * 30 + 30);
  const max = domainMax ?? (unit === 'count' ? 'dataMax' : 100);
  const desiredLabelWidth = lang === 'kh' ? labelWidth + KHMER_LABEL_PAD : labelWidth;
  const { width: effectiveLabelWidth, maxChars: tickMaxChars } =
    responsiveLabelSizing(desiredLabelWidth, containerWidth, lang);

  const cellFill = (entry, index) => {
    if (banded) return bandColor(entry.value, higherIsBetter);
    if (highlightLabels && highlightLabels.length > 0) {
      return highlightLabels.includes(entry.label) ? color : mutedColor;
    }
    if (colors && colors.length > 0) return colors[index % colors.length];
    return color;
  };

  return (
    <div ref={wrapRef}>
    <ResponsiveContainer width="100%" height={computedHeight}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 44, bottom: 4, left: 4 }}>
        <XAxis type="number" domain={[0, max]} hide />
        <YAxis
          type="category"
          dataKey="display"
          width={effectiveLabelWidth}
          tickLine={false}
          axisLine={false}
          tick={(props) => {
            const { x, y, payload } = props;
            const text = tickMaxChars ? truncate(payload.value, tickMaxChars) : payload.value;
            return (
              <text
                x={x} y={y} dy={4} textAnchor="end"
                className={isKhmer(payload.value) ? 'km' : ''}
                style={{ fontSize: 12, fill: COLORS.text }}
              >
                {text}
              </text>
            );
          }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(37,99,235,0.06)' }}
          formatter={(value, _name, item) => [
            unit === 'percent' ? formatPct(value) : unit === 'score' ? formatIndex(value) : formatNumber(value),
            item?.payload?.meta ?? valueLabel ?? (unit === 'count' ? t('studentsSeries') : t('score')),
          ]}
          labelFormatter={(_label, payload) => payload?.[0]?.payload?.label ?? ''}
        />
        <Bar dataKey="value" radius={[0, 3, 3, 0]} barSize={16} isAnimationActive={false}>
          {showValues ? (
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value) =>
                unit === 'percent' ? formatPct(value) : unit === 'score' ? formatIndex(value) : formatNumber(value)}
              style={{ fontSize: 12, fill: COLORS.text, fontWeight: 600 }}
            />
          ) : null}
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={cellFill(entry, index)}
              fillOpacity={fadeByRank ? rankOpacity(index, chartData.length) : undefined}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dot / lollipop — precise comparison of closely clustered values      */
/* ------------------------------------------------------------------ */

/**
 * A dot on a shared numeric axis reads small differences between close
 * values far better than a bar or a radar polygon does — use this when the
 * data clusters in a narrow band (e.g. several dimensions all scoring
 * 90–96) and the ranking chart would otherwise look like a wall of
 * near-identical bars.
 */
export function DotChart({
  data, height, labelWidth = 200, color = COLORS.blue, colors, domain, valueFormatter, valueLabel,
  showValues = false, showStem = true,
}) {
  const { lang, t } = useLanguage();
  const [wrapRef, containerWidth] = useElementWidth();
  const rows = data.filter((d) => d.value !== null);
  if (rows.length === 0) return <EmptyState />;

  const values = rows.map((d) => d.value);
  const domainMin = domain?.[0] ?? Math.max(0, Math.floor((Math.min(...values) - 3) / 5) * 5);
  const domainMax = domain?.[1] ?? 100;
  const computedHeight = height ?? Math.max(160, rows.length * 34 + 30);
  const formatValue = valueFormatter ?? ((v) => `${formatIndex(v)} / 100`);
  const effectiveValueLabel = valueLabel ?? t('score');
  const desiredLabelWidth = lang === 'kh' ? labelWidth + KHMER_LABEL_PAD : labelWidth;
  const { width: effectiveLabelWidth, maxChars: tickMaxChars } =
    responsiveLabelSizing(desiredLabelWidth, containerWidth, lang);

  return (
    <div ref={wrapRef}>
    <ResponsiveContainer width="100%" height={computedHeight}>
      <BarChart data={rows} layout="vertical" margin={{ top: 8, right: showValues ? 64 : 44, bottom: 4, left: 4 }}>
        <CartesianGrid horizontal={false} stroke={COLORS.border} />
        <XAxis type="number" domain={[domainMin, domainMax]} tick={AXIS} axisLine={GRID} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={effectiveLabelWidth}
          tickLine={false}
          axisLine={false}
          tick={(props) => {
            const { x, y, payload } = props;
            const text = tickMaxChars ? truncate(payload.value, tickMaxChars) : payload.value;
            return (
              <text
                x={x} y={y} dy={4} textAnchor="end"
                className={isKhmer(payload.value) ? 'km' : ''}
                style={{ fontSize: 12, fill: COLORS.text }}
              >
                {text}
              </text>
            );
          }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(37,99,235,0.06)' }}
          formatter={(value, _name, item) => [
            formatValue(value),
            item?.payload?.meta ?? effectiveValueLabel,
          ]}
          labelFormatter={(_label, payload) => payload?.[0]?.payload?.label ?? ''}
        />
        <Bar
          dataKey="value"
          barSize={16}
          isAnimationActive={false}
          shape={(props) => {
            const { x = 0, y = 0, width = 0, height: rowHeight = 0, index = 0, payload } = props;
            const cy = y + rowHeight / 2;
            const cx = x + width;
            const fill = colors && colors.length > 0 ? colors[index % colors.length] : color;
            return (
              <g>
                {showStem ? <line x1={x} y1={cy} x2={cx} y2={cy} stroke={fill} strokeWidth={2} /> : null}
                <circle cx={cx} cy={cy} r={6} fill={fill} stroke={COLORS.white} strokeWidth={1.5} />
                {showValues && payload?.value != null ? (
                  <text
                    x={cx + 12} y={cy} dy={4} textAnchor="start"
                    style={{ fontSize: 12, fontWeight: 600, fill: COLORS.text }}
                  >
                    {formatValue(payload.value)}
                  </text>
                ) : null}
              </g>
            );
          }}
        />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stacked distribution — response composition per indicator            */
/* ------------------------------------------------------------------ */

/**
 * `labels` must be supplied whenever the series are reversed — as on the risk
 * page, where the favourable answer is "no". A stacked chart whose legend
 * contradicts its colours is worse than no chart.
 */
export function StackedDistributionChart({ data, labelWidth = 200, labels, height }) {
  const { lang, t } = useLanguage();
  const [wrapRef, containerWidth] = useElementWidth();
  if (data.length === 0) return <EmptyState />;
  const computedHeight = height ?? Math.max(160, data.length * 30 + 44);
  const effectiveLabels = labels ?? { yes: t('improvedAgree'), noChange: t('noChange'), no: t('noDisagree') };
  const desiredLabelWidth = lang === 'kh' ? labelWidth + KHMER_LABEL_PAD : labelWidth;
  const { width: effectiveLabelWidth, maxChars: tickMaxChars } =
    responsiveLabelSizing(desiredLabelWidth, containerWidth, lang);

  return (
    <div ref={wrapRef}>
    <ResponsiveContainer width="100%" height={computedHeight}>
      <BarChart data={data} layout="vertical" stackOffset="expand"
        margin={{ top: 4, right: 12, bottom: 4, left: 4 }}>
        <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Math.round(v * 100)}%`} tick={AXIS} axisLine={GRID} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={effectiveLabelWidth}
          tickLine={false}
          axisLine={false}
          tick={(props) => {
            const { x, y, payload } = props;
            const text = tickMaxChars ? truncate(payload.value, tickMaxChars) : payload.value;
            return (
              <text x={x} y={y} dy={4} textAnchor="end" className={isKhmer(payload.value) ? 'km' : ''} style={{ fontSize: 12, fill: COLORS.text }}>
                {text}
              </text>
            );
          }}
        />
        <Tooltip formatter={(value, name) => [formatPct(value), name]} />
        <Legend iconType="square" wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
        <Bar dataKey="yesPct" name={effectiveLabels.yes} stackId="a" fill={COLORS.positive} barSize={16} isAnimationActive={false} />
        <Bar dataKey="noChangePct" name={effectiveLabels.noChange} stackId="a" fill={COLORS.warning} barSize={16} isAnimationActive={false} />
        <Bar dataKey="noPct" name={effectiveLabels.no} stackId="a" fill={COLORS.negative} barSize={16} radius={[0, 3, 3, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Vertical bars — counts across an ordered category                    */
/* ------------------------------------------------------------------ */

export function CountBarChart({
  data, height = 240, color = COLORS.blue, colors, showValues = false, angledLabels = false,
  valueKey, valueFormatter = formatNumber, tooltipLabel, domain, fadeByRank = false,
}) {
  const { lang, t } = useLanguage();
  if (data.length === 0) return <EmptyState />;
  const key = valueKey ?? 'students';
  const effectiveTooltipLabel = tooltipLabel ?? t('studentsSeries');
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: showValues ? 20 : 8, right: 8, bottom: angledLabels ? 56 : 4, left: angledLabels ? (lang === 'kh' ? 60 : 40) : 0 }}>
        <XAxis
          dataKey="label"
          tick={angledLabels
            ? (props) => {
                const { x, y, payload } = props;
                return (
                  <text
                    x={x} y={y} dy={10} textAnchor="end" transform={`rotate(-30 ${x} ${y})`}
                    className={isKhmer(payload.value) ? 'km' : ''}
                    style={{ fontSize: 11, fill: COLORS.secondary }}
                  >
                    {truncate(payload.value, lang === 'kh' ? 14 : 18)}
                  </text>
                );
              }
            : AXIS}
          interval={0}
          axisLine={GRID}
          tickLine={false}
        />
        <YAxis domain={domain} tick={AXIS} axisLine={false} tickLine={false} width={44} />
        <Tooltip formatter={(value) => [valueFormatter(value), effectiveTooltipLabel]} cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
        <Bar dataKey={key} radius={[3, 3, 0, 0]} maxBarSize={64} isAnimationActive={false}>
          {showValues ? (
            <LabelList
              dataKey={key}
              position="top"
              formatter={(value) => valueFormatter(value)}
              style={{ fontSize: 12, fill: COLORS.text, fontWeight: 600 }}
            />
          ) : null}
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={colors ? colors[index % colors.length] : color}
              fillOpacity={fadeByRank ? rankOpacity(index, data.length) : undefined}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Donut — simple composition, few categories                           */
/* ------------------------------------------------------------------ */

const DONUT_LABEL_RADIAN = Math.PI / 180;

/**
 * Leader-line percent label, drawn only for slices above `minLabelPercent` —
 * a donut with several very small slices (e.g. a long tail of minor
 * categories) would otherwise pile up unreadable, overlapping labels in one
 * corner. Small slices remain readable via the legend and tooltip instead.
 */
function renderDonutLabel(minLabelPercent) {
  return (props) => {
    const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, percent = 0 } = props;
    if (percent < minLabelPercent) return null;
    const sin = Math.sin(-DONUT_LABEL_RADIAN * midAngle);
    const cos = Math.cos(-DONUT_LABEL_RADIAN * midAngle);
    const sx = cx + outerRadius * cos;
    const sy = cy + outerRadius * sin;
    const mx = cx + (outerRadius + 12) * cos;
    const my = cy + (outerRadius + 12) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 12;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    return (
      <g>
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${my}`} stroke={COLORS.secondary} fill="none" />
        <text
          x={ex + (cos >= 0 ? 4 : -4)} y={my} textAnchor={textAnchor} dominantBaseline="central"
          style={{ fontSize: 12, fill: COLORS.text }}
        >
          {formatPct(percent * 100, 0)}
        </text>
      </g>
    );
  };
}

export function DonutChart({
  data, height = 240, colors = SERIES, centerValue, centerLabel, showPercentLabels = false, minLabelPercent = 0.04,
}) {
  if (data.length === 0) return <EmptyState />;
  const total = data.reduce((sum, d) => sum + d.students, 0);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data} dataKey="students" nameKey="label" innerRadius="55%" outerRadius="80%" paddingAngle={2}
          isAnimationActive={false}
          label={showPercentLabels ? renderDonutLabel(minLabelPercent) : false}
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={colors[index % colors.length]} stroke={COLORS.white} strokeWidth={2} />
          ))}
          {centerValue ? (
            <Label
              position="center"
              content={(props) => {
                // Recharts v3 resolves position="center" to the cartesian
                // (plot-area) viewBox {x,y,width,height} rather than the
                // pie's own {cx,cy} — fall back to the plot-area midpoint
                // so the label still lands in the donut's hole.
                const viewBox = props.viewBox ?? {};
                const cx = typeof viewBox.cx === 'number' ? viewBox.cx : (viewBox.x ?? 0) + (viewBox.width ?? 0) / 2;
                const cy = typeof viewBox.cy === 'number' ? viewBox.cy : (viewBox.y ?? 0) + (viewBox.height ?? 0) / 2;
                return (
                  <g>
                    <text x={cx} y={cy - (centerLabel ? 6 : 0)} textAnchor="middle" dominantBaseline="middle"
                      style={{ fontSize: 22, fontWeight: 600, fill: COLORS.text }}>
                      {centerValue}
                    </text>
                    {centerLabel ? (
                      <text x={cx} y={cy + 15} textAnchor="middle" dominantBaseline="middle"
                        style={{ fontSize: 11, fill: COLORS.secondary }}>
                        {centerLabel}
                      </text>
                    ) : null}
                  </g>
                );
              }}
            />
          ) : null}
        </Pie>
        <Tooltip
          formatter={(value, name) => [
            `${formatNumber(value)} (${formatPct(total ? (value / total) * 100 : null)})`, name,
          ]}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Radar — multi-indicator profile shape, few enough axes to read       */
/* ------------------------------------------------------------------ */

export function SkillRadarChart({ data, height = 340, color = COLORS.blue }) {
  const rows = data.filter((d) => d.value !== null);
  if (rows.length === 0) return <EmptyState />;
  const chartData = rows.map((d) => ({ ...d, axis: truncate(d.label, 16) }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={chartData} outerRadius="70%">
        <PolarGrid stroke={COLORS.border} />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fontSize: 11, fill: COLORS.text }}
        />
        <PolarRadiusAxis domain={[0, 100]} tickCount={5} axisLine={false} tick={{ fontSize: 10, fill: COLORS.secondary }} />
        <Tooltip
          formatter={(value) => [`${formatIndex(value)} / 100`, 'Score']}
          labelFormatter={(_label, payload) => payload?.[0]?.payload?.label ?? ''}
        />
        <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.28} strokeWidth={2} isAnimationActive={false} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Grouped bars — several measures across the same categories           */
/* ------------------------------------------------------------------ */

export function GroupedBarChart({ data, series, height = 280, domain = [0, 100], unit = 'percent' }) {
  if (data.length === 0) return <EmptyState />;
  const formatValue = (v) =>
    (unit === 'percent' ? formatPct(v) : unit === 'score' ? formatIndex(v) : formatNumber(v));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
        <XAxis dataKey="label" tick={AXIS} axisLine={GRID} tickLine={false} />
        <YAxis domain={domain} tick={AXIS} axisLine={false} tickLine={false} width={44}
          tickFormatter={(v) => (unit === 'count' ? formatNumber(v) : `${v}`)} />
        <Tooltip formatter={(value, name) => [formatValue(value), name]}
          cursor={{ fill: 'rgba(37,99,235,0.06)' }} />
        <Legend iconType="square" wrapperStyle={{ fontSize: 12, paddingTop: 4 }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[3, 3, 0, 0]} maxBarSize={40} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Heatmap — school x indicator comparison                              */
/* ------------------------------------------------------------------ */

export function Heatmap({ columns, rows, rowLabel = 'School' }) {
  if (rows.length === 0 || columns.length === 0) return <EmptyState />;

  const values = rows.flatMap((r) => columns.map((c) => r.cells[c])).filter((v) => v !== null);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-small">
        <caption className="sr-only">{rowLabel} by dimension, index score out of 100</caption>
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 z-10 bg-white p-2 text-left font-medium text-muted">{rowLabel}</th>
            <th scope="col" className="p-2 text-right font-medium text-muted">n</th>
            {columns.map((column) => (
              <th key={column} scope="col" className="p-2 text-center font-medium text-muted">{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.school} className="border-t border-line">
              <th scope="row" className="km sticky left-0 z-10 bg-white p-2 text-left font-normal">
                {shortSchool(row.school, 30)}
              </th>
              <td className="p-2 text-right tabular-nums text-muted">{formatNumber(row.students)}</td>
              {columns.map((column) => {
                const value = row.cells[column];
                return (
                  <td key={column} className="p-1">
                    <div
                      className="rounded px-2 py-1.5 text-center tabular-nums"
                      style={{
                        backgroundColor: heatColor(value, min, max),
                        color: value !== null && value > (min + max) / 2 ? '#FFFFFF' : COLORS.text,
                      }}
                      title={`${row.school} · ${column}: ${formatPct(value)}`}
                    >
                      {value === null ? '—' : value.toFixed(1)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-small text-muted">
        Scale {min.toFixed(1)} – {max.toFixed(1)} (index out of 100). Darker is stronger.
      </p>
    </div>
  );
}
