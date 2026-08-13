import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { FilterBar } from './FilterBar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '../lib/i18n';

/**
 * App shell: fixed sidebar, a sticky global filter bar, and the active page.
 * The filter bar lives here rather than in each page so every view is
 * guaranteed to read the same cohort.
 */
export function AppLayout({ page, onNavigate, onHome, children }) {
  const [open, setOpen] = useState(false);
  const { lang, t } = useLanguage();

  const navigate = (next) => {
    onNavigate(next);
    setOpen(false);
  };

  return (
    <div className={`min-h-screen bg-canvas ${lang === 'kh' ? 'km' : 'font-en'}`}>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] lg:block">
        <Sidebar page={page} onNavigate={navigate} onHome={onHome} />
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/50" onClick={() => setOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-[260px]">
            <Sidebar page={page} onNavigate={navigate} onHome={onHome} />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-[260px]">
        <div className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 py-3">
              <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={open ? 'Close navigation' : 'Open navigation'}
                aria-expanded={open}
                className="focus-ring rounded-md border border-line p-2 lg:hidden"
              >
                {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
              </button>
              <p className="text-dash-title truncate">{t('appTitle')}</p>
              <div className="ml-auto flex shrink-0 items-center gap-3">
                <LanguageSwitcher />
              </div>
            </div>
            <div className="pb-3">
              <FilterBar />
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
