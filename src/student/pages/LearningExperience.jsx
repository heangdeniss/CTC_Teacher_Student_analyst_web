import { ChartCard } from '../components/ChartCard';
import { ChartGrid, KpiGrid } from '../components/Section';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { ErrorState, LoadingPage } from '../components/StateViews';
import { RankedBarChart, StackedDistributionChart } from '../charts';
import { useApi } from '../hooks/useApi';
import { useFilters } from '../hooks/useFilters';
import { formatIndex, formatNumber, formatPct } from '../lib/format';
import { LEARNING_KPI_COLORS, sequentialColor } from '../lib/colors';
import { useLanguage } from '../lib/i18n';

/** Indicator lists arrive pre-sorted by score descending. */
const weakest = (indicators) => (indicators.length === 0 ? undefined : indicators[indicators.length - 1]);

export function LearningExperiencePage() {
  const { filters } = useFilters();
  const { data, loading, error } = useApi('/api/learning-experience', filters);
  const { t, td } = useLanguage();

  if (error) return <ErrorState message={error} />;
  if (loading || !data) return <LoadingPage />;

  const { headline, kpis, indicators } = data;
  const weakestIndicator = weakest(indicators);

  return (
    <>
      <PageHeader title={t('pageLearningExperience')} students={headline.students} schools={headline.schools} />

      <KpiGrid>
        <KpiCard
          label={t('learningExperienceIndex')} value={formatIndex(kpis.learningExperienceIndex)} unit="/ 100"
          accentColor={LEARNING_KPI_COLORS[0]}
        />
        <KpiCard
          label={t('infrastructure')} value={formatIndex(kpis.infrastructure)} unit="/ 100"
          accentColor={LEARNING_KPI_COLORS[1]}
        />
        <KpiCard
          label={t('teacherSupport')} value={formatIndex(kpis.teacherSupport)} unit="/ 100"
          accentColor={LEARNING_KPI_COLORS[2]}
        />
        <KpiCard
          label={t('studentEngagement')} value={formatIndex(kpis.studentEngagement)} unit="/ 100"
          accentColor={LEARNING_KPI_COLORS[3]}
        />
        <KpiCard
          label={t('practicalLearning')} value={formatIndex(kpis.practicalLearning)} unit="/ 100"
          accentColor={LEARNING_KPI_COLORS[4]}
        />
        <KpiCard
          label={t('weakestIndicator')} value={weakestIndicator ? td(weakestIndicator.label) : '—'}
          unit={weakestIndicator ? formatIndex(weakestIndicator.score) : undefined}
          stackUnit
          accentColor={LEARNING_KPI_COLORS[5]}
        />
      </KpiGrid>

      <div className="mt-6 space-y-4">
        <ChartGrid cols={2}>
          <ChartCard title={t('learningIndicators')}>
            <RankedBarChart
              data={indicators.map((i) => ({
                label: td(i.label), value: i.score, meta: `${formatPct(i.yesPct)} ${t('agreeShort')} · n=${formatNumber(i.responses)}`,
              }))}
              unit="score"
              colors={indicators.map((_, i) => sequentialColor(i, indicators.length))}
              labelWidth={210}
              showValues
            />
          </ChartCard>
          <ChartCard title={t('responseDistribution')}>
            <StackedDistributionChart
              data={indicators.map((i) => ({
                label: td(i.label), yesPct: i.yesPct, noChangePct: i.noChangePct, noPct: i.noPct,
              }))}
              labelWidth={210}
            />
          </ChartCard>
        </ChartGrid>
      </div>
    </>
  );
}
