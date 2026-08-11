/**
 * Design tokens — the single source of truth for every colour in the
 * dashboard. Never hard-code a hex value inside a chart or component;
 * reference (or extend) the tokens here instead.
 */
export const COLORS = {
  navy: '#172554', // Deep navy — sidebar, strong headings
  blue: '#2563EB', // Primary blue
  blueLight: '#3B82F6', // Medium blue — chart series (not a background tint)
  teal: '#0F766E', // Teal
  purple: '#7C3AED', // Purple / violet
  amber: '#D97706', // Amber
  red: '#DC2626', // Red
  green: '#16A34A', // Green
  background: '#F5F7FB', // Page background
  white: '#FFFFFF',
  border: '#E2E8F0',
  text: '#172033', // Primary text
  secondary: '#64748B', // Secondary text
  // Back-compat aliases — same values, names already relied on throughout the app.
  positive: '#16A34A',
  warning: '#D97706',
  negative: '#DC2626',
  info: '#0284C7',
};

/**
 * Named design-system tokens (primary / success / warning / danger, …) for
 * anywhere that reads more clearly by role than by hue. `COLORS` and
 * `THEME` describe the same palette — pick whichever name fits the call
 * site.
 */
export const THEME = {
  primary: COLORS.blue,
  primaryLight: '#DBEAFE',
  secondary: COLORS.teal,
  secondaryLight: '#CCFBF1',
  digital: COLORS.purple,
  digitalLight: '#EDE9FE',
  success: COLORS.green,
  successLight: '#DCFCE7',
  warning: COLORS.amber,
  warningLight: '#FEF3C7',
  danger: COLORS.red,
  dangerLight: '#FEE2E2',
  background: COLORS.background,
  surface: COLORS.white,
  textPrimary: COLORS.text,
  textSecondary: COLORS.secondary,
  border: COLORS.border,
};

/**
 * Mixes a hex colour toward white — derives a light tint (e.g. a KPI card's
 * background) from any accent colour already in use, instead of needing a
 * hand-picked "light" companion for every hue.
 */
export function tint(hex, alpha = 0.14) {
  const n = hex.replace('#', '');
  const r = parseInt(n.substring(0, 2), 16);
  const g = parseInt(n.substring(2, 4), 16);
  const b = parseInt(n.substring(4, 6), 16);
  const mix = (c) => Math.round(c * alpha + 255 * (1 - alpha));
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

/** Semantic mapping for the three-point answer scale. */
export const ANSWER_COLORS = {
  yes: COLORS.positive,
  noChange: COLORS.warning,
  no: COLORS.negative,
};

/** Categorical palette — ordered, colour-blind-safe enough for <=6 series. */
export const SERIES = [COLORS.blue, COLORS.info, COLORS.blueLight, COLORS.secondary, COLORS.navy, COLORS.purple];

/**
 * Fixed hue per analytical category, used where a chart or KPI card should
 * always read as "this kind of metric" rather than shift colour with its
 * score (that's what `bandColor` is for). Keep this palette small and
 * intentional — one hue per category, not one per chart.
 */
export const CATEGORY = {
  general: '#0EA5E9', // Sky blue — reach / cohort size
  reach: '#6366F1', // Indigo — coverage
  impact: COLORS.teal, // Teal — positive outcomes and impact
  digital: COLORS.blue, // Blue — digital skills
  experience: '#0891B2', // Cyan — learning experience
  ai: COLORS.purple, // Purple — AI
  risk: COLORS.negative, // Red — risk
  improvement: '#4F46E5', // Indigo/purple — improvement priorities
  // Page 2 — Student Profile & Access
  school: COLORS.blue, // Blue — school composition
  grade: '#6366F1', // Indigo — grade composition
  gender: COLORS.purple, // Purple — gender composition
  age: '#0EA5E9', // Sky blue — age composition
  deviceSmartphone: COLORS.blue, // Blue
  deviceComputer: COLORS.teal, // Teal
  deviceTablet: COLORS.purple, // Purple
  deviceNone: '#EA580C', // Orange — lacking a device, an attention signal
};

/** Light-to-dark triad for the three grade levels — distinct but coordinated. */
export const GRADE_COLORS = ['#818CF8', '#6366F1', '#4338CA'];

/** Students by Gender donut — three clearly distinguishable, professional hues (not a good/bad ramp). */
export const GENDER_COLORS = ['#DB2777', COLORS.blue, COLORS.teal];

/** Page 3 — Student Impact: the three composite indices, used consistently across comparisons. */
export const INDEX_COLORS = {
  impact: COLORS.green, // Green — Student Impact
  digitalSkills: COLORS.teal, // Teal — Digital Skills
  experience: COLORS.purple, // Purple — Learning Experience
  theme: COLORS.blue, // Blue — qualitative themes
};

/** Coordinated green→teal spectrum for the six Student Impact KPI cards. */
export const IMPACT_KPI_COLORS = ['#15803D', COLORS.green, '#22C55E', COLORS.teal, '#059669', '#0891B2'];

/** Page 4 — Digital Skills & AI: six KPI accents in a coordinated blue/teal/purple family, plus an amber gap signal. */
export const DIGITAL_KPI_COLORS = [
  COLORS.blue, // Digital Skills Index
  COLORS.purple, // AI Adoption Rate
  COLORS.teal, // Coding Skills Improvement
  '#0891B2', // Internet Safety — cyan
  '#0EA5E9', // Independent Online Learning — sky
  COLORS.warning, // Widest Skill Gap — amber, an attention signal
];

/** Varied but coordinated hues for digital-subject categories (blue/teal/purple/indigo family). */
export const SUBJECT_COLORS = [COLORS.blue, COLORS.teal, COLORS.purple, '#0EA5E9', '#6366F1', '#0891B2'];

/** Page 5 — Learning Experience: the four dimensions, used consistently across the dimension and indicator charts. */
export const DIMENSION_COLORS = {
  Infrastructure: COLORS.teal,
  'Teacher Support': COLORS.blue,
  Engagement: COLORS.purple,
  'Practical Learning': COLORS.warning,
};

/** Page 6 — Risk & Improvement: red/amber for risk, blue/indigo for neutral analytical and action-oriented info. */
export const RISK_KPI_COLORS = [
  COLORS.negative, // Negative Impact Rate — red, the headline risk
  COLORS.warning, // Academic Pressure — amber
  '#EA580C', // Subject Trade-off — orange
  COLORS.blue, // Students Reporting Challenges — blue, neutral analytical
  '#0284C7', // Top Challenge — sky, neutral analytical
  '#4F46E5', // Top Improvement Request — indigo, action-oriented
];

/** Six Learning Experience KPI accents: overall index, the four dimensions, then an attention colour for the weakest indicator. */
export const LEARNING_KPI_COLORS = [
  '#0EA5E9', // Learning Experience Index — sky
  DIMENSION_COLORS.Infrastructure,
  DIMENSION_COLORS['Teacher Support'],
  DIMENSION_COLORS.Engagement,
  DIMENSION_COLORS['Practical Learning'],
  COLORS.negative, // Weakest Indicator — red, an attention signal
];

/**
 * Fill opacity for the Nth item in a descending-sorted rank, fading from
 * fully opaque (index 0, the largest value) down to `min` for the last item
 * — makes lower-ranked bars visually recede instead of competing equally
 * with the top of the list.
 */
export function rankOpacity(index, count, min = 0.35) {
  if (count <= 1) return 1;
  const t = index / (count - 1);
  return 1 - t * (1 - min);
}

/**
 * Single-hue-family gradient across a rank, from strongest (index 0) to
 * weakest. Deliberately avoids red/green "good vs. bad" coding — a lower
 * rank here is still a high score, not a problem. Pass `from`/`to` to use a
 * different family (e.g. an amber gradient for a "needs attention" ranking).
 */
export function sequentialColor(
  index,
  count,
  from = [15, 118, 110], // #0F766E teal
  to = [125, 211, 252], // #7DD3FC light sky blue
) {
  if (count <= 1) return `rgb(${from.join(',')})`;
  const t = index / (count - 1);
  const mix = from.map((c, i) => Math.round(c + (to[i] - c) * t));
  return `rgb(${mix.join(',')})`;
}

/** Performance banding used by KPI cards and the heatmap. */
export function bandColor(value, higherIsBetter = true) {
  if (value === null || value === undefined) return COLORS.secondary;
  const score = higherIsBetter ? value : 100 - value;
  if (score >= 90) return COLORS.positive;
  if (score >= 80) return COLORS.blue;
  if (score >= 70) return COLORS.warning;
  return COLORS.negative;
}

/** Blue sequential scale for heatmap cells, anchored to the visible range. */
export function heatColor(value, min, max) {
  if (value === null) return '#F1F5F9';
  const span = Math.max(max - min, 0.0001);
  const t = Math.min(Math.max((value - min) / span, 0), 1);
  // #EFF6FF -> #1D4ED8
  const from = [239, 246, 255];
  const to = [29, 78, 216];
  const mix = from.map((c, i) => Math.round(c + (to[i] - c) * t));
  return `rgb(${mix.join(',')})`;
}

/** Orange sequential tint for "needs attention" table cells (e.g. no-device share). */
export function attentionTint(value, max) {
  if (value === null || max <= 0) return 'transparent';
  const t = Math.min(Math.max(value / max, 0), 1);
  // #FFF7ED -> #FB923C
  const from = [255, 247, 237];
  const to = [251, 146, 60];
  const mix = from.map((c, i) => Math.round(c + (to[i] - c) * t));
  return `rgb(${mix.join(',')})`;
}
