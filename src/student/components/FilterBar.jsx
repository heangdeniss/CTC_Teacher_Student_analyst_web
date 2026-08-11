import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { MultiSelect } from './MultiSelect';
import { useFilters } from '../hooks/useFilters';
import { shortSchool } from '../lib/format';
import { useLanguage } from '../lib/i18n';

/** Global slicer bar. Present on every page; drives every KPI and chart. */
export function FilterBar() {
  const { filters, options, optionsLoading, activeCount, toggle, clear, resetAll } = useFilters();
  const { t, td } = useLanguage();

  const schoolOptions =
    options?.schools.map((s) => ({ value: s.value, label: shortSchool(s.value, 40), count: s.students })) ?? [];
  const gradeOptions =
    options?.grades.map((g) => ({ value: g.value, label: td(g.value), count: g.students })) ?? [];
  const genderOptions =
    options?.genders.map((g) => ({ value: g.value, label: td(g.value), count: g.students })) ?? [];
  const ageOptions =
    options?.ages.map((a) => ({ value: a.value, label: td(a.label), count: a.students })) ?? [];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 shadow-card">
      <span className="flex items-center gap-2 text-small font-medium text-muted">
        <SlidersHorizontal className="h-4 w-4" aria-hidden /> {t('filters')}
      </span>

      <MultiSelect
        label={t('filterSchool')} searchable options={schoolOptions} selected={filters.schools}
        onToggle={(v) => toggle('schools', v)} onClear={() => clear('schools')} disabled={optionsLoading}
      />
      <MultiSelect
        label={t('filterGrade')} options={gradeOptions} selected={filters.grades}
        onToggle={(v) => toggle('grades', v)} onClear={() => clear('grades')} disabled={optionsLoading}
      />
      <MultiSelect
        label={t('filterGender')} options={genderOptions} selected={filters.genders}
        onToggle={(v) => toggle('genders', v)} onClear={() => clear('genders')} disabled={optionsLoading}
      />
      <MultiSelect
        label={t('filterAge')} options={ageOptions} selected={filters.ages}
        onToggle={(v) => toggle('ages', v)} onClear={() => clear('ages')} disabled={optionsLoading}
      />

      <button
        type="button"
        onClick={resetAll}
        disabled={activeCount === 0}
        className="focus-ring ml-auto flex h-9 items-center gap-1.5 rounded-md border border-line px-3 text-small text-ink transition-colors hover:bg-canvas disabled:opacity-40"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        {t('resetAllFilters')}{activeCount > 0 ? ` (${activeCount})` : ''}
      </button>
    </div>
  );
}
