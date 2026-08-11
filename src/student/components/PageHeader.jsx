import { useLanguage } from '../lib/i18n';

/** Consistent header: page title, optionally the analytical question, current cohort size. */
export function PageHeader({ title, question, students, schools }) {
  const { t } = useLanguage();
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-page-title">{title}</h1>
        {question ? <p className="mt-1 max-w-3xl text-small text-muted">{question}</p> : null}
      </div>
      <p className="text-small text-muted tabular-nums">
        {students === null ? '—' : students.toLocaleString()} {t('students')}
        {schools !== null ? ` · ${schools} ${schools === 1 ? t('school') : t('schoolsPlural')}` : ''} {t('inCurrentSelection')}
      </p>
    </header>
  );
}
