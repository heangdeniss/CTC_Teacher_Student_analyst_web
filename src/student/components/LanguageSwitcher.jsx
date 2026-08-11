import { useLanguage } from '../lib/i18n';

/** Two-way English / Khmer switch — persists via useLanguage and applies instantly, no reload. */
export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const isKh = lang === 'kh';

  return (
    <div className="flex items-center gap-2.5 select-none">
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`focus-ring rounded text-small font-bold tracking-wide transition-colors ${
          isKh ? 'text-muted/50 hover:text-muted' : 'text-ink'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={isKh}
        aria-label="Language"
        onClick={() => setLang(isKh ? 'en' : 'kh')}
        className="focus-ring relative h-7 w-14 shrink-0 rounded-full border border-line bg-canvas transition-colors"
      >
        <span
          className={`absolute top-0.5 flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-white shadow-card ring-1 ring-black/5 transition-transform duration-200 ease-out ${
            isKh ? 'translate-x-7' : 'translate-x-0.5'
          }`}
        >
          <span className="text-[15px] leading-none" aria-hidden>{isKh ? '🇰🇭' : '🇬🇧'}</span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => setLang('kh')}
        className={`focus-ring rounded text-small font-bold tracking-wide transition-colors ${
          isKh ? 'text-ink' : 'text-muted/50 hover:text-muted'
        }`}
      >
        KH
      </button>
    </div>
  );
}
