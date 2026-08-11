import { AlertTriangle, ArrowUpRight, TrendingDown, Wrench } from 'lucide-react';
import { CATEGORY, COLORS, tint } from '../lib/colors';
import { useLanguage } from '../lib/i18n';

const STYLE = {
  strength: { icon: ArrowUpRight, color: COLORS.positive, headingKey: 'strongestOutcome' },
  weakness: { icon: TrendingDown, color: COLORS.warning, headingKey: 'needsAttention' },
  risk: { icon: AlertTriangle, color: COLORS.negative, headingKey: 'majorRisk' },
  improvement: { icon: Wrench, color: CATEGORY.improvement, headingKey: 'topImprovementPriority' },
};

/** Key Insights: computed from the same payload that drives the charts. */
export function InsightPanel({ insights }) {
  const { t } = useLanguage();
  return (
    <section className="card card-pad">
      <h3 className="text-section-title">{t('keyInsights')}</h3>
      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight) => {
          const { icon: Icon, color, headingKey } = STYLE[insight.kind];
          const heading = t(headingKey);
          return (
            <li
              key={insight.kind}
              className="flex flex-col items-center rounded-md border border-line p-4 text-center"
              style={{ backgroundColor: tint(color, 0.06) }}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className="h-4 w-4" style={{ color }} aria-hidden />
                <span className="text-small font-medium text-muted">{heading}</span>
              </div>
              <p className="mt-2 text-[15px] font-medium leading-snug">{insight.title}</p>
              <p className="mt-1 text-kpi-sm tabular-nums" style={{ color }}>{insight.value}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
