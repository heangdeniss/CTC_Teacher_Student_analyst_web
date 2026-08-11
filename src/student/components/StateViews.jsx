import { AlertCircle, Inbox } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

export function LoadingBlock({ height = 260 }) {
  const { t } = useLanguage();
  return (
    <div className="animate-pulse rounded-md bg-canvas" style={{ height }} role="status" aria-label={t('loading')} />
  );
}

export function LoadingPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-4" role="status" aria-label={t('loadingDashboard')}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card h-28 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="card h-80 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ message }) {
  const { t } = useLanguage();
  return (
    <div className="card card-pad flex items-start gap-3" role="alert">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-negative" aria-hidden />
      <div>
        <p className="font-medium">{t('couldNotLoad')}</p>
        <p className="mt-1 text-small text-muted">{message}</p>
        <p className="mt-2 text-small text-muted">
          {t('checkApiRunning')} (<code>npm run db:setup</code>).
        </p>
      </div>
    </div>
  );
}

export function EmptyState({ message }) {
  const { t } = useLanguage();
  return (
    <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-2 text-muted">
      <Inbox className="h-6 w-6" aria-hidden />
      <p className="text-small">{message ?? t('noDataMatches')}</p>
    </div>
  );
}
