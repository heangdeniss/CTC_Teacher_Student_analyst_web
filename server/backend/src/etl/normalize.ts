/**
 * Normalisation rules for the ម.ប.ស. survey extract.
 *
 * Every rule here was derived by inspecting the actual CSV values —
 * see documentation/data_dictionary.md for the observed value sets.
 * The raw CSV files are never modified.
 */

export type AnswerCode = 'yes' | 'no' | 'no_change';

/** Collapse internal whitespace, strip zero-width chars, trim, NFC-normalise. */
export function cleanText(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const cleaned = value
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
  return cleaned.length === 0 ? null : cleaned;
}

/* ------------------------------------------------------------------ */
/* Survey answer scale                                                 */
/* ------------------------------------------------------------------ */

export const ANSWER_MAP: Record<string, AnswerCode> = {
  'ពិត': 'yes',
  'មិនពិត': 'no',
  'ដូចមុនដដែល': 'no_change',
  'ដូចមុនដដែល ពុំមានការប្រែប្រួល': 'no_change',
  // teachers_more_attentive uses its own neutral wording ("equally attentive")
  'យកចិត្តទុកដាក់ដូចគ្នា': 'no_change',
};

export function normalizeAnswer(raw: string | null | undefined): AnswerCode | null {
  const text = cleanText(raw);
  if (text === null) return null;
  return ANSWER_MAP[text] ?? null;
}

/* ------------------------------------------------------------------ */
/* Khmer digits                                                        */
/* ------------------------------------------------------------------ */

const KHMER_DIGITS = '០១២៣៤៥៦៧៨៩';

/** '2០' -> '20'. The age band mixes Khmer and Arabic numerals. */
export function arabicDigits(value: string): string {
  return value.replace(/[០-៩]/g, (d) => String(KHMER_DIGITS.indexOf(d)));
}

/* ------------------------------------------------------------------ */
/* Age bands                                                           */
/* ------------------------------------------------------------------ */

export interface AgeBand {
  ageBand: string;
  ageBandEn: string;
  order: number;
}

const AGE_BANDS: Record<string, AgeBand> = {
  '13 - 15 ឆ្នាំ': { ageBand: '13 - 15 ឆ្នាំ', ageBandEn: '13–15 years', order: 1 },
  '16 - 18 ឆ្នាំ': { ageBand: '16 - 18 ឆ្នាំ', ageBandEn: '16–18 years', order: 2 },
  '18 - 20 ឆ្នាំ': { ageBand: '18 - 20 ឆ្នាំ', ageBandEn: '18–20 years', order: 3 },
  'ផ្សេងៗ': { ageBand: 'ផ្សេងៗ', ageBandEn: 'Other', order: 9 },
};

/**
 * Raw file contains '18 – 2០ ឆ្នាំ' (en dash + Khmer zero) and the
 * misspelling 'ផេង្សៗ' for 'ផ្សេងៗ' ("other").
 */
export function normalizeAgeBand(raw: string | null | undefined): AgeBand | null {
  const text = cleanText(raw);
  if (text === null) return null;

  let key = arabicDigits(text)
    .replace(/[\u2010-\u2015\u2212]/g, '-') // any dash -> hyphen
    .replace(/\s*-\s*/g, ' - ');

  if (key === 'ផេង្សៗ' || key === 'ផ្សេងៗ' || /other/i.test(key)) key = 'ផ្សេងៗ';

  return AGE_BANDS[key] ?? null;
}

/* ------------------------------------------------------------------ */
/* School names                                                        */
/* ------------------------------------------------------------------ */

const SCHOOL_PREFIX = 'វិទ្យាល័យ';

/**
 * School names are consistent apart from prefix spacing
 * ('វិទ្យាល័យហ៊ុន សែន...' vs 'វិទ្យាល័យ ហ៊ុន សែន...').
 * Canonical form always separates the prefix with a single space.
 */
export function normalizeSchool(raw: string | null | undefined): string | null {
  const text = cleanText(raw);
  if (text === null) return null;
  if (text.startsWith(SCHOOL_PREFIX) && !text.startsWith(`${SCHOOL_PREFIX} `)) {
    const rest = text.slice(SCHOOL_PREFIX.length).trim();
    return rest ? `${SCHOOL_PREFIX} ${rest}` : text;
  }
  return text;
}

/* ------------------------------------------------------------------ */
/* Grade                                                               */
/* ------------------------------------------------------------------ */

export function normalizeGrade(raw: string | null | undefined): { grade: string; gradeNumber: number } | null {
  const text = cleanText(raw);
  if (text === null) return null;
  const match = arabicDigits(text).match(/(\d{1,2})/);
  if (!match) return null;
  const gradeNumber = Number(match[1]);
  return { grade: `Grade ${gradeNumber}`, gradeNumber };
}

/* ------------------------------------------------------------------ */
/* Gender                                                              */
/* ------------------------------------------------------------------ */

const GENDER_MAP: Record<string, string> = {
  female: 'Female',
  male: 'Male',
  other: 'Other',
  'ស្រី': 'Female',
  'ប្រុស': 'Male',
};

export function normalizeGender(raw: string | null | undefined): string | null {
  const text = cleanText(raw);
  if (text === null) return null;
  return GENDER_MAP[text.toLowerCase()] ?? GENDER_MAP[text] ?? text;
}

/* ------------------------------------------------------------------ */
/* Multi-select fields                                                 */
/* ------------------------------------------------------------------ */

export interface DeviceAccess {
  raw: string;
  hasComputer: boolean;
  hasSmartphone: boolean;
  hasTablet: boolean;
  hasNoDevice: boolean;
  deviceCount: number;
}

const DEVICE_TOKENS: Record<string, keyof Omit<DeviceAccess, 'raw' | 'deviceCount'>> = {
  'កុំព្យូទ័រ': 'hasComputer',
  'ទូរសព្ទដៃវៃឆ្លាត': 'hasSmartphone',
  'ថេបប្លេត': 'hasTablet',
  'គ្មាន': 'hasNoDevice',
};

/**
 * Multi-select answers are ';' separated. A handful of records tick both a
 * real device and "none" — a real device always wins, so the flags stay
 * mutually consistent.
 */
export function normalizeDevices(raw: string | null | undefined): DeviceAccess {
  const text = cleanText(raw) ?? '';
  const tokens = text.split(';').map((t) => t.trim()).filter(Boolean);
  const access: DeviceAccess = {
    raw: tokens.join(';'),
    hasComputer: false,
    hasSmartphone: false,
    hasTablet: false,
    hasNoDevice: false,
    deviceCount: 0,
  };
  for (const token of tokens) {
    const field = DEVICE_TOKENS[token];
    if (field) access[field] = true;
  }
  access.deviceCount =
    Number(access.hasComputer) + Number(access.hasSmartphone) + Number(access.hasTablet);
  access.hasNoDevice = access.deviceCount === 0;
  return access;
}

export interface ServiceUse {
  raw: string;
  usedShortCourses: boolean;
  usedCoffeeShop: boolean;
  usedPostOffice: boolean;
  usedNoService: boolean;
}

const SERVICE_TOKENS: Record<string, keyof Omit<ServiceUse, 'raw'>> = {
  'short courses': 'usedShortCourses',
  'coffee shop': 'usedCoffeeShop',
  'post office': 'usedPostOffice',
  'not used': 'usedNoService',
};

export function normalizeServices(raw: string | null | undefined): ServiceUse {
  const text = cleanText(raw) ?? '';
  const tokens = text.split(';').map((t) => t.trim()).filter(Boolean);
  const use: ServiceUse = {
    raw: tokens.join(';'),
    usedShortCourses: false,
    usedCoffeeShop: false,
    usedPostOffice: false,
    usedNoService: false,
  };
  for (const token of tokens) {
    const field = SERVICE_TOKENS[token.toLowerCase()];
    if (field) use[field] = true;
  }
  const usedAny = use.usedShortCourses || use.usedCoffeeShop || use.usedPostOffice;
  use.usedNoService = !usedAny;
  return use;
}

/* ------------------------------------------------------------------ */
/* Themes                                                              */
/* ------------------------------------------------------------------ */

/**
 * Theme values only need whitespace hygiene — the classifier output is
 * already consistent. Punctuation is deliberately left untouched so that
 * theme strings keep matching the theme_exclusions registry exactly.
 */
export function normalizeTheme(raw: string | null | undefined): string | null {
  return cleanText(raw);
}

export function normalizeQuestionType(raw: string | null | undefined): string | null {
  return cleanText(raw);
}

/* ------------------------------------------------------------------ */
/* AI tool free text (secondary source — the classified                */
/* 'AI Tools Used' themes remain the primary source for charts)        */
/* ------------------------------------------------------------------ */

const AI_TOOL_RULES: Array<[RegExp, string]> = [
  [/^(chat\s*-?\s*gpt|gpt|chatgtp|chat gtp|open\s*ai|openai)/i, 'ChatGPT'],
  [/(gemini|gimini|gemeni|bard)/i, 'Google Gemini'],
  [/(copilot)/i, 'Microsoft Copilot'],
  [/(claude)/i, 'Claude'],
  [/(deepseek)/i, 'DeepSeek'],
  [/(canva)/i, 'Canva'],
  [/(capcut)/i, 'CapCut / Video Editing AI'],
  [/(perplexity)/i, 'Perplexity'],
  [/(grok)/i, 'Grok'],
  [/(meta\s*ai|llama)/i, 'Meta AI'],
  [/^(google|google search|google suite)$/i, 'Google (General Search/Suite)'],
  [/(គ្មាន|មិនមាន|ទេ|no|none)/i, 'No AI Tool Used'],
];

export function standardizeAiTool(raw: string | null | undefined): string | null {
  const text = cleanText(raw);
  if (text === null) return null;
  for (const [pattern, canonical] of AI_TOOL_RULES) {
    if (pattern.test(text)) return canonical;
  }
  return 'Other / Unclassified';
}
