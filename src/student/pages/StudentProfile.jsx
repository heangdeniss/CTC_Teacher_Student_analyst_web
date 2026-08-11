import { ChartCard } from '../components/ChartCard';
import { ChartGrid, KpiGrid } from '../components/Section';
import { KpiCard } from '../components/KpiCard';
import { PageHeader } from '../components/PageHeader';
import { ErrorState, LoadingPage } from '../components/StateViews';
import { DataTable, TextCell } from '../components/DataTable';
import { CountBarChart, DonutChart, DotChart } from '../charts';
import { useApi } from '../hooks/useApi';
import { useFilters } from '../hooks/useFilters';
import { formatNumber, formatPct } from '../lib/format';
import { attentionTint, CATEGORY, GENDER_COLORS } from '../lib/colors';
import { useLanguage } from '../lib/i18n';

const DEVICE_COLORS = [CATEGORY.deviceSmartphone, CATEGORY.deviceComputer, CATEGORY.deviceTablet, CATEGORY.deviceNone];
const SERVICE_COLORS = [CATEGORY.deviceSmartphone, CATEGORY.deviceComputer, CATEGORY.deviceTablet, CATEGORY.deviceNone];

export function StudentProfilePage() {
  const { filters } = useFilters();
  const { data, loading, error } = useApi('/api/profile', filters);
  const { t, td } = useLanguage();

  if (error) return <ErrorState message={error} />;
  if (loading || !data) return <LoadingPage />;

  const { headline } = data;
  const topGrade = [...data.byGrade].sort((a, b) => b.students - a.students)[0];
  const topGender = [...data.byGender].sort((a, b) => b.students - a.students)[0];
  const noDeviceRate = data.deviceAccess.find((d) => d.label === 'No personal device')?.rate ?? null;
  const deviceAccess = [...data.deviceAccess].sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));
  const byAge = [...data.byAge].sort((a, b) => b.students - a.students).map((a) => ({ ...a, label: td(a.label) }));
  const byGender = data.byGender.map((g) => ({ ...g, label: td(g.label) }));
  const maxNoDevice = Math.max(...data.deviceAccessBySchool.map((r) => r.none ?? 0), 0);

  const schoolColumns = [
    { key: 'school', header: t('filterSchool'), render: (row) => <TextCell value={row.label} /> },
    { key: 'students', header: t('tableStudents'), align: 'right', render: (row) => formatNumber(row.students) },
    {
      key: 'share',
      header: t('tablePercentOfStudents'),
      align: 'right',
      render: (row) => formatPct(headline.students ? (row.students / headline.students) * 100 : null),
    },
  ];

  const deviceColumns = [
    { key: 'school', header: t('filterSchool'), render: (row) => <TextCell value={row.label} /> },
    { key: 'students', header: t('tableStudents'), align: 'right', render: (row) => formatNumber(row.students) },
    { key: 'computer', header: t('tableComputer'), align: 'right', render: (row) => formatPct(row.computer) },
    { key: 'smartphone', header: t('tableSmartphone'), align: 'right', render: (row) => formatPct(row.smartphone) },
    { key: 'tablet', header: t('tableTablet'), align: 'right', render: (row) => formatPct(row.tablet) },
    {
      key: 'none',
      header: t('tableNoDevice'),
      align: 'right',
      render: (row) => (
        <span
          className="rounded px-1.5 py-0.5"
          style={{ backgroundColor: attentionTint(row.none, maxNoDevice) }}
        >
          {formatPct(row.none)}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader title={t('pageProfile')} students={headline.students} schools={headline.schools} />

      <KpiGrid>
        <KpiCard label={t('totalStudents')} value={formatNumber(headline.students)} accentColor={CATEGORY.general} />
        <KpiCard label={t('schools')} value={formatNumber(headline.schools)} accentColor={CATEGORY.school} />
        <KpiCard label={t('largestGradeGroup')} value={topGrade ? td(topGrade.label) : '—'} accentColor={CATEGORY.grade} />
        <KpiCard label={t('largestGenderGroup')} value={topGender ? td(topGender.label) : '—'} accentColor={CATEGORY.gender} />
        <KpiCard
          label={t('personalDeviceAccess')} value={formatPct(headline.deviceAccessRate)}
          accentColor={CATEGORY.deviceComputer}
          tooltip={t('tooltipPersonalDeviceAccess')}
        />
        <KpiCard
          label={t('studentsWithoutDevice')} value={formatPct(noDeviceRate)}
          accentColor={CATEGORY.deviceNone}
          tooltip={t('tooltipStudentsWithoutDevice')}
        />
      </KpiGrid>

      <div className="mt-6 space-y-4">
        <ChartGrid cols={2}>
          <ChartCard title={t('studentsByGender')}>
            <DonutChart data={byGender} colors={GENDER_COLORS} showPercentLabels height={260} />
          </ChartCard>
          <ChartCard title={t('studentsByAge')}>
            <CountBarChart data={byAge} color={CATEGORY.age} showValues height={260} />
          </ChartCard>
        </ChartGrid>

        <ChartCard title={t('studentsBySchool')}>
          <DataTable columns={schoolColumns} rows={data.bySchool} keyOf={(row) => row.label} maxHeight={420} />
        </ChartCard>

        <ChartGrid cols={2}>
          <ChartCard title={t('personalDeviceAccess')}>
            <CountBarChart
              data={deviceAccess.map((d) => ({ label: td(d.label), rate: d.rate ?? 0 }))}
              valueKey="rate"
              valueFormatter={formatPct}
              tooltipLabel={t('shareOfStudents')}
              domain={[0, 100]}
              colors={DEVICE_COLORS}
              angledLabels
              showValues
              height={240}
            />
          </ChartCard>
          <ChartCard title={t('centreServiceUse')}>
            <DotChart
              data={data.serviceUse.map((d) => ({ label: td(d.label), value: d.rate }))}
              colors={SERVICE_COLORS}
              labelWidth={130}
              valueFormatter={formatPct}
              valueLabel={t('shareOfStudents')}
              domain={[0, 100]}
              height={240}
              showValues
            />
          </ChartCard>
        </ChartGrid>

        <ChartCard title={t('deviceAccessBySchool')}>
          <DataTable columns={deviceColumns} rows={data.deviceAccessBySchool} keyOf={(row) => row.label} maxHeight={420} />
        </ChartCard>
      </div>
    </>
  );
}
