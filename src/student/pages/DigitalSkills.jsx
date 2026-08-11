import { ChartCard } from '../components/ChartCard';
import { ChartGrid, KpiGrid } from '../components/Section';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { ErrorState, LoadingPage } from '../components/StateViews';
import { CountBarChart, DotChart, RankedBarChart, StackedDistributionChart } from '../charts';
import { useApi } from '../hooks/useApi';
import { useFilters } from '../hooks/useFilters';
import { formatIndex, formatNumber, formatPct } from '../lib/format';
import { DIGITAL_KPI_COLORS, SERIES, SUBJECT_COLORS, sequentialColor } from '../lib/colors';
import { useLanguage } from '../lib/i18n';

/** Folded into "Gemini": the dedicated Gemini classification plus general Google mentions. */
const GEMINI_ALIASES = new Set(['Google Gemini', 'Gemini', 'Google (General Search/Suite)']);

function standardizeAiTools(themes) {
  const merged = new Map();
  for (const t of themes) {
    const label = GEMINI_ALIASES.has(t.theme) ? 'Gemini' : t.theme;
    const existing = merged.get(label);
    merged.set(label, existing ? {
      theme: label,
      students: existing.students + t.students,
      occurrences: existing.occurrences + t.occurrences,
      studentShare: (existing.studentShare ?? 0) + (t.studentShare ?? 0),
      respondentShare: (existing.respondentShare ?? 0) + (t.respondentShare ?? 0),
    } : { ...t, theme: label });
  }
  return [...merged.values()].sort((a, b) => b.students - a.students);
}

export function DigitalSkillsPage() {
  const { filters } = useFilters();
  const { data, loading, error } = useApi('/api/digital-skills', filters);
  const { t, td } = useLanguage();

  if (error) return <ErrorState message={error} />;
  if (loading || !data) return <LoadingPage />;

  const { headline, kpis } = data;
  const widestGap = data.skillGaps[0];

  const aiTools = standardizeAiTools(data.aiTools);
  const maxAiToolStudents = Math.max(...aiTools.map((tool) => tool.students), 0);
  // Round up to a clean multiple of 100 so the axis never shows floating-point noise.
  const aiToolsDomainMax = Math.ceil((maxAiToolStudents * 1.15) / 100) * 100;

  return (
    <>
      <PageHeader title={t('pageDigitalSkills')} students={headline.students} schools={headline.schools} />

      <KpiGrid>
        <KpiCard
          label={t('digitalSkillsIndex')} value={formatIndex(kpis.digitalSkillsIndex)} unit="/100"
          accentColor={DIGITAL_KPI_COLORS[0]}
        />
        <KpiCard
          label={t('aiAdoptionRate')} value={formatPct(kpis.aiAdoptionRate)}
          accentColor={DIGITAL_KPI_COLORS[1]}
        />
        <KpiCard
          label={t('codingSkillsImprovement')} value={formatPct(kpis.codingRate)}
          accentColor={DIGITAL_KPI_COLORS[2]}
        />
        <KpiCard
          label={t('internetSafety')} value={formatPct(kpis.internetSafetyRate)}
          accentColor={DIGITAL_KPI_COLORS[3]}
        />
        <KpiCard
          label={t('independentOnlineLearning')} value={formatPct(kpis.independentOnlineLearningRate)}
          accentColor={DIGITAL_KPI_COLORS[4]}
        />
        <KpiCard
          label={t('widestSkillGap')} value={widestGap ? td(widestGap.label) : '—'}
          unit={widestGap ? formatIndex(widestGap.gap) : undefined}
          stackUnit
          accentColor={DIGITAL_KPI_COLORS[5]}
        />
      </KpiGrid>

      <div className="mt-6 space-y-4">
        <ChartGrid cols={2}>
          <ChartCard title={t('digitalSkillsChart')}>
            <RankedBarChart
              data={data.indicators.map((i) => ({ label: td(i.label), value: i.score }))}
              unit="score"
              colors={data.indicators.map((_, i) => sequentialColor(i, data.indicators.length))}
              labelWidth={220}
              height={300}
              showValues
            />
          </ChartCard>
          <ChartCard title={t('skillResponseDistribution')}>
            <StackedDistributionChart
              data={data.indicators.map((i) => ({
                label: td(i.label), yesPct: i.yesPct, noChangePct: i.noChangePct, noPct: i.noPct,
              }))}
              labelWidth={220}
            />
          </ChartCard>
        </ChartGrid>

        <ChartGrid cols={2}>
          <ChartCard title={t('mostUsedAiTools')}>
            <DotChart
              data={aiTools.map((tool) => ({
                label: td(tool.theme), value: tool.students, meta: `${formatPct(tool.respondentShare)} ${t('ofAiUsers')}`,
              }))}
              colors={SERIES}
              domain={[0, aiToolsDomainMax]}
              valueFormatter={formatNumber}
              valueLabel={t('studentsSeries')}
              labelWidth={200}
              height={260}
              showValues
            />
          </ChartCard>
          <ChartCard title={t('preferredDigitalSubjects')}>
            <CountBarChart
              data={data.favoriteSubjects.map((subject) => ({ label: td(subject.theme), students: subject.students }))}
              colors={SUBJECT_COLORS}
              angledLabels
              showValues
              height={260}
            />
          </ChartCard>
        </ChartGrid>
      </div>
    </>
  );
}
