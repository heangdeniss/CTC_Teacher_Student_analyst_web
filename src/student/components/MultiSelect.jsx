import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { isKhmer } from '../lib/format';
import { useLanguage } from '../lib/i18n';

/** Accessible multi-select used for every global slicer. */
export function MultiSelect({
  label, options, selected, onToggle, onClear, disabled = false, searchable = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const { t } = useLanguage();

  const visible = query
    ? options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const selectedOption = selected.length === 1 ? options.find((o) => o.value === selected[0]) : undefined;
  const summary =
    selected.length === 0 ? t('all') : selectedOption ? selectedOption.label : `${selected.length} ${t('selected')}`;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`focus-ring flex h-9 min-w-[150px] max-w-[240px] items-center justify-between gap-2 rounded-md border px-3 text-small transition-colors disabled:opacity-50 ${
          selected.length > 0 ? 'border-brand/40 bg-brand-tint/60' : 'border-line bg-white'
        }`}
      >
        <span className="truncate">
          <span className="text-muted">{label}: </span>
          <span className={isKhmer(summary) ? 'km' : ''}>{summary}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open ? (
        <div className="absolute z-30 mt-1 max-h-80 w-[300px] overflow-hidden rounded-md border border-line bg-white shadow-lg">
          {searchable ? (
            <div className="border-b border-line p-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`${t('search')} ${label}…`}
                className="focus-ring w-full rounded border border-line px-2 py-1.5 text-small"
              />
            </div>
          ) : null}

          <ul role="listbox" aria-multiselectable className="max-h-56 overflow-y-auto py-1">
            {visible.length === 0 ? (
              <li className="px-3 py-2 text-small text-muted">{t('noMatches')}</li>
            ) : (
              visible.map((option) => {
                const active = selected.includes(option.value);
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => onToggle(option.value)}
                      className="focus-ring flex w-full items-center gap-2 px-3 py-1.5 text-left text-small hover:bg-canvas"
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${active ? 'border-brand bg-brand' : 'border-line'}`}>
                        {active ? <Check className="h-3 w-3 text-white" aria-hidden /> : null}
                      </span>
                      <span className={`flex-1 truncate ${isKhmer(option.label) ? 'km' : ''}`}>{option.label}</span>
                      {option.count !== undefined ? (
                        <span className="shrink-0 tabular-nums text-muted">{option.count}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {selected.length > 0 ? (
            <div className="border-t border-line p-2">
              <button
                type="button"
                onClick={onClear}
                className="focus-ring flex items-center gap-1 rounded px-2 py-1 text-small text-brand hover:underline"
              >
                <X className="h-3.5 w-3.5" aria-hidden /> {t('clear')} {label}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
