import { bandColor, COLORS, tint } from '../lib/colors';
import { InfoTooltip } from './InfoTooltip';

/**
 * A single headline number. `value` is always the big bold figure, at the
 * same size on every card — nothing shrinks or gets clamped, so a long name
 * simply wraps across more lines rather than losing words or reading as a
 * mismatched size. `unit`, when present, is always the small muted one —
 * inline by default, or on its own centered line when `stackUnit` is set.
 */
export function KpiCard({
  label, value, unit, band, higherIsBetter = true, accentColor, tooltip, stackUnit = false,
}) {
  const accent = accentColor ?? (band === undefined ? COLORS.border : bandColor(band, higherIsBetter));
  return (
    <div className="card flex flex-col overflow-hidden" style={{ backgroundColor: tint(accent, 0.05) }}>
      <div style={{ backgroundColor: accent, height: 3 }} />
      <div className="card-pad flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex items-center justify-center gap-1.5">
          <p className="text-small text-muted">{label}</p>
          {tooltip ? <InfoTooltip text={tooltip} /> : null}
        </div>
        <p className="mt-1.5 text-kpi-sm tabular-nums">
          {value}
          {unit && !stackUnit ? <span className="ml-1.5 text-small font-medium text-muted">{unit}</span> : null}
        </p>
        {unit && stackUnit ? <p className="mt-1 text-small font-medium text-muted">{unit}</p> : null}
      </div>
    </div>
  );
}
