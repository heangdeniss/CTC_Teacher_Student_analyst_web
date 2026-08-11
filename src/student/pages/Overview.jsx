import { ChartCard } from '../components/ChartCard';
import { ChartGrid, KpiGrid } from '../components/Section';
import { InsightPanel } from '../components/InsightPanel';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { ErrorState, LoadingPage } from '../components/StateViews';
import { CountBarChart, DonutChart, DotChart } from '../charts';
import { useApi } from '../hooks/useApi';
import { useFilters } from '../hooks/useFilters';
import { CATEGORY, COLORS, GRADE_COLORS, SERIES } from '../lib/colors';
import { formatIndex, formatNumber, formatPct } from '../lib/format';
import { useLanguage } from '../lib/i18n';

export function OverviewPage() {
  const { filters } = useFilters();
  const { data, loading, error } = useApi('/api/overview', filters);
  // Reuses the Student Profile page's existing endpoint/calculation for the
  // one compact demographic chart kept here, rather than duplicating it.
  const { data: profile, loading: profileLoading } = useApi('/api/profile', filters);
  const { t, td } = useLanguage();

  if (error) return <ErrorState message={error} />;
  if (loading || !data || profileLoading || !profile) return <LoadingPage />;

  const { headline, keyInsights } = data;
  const byGrade = [...profile.byGrade].sort((a, b) => b.students - a.students).map((g) => ({ ...g, label: td(g.label) }));
  const maxImprovementStudents = Math.max(...data.improvementThemes.map((t) => t.students), 0);
  // Round up to a clean multiple of 100 so the axis never shows floating-point noise.
  const improvementDomainMax = Math.ceil((maxImprovementStudents * 1.15) / 100) * 100;

  const insights = [
    {
      kind: 'strength',
      title: keyInsights.strongestOutcome ? td(keyInsights.strongestOutcome.label) : '—',
      value: keyInsights.strongestOutcome ? `${formatIndex(keyInsights.strongestOutcome.value)}/100` : '—',
    },
    {
      kind: 'weakness',
      title: keyInsights.weakestOutcome ? td(keyInsights.weakestOutcome.label) : '—',
      value: keyInsights.weakestOutcome ? `${formatIndex(keyInsights.weakestOutcome.value)}/100` : '—',
    },
    {
      kind: 'risk',
      title: td(keyInsights.majorRisk.label),
      value: formatPct(keyInsights.majorRisk.value),
    },
    {
      kind: 'improvement',
      title: keyInsights.topImprovement ? td(keyInsights.topImprovement.label) : '—',
      value: keyInsights.topImprovement ? `${formatNumber(keyInsights.topImprovement.value)} ${t('students')}` : '—',
    },
  ];

  const adopters = headline.aiAdoptionRate !== null && headline.students
    ? Math.round((headline.aiAdoptionRate / 100) * headline.students)
    : 0;
  const aiDonutData = headline.students
    ? [
        { label: t('canUseAiTools'), students: adopters },
        { label: t('cannotUseAiTools'), students: Math.max(headline.students - adopters, 0) },
      ]
    : [];

  return (
    <>
      <PageHeader title={t('pageOverview')} students={headline.students} schools={headline.schools} />

      <KpiGrid>
        <KpiCard label={t('totalStudents')} value={formatNumber(headline.students)} accentColor={CATEGORY.general} />
        <KpiCard label={t('schools')} value={formatNumber(headline.schools)} accentColor={CATEGORY.reach} />
        <KpiCard
          label={t('studentOutcomeIndex')} value={formatIndex(headline.studentImpactIndex)} unit="/100"
          accentColor={CATEGORY.impact}
          tooltip={t('tooltipStudentOutcomeIndex')}
        />
        <KpiCard
          label={t('digitalSkillsIndex')} value={formatIndex(headline.digitalSkillsIndex)} unit="/100"
          accentColor={CATEGORY.digital}
          tooltip={t('tooltipDigitalSkillsIndex')}
        />
        <KpiCard
          label={t('learningExperienceIndex')} value={formatIndex(headline.learningExperienceIndex)} unit="/100"
          accentColor={CATEGORY.experience}
          tooltip={t('tooltipLearningExperienceIndex')}
        />
        <KpiCard
          label={t('aiAdoptionRate')} value={formatPct(headline.aiAdoptionRate)}
          accentColor={CATEGORY.ai}
          tooltip={t('tooltipAiAdoptionRate')}
        />
      </KpiGrid>

      <div className="mt-4">
        <InsightPanel insights={insights} />
      </div>

      <div className="mt-6 space-y-4">
        <ChartCard title={t('topImprovementPriorities')}>
          <DotChart
            data={data.improvementThemes.map((theme) => ({
              label: td(theme.theme), value: theme.students, meta: `${formatPct(theme.studentShare)} ${t('ofStudents')}`,
            }))}
            colors={SERIES}
            domain={[0, improvementDomainMax]}
            valueFormatter={formatNumber}
            valueLabel={t('studentsSeries')}
            labelWidth={230}
            showValues
            showStem={false}
          />
        </ChartCard>

        <ChartGrid cols={2}>
          <ChartCard title={t('aiAdoption')}>
            <DonutChart
              data={aiDonutData}
              colors={[CATEGORY.ai, COLORS.secondary]}
              centerValue={formatPct(headline.aiAdoptionRate)}
              centerLabel={t('ofStudents')}
              height={180}
            />
          </ChartCard>
          <ChartCard title={t('studentsByGrade')}>
            <CountBarChart data={byGrade} colors={GRADE_COLORS} showValues height={180} />
          </ChartCard>
        </ChartGrid>
      </div>
    </>
  );
}
