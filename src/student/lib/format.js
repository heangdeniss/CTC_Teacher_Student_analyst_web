export const nf = new Intl.NumberFormat('en-US');

export function formatNumber(value) {
  return value === null || value === undefined ? '—' : nf.format(value);
}

export function formatPct(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return `${value.toFixed(digits)}%`;
}

export function formatIndex(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toFixed(1);
}

/** Khmer school names are long; shorten for axis labels while keeping meaning. */
export function shortSchool(name, max = 26) {
  const trimmed = name.replace(/^វិទ្យាល័យ\s*/, '');
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

/** Generic label truncation for tight spaces (e.g. radar chart axis ticks). */
export function truncate(value, max = 18) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/** True when the string contains Khmer script — used to switch font stack. */
export function isKhmer(value) {
  return /[ក-៿]/.test(value);
}
