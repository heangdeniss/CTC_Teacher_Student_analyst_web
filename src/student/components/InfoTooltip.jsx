import { useId, useState } from 'react';
import { Info } from 'lucide-react';
import { useLanguage } from '../lib/i18n';

/**
 * Small (ⓘ) affordance for methodology notes that don't belong as permanent
 * on-card text. Opens on hover and on keyboard focus so it stays reachable
 * without a mouse.
 */
export function InfoTooltip({ text }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { t } = useLanguage();

  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        aria-describedby={open ? id : undefined}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="focus-ring flex h-4 w-4 items-center justify-center rounded-full text-muted hover:text-ink"
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
        <span className="sr-only">{t('methodology')}</span>
      </button>
      {open ? (
        <span
          id={id}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-md border border-line bg-navy px-3 py-2 text-small leading-snug text-white shadow-card"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
