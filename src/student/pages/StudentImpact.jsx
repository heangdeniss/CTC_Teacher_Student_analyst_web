import { ChartCard } from '../components/ChartCard';
import { ChartGrid, KpiGrid } from '../components/Section';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { ErrorState, LoadingPage } from '../components/StateViews';
import { DotChart, RankedBarChart, StackedDistributionChart } from '../charts';
import { useApi } from '../hooks/useApi';
import { useFilters } from '../hooks/useFilters';
import { formatIndex, formatNumber, formatPct } from '../lib/format';
import { IMPACT_KPI_COLORS, SERIES, sequentialColor } from '../lib/colors';
import { useLanguage } from '../lib/i18n';

export function StudentImpactPage() {
  const { filters } = useFilters();
  const { data, loading, error } = useApi('/api/impact', filters);
  const { t, td } = useLanguage();

  if (error) return <ErrorState message={error} />;
  if (loading || !data) return <LoadingPage />;

  const { headline, kpis } = data;
  const maxThemeStudents = Math.max(...data.positiveThemes.map((theme) => theme.students), 0);
  // Round up to a clean multiple of 100 so the axis never shows floating-point noise (e.g. 1647.9499999999998).
  const themeDomainMax = Math.ceil((maxThemeStudents * 1.15) / 100) * 100;

  return (
    <>
      <PageHeader title={t('pageImpact')} students={headline.students} schools={headline.schools} />

      <KpiGrid>
        <KpiCard
          label={t('studentOutcomeIndex')} value={formatIndex(kpis.studentImpactIndex)} unit="/ 100"
          accentColor={IMPACT_KPI_COLORS[0]}
        />
        <KpiCard
          label={t('learningMotivation')} value={formatIndex(kpis.learningMotivation)} unit="/ 100"
          accentColor={IMPACT_KPI_COLORS[1]}
        />
        <KpiCard
          label={t('stemInterest')} value={formatIndex(kpis.stemInterest)} unit="/ 100"
          accentColor={IMPACT_KPI_COLORS[2]}
        />
        <KpiCard
          label={t('independentLearning')} value={formatIndex(kpis.independentLearning)} unit="/ 100"
          accentColor={IMPACT_KPI_COLORS[3]}
        />
        <KpiCard
          label={t('futureConfidence')} value={formatIndex(kpis.futureConfidence)} unit="/ 100"
          accentColor={IMPACT_KPI_COLORS[4]}
        />
        <KpiCard
          label={t('universityAspiration')} value={formatIndex(kpis.universityAspiration)} unit="/ 100"
          accentColor={IMPACT_KPI_COLORS[5]}
        />
      </KpiGrid>

      <div className="mt-6 space-y-4">
        <ChartGrid cols={2}>
          <ChartCard title={t('positiveOutcomeIndicators')}>
            <RankedBarChart
              data={data.indicators.map((i) => ({ label: td(i.label), value: i.score }))}
              unit="score"
              colors={data.indicators.map((_, i) => sequentialColor(i, data.indicators.length))}
              labelWidth={230}
              showValues
            />
          </ChartCard>
          <ChartCard title={t('responseDistribution')}>
            <StackedDistributionChart
              data={data.indicators.map((i) => ({
                label: td(i.label), yesPct: i.yesPct, noChangePct: i.noChangePct, noPct: i.noPct,
              }))}
            />
          </ChartCard>
        </ChartGrid>

        <ChartCard title={t('positiveImpactThemes')}>
          <DotChart
            data={data.positiveThemes.map((theme) => ({
              label: td(theme.theme), value: theme.students, meta: `${formatPct(theme.studentShare)} ${t('ofStudents')}`,
            }))}
            colors={SERIES}
            domain={[0, themeDomainMax]}
            valueFormatter={formatNumber}
            valueLabel={t('studentsSeries')}
            labelWidth={230}
            showValues
          />
        </ChartCard>
      </div>
    </>
  );
}
