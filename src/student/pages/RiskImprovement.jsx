import { ChartCard } from '../components/ChartCard';
import { ChartGrid, KpiGrid } from '../components/Section';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { EmptyState, ErrorState, LoadingPage } from '../components/StateViews';
import { CountBarChart, RankedBarChart, StackedDistributionChart } from '../charts';
import { useApi } from '../hooks/useApi';
import { useFilters } from '../hooks/useFilters';
import { formatNumber, formatPct } from '../lib/format';
import { COLORS, RISK_KPI_COLORS } from '../lib/colors';
import { useLanguage } from '../lib/i18n';

export function RiskImprovementPage() {
  const { filters } = useFilters();
  const { data, loading, error } = useApi('/api/risk', filters);
  const { t, td } = useLanguage();

  if (error) return <ErrorState message={error} />;
  if (loading || !data) return <LoadingPage />;

  const { headline, kpis } = data;
  const topChallenge = data.challengeThemes[0];
  const topImprovement = data.improvementThemes[0];
  const negativeImpactHeight = 300;

  return (
    <>
      <PageHeader title={t('pageRisk')} students={headline.students} schools={headline.schools} />

      <KpiGrid>
        <KpiCard
          label={t('negativeImpactRate')} value={formatPct(kpis.negativeImpactRate)}
          accentColor={RISK_KPI_COLORS[0]}
        />
        <KpiCard
          label={t('academicPressure')} value={formatPct(kpis.academicPressureRate)}
          accentColor={RISK_KPI_COLORS[1]}
        />
        <KpiCard
          label={t('subjectTradeoff')} value={formatPct(kpis.subjectTradeoffRate)}
          accentColor={RISK_KPI_COLORS[2]}
        />
        <KpiCard
          label={t('studentsReportingChallenges')} value={formatNumber(kpis.studentsReportingChallenges)}
          unit={formatPct(kpis.challengeReportingRate)}
          stackUnit
          accentColor={RISK_KPI_COLORS[3]}
        />
        <KpiCard
          label={t('topChallenge')} value={topChallenge ? td(topChallenge.theme) : '—'}
          unit={topChallenge ? formatNumber(topChallenge.students) : undefined}
          stackUnit
          accentColor={RISK_KPI_COLORS[4]}
        />
        <KpiCard
          label={t('topImprovementRequest')} value={topImprovement ? td(topImprovement.theme) : '—'}
          unit={topImprovement ? formatNumber(topImprovement.students) : undefined}
          stackUnit
          accentColor={RISK_KPI_COLORS[5]}
        />
      </KpiGrid>

      <div className="mt-6 space-y-4">
        <div className="space-y-4">
          <ChartGrid cols={2}>
            <ChartCard title={t('reportedNegativeImpacts')}>
              {data.negativeImpactThemes.length === 0 ? (
                <EmptyState />
              ) : (
                <CountBarChart
                  data={data.negativeImpactThemes.map((theme) => ({ label: td(theme.theme), students: theme.students }))}
                  color={COLORS.negative}
                  angledLabels
                  showValues
                  height={negativeImpactHeight}
                />
              )}
            </ChartCard>
            <ChartCard title={t('riskResponseDistribution')}>
              <StackedDistributionChart
                data={data.riskIndicators.map((i) => ({
                  label: td(i.label),
                  yesPct: i.noPct,
                  noChangePct: i.noChangePct,
                  noPct: i.yesPct,
                }))}
                labelWidth={200}
                height={negativeImpactHeight}
                labels={{
                  yes: t('noNegativeEffect'),
                  noChange: t('sameAsBefore'),
                  no: t('reportsThisEffect'),
                }}
              />
            </ChartCard>
          </ChartGrid>
        </div>

        <div className="space-y-4">
          <ChartGrid cols={2}>
            <ChartCard title={t('challenges')}>
              {data.challengeThemes.length === 0 ? (
                <EmptyState />
              ) : (
                <RankedBarChart
                  data={data.challengeThemes.map((theme) => ({
                    label: td(theme.theme), value: theme.students, meta: `${formatPct(theme.studentShare)} ${t('ofStudents')}`,
                  }))}
                  unit="count"
                  color={COLORS.warning}
                  labelWidth={200}
                  height={200}
                  showValues
                  fadeByRank
                />
              )}
            </ChartCard>
            <ChartCard title={t('improvementPriorities')}>
              {data.improvementThemes.length === 0 ? (
                <EmptyState />
              ) : (
                <RankedBarChart
                  data={data.improvementThemes.map((theme) => ({
                    label: td(theme.theme), value: theme.students, meta: `${formatPct(theme.studentShare)} ${t('ofStudents')}`,
                  }))}
                  unit="count"
                  color={RISK_KPI_COLORS[5]}
                  labelWidth={200}
                  height={200}
                  showValues
                  fadeByRank
                />
              )}
            </ChartCard>
          </ChartGrid>
        </div>
      </div>
    </>
  );
}
