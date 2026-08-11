import students from '../data/students.json';
import themes from '../data/themes.json';
import indicatorCatalog from '../data/indicators.json';

/**
 * Client-side re-implementation of the analytics SQL that used to compute
 * this dashboard's numbers on a NestJS/PostgreSQL backend, operating over a
 * static export of the same tables instead of live SQL — see
 * server/README.md for why there's no backend anymore, and
 * server/documentation/metric_dictionary.md for the formulas this must
 * agree with.
 */

/** Maps a survey answer code to a 0–1 score (see server/documentation/metric_dictionary.md). */
function answerScore(code) {
  if (code === 'yes') return 1;
  if (code === 'no_change') return 0.5;
  if (code === 'no') return 0;
  return null;
}

/** Mean ignoring nulls, matching SQL avg() — null (not 0/NaN) when there's nothing to average. */
function mean(values) {
  const present = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(v));
  if (present.length === 0) return null;
  return present.reduce((a, b) => a + b, 0) / present.length;
}

/** Rounds to one decimal, preserving null — matches common/filters.ts pct(). */
function pct(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.round(value * 10) / 10;
}

const int = (value) => value ?? 0;

/** indicator_catalog rows for one index, optionally restricted to in-index members. */
function indicatorsFor(indexCode, onlyInIndex) {
  return indicatorCatalog.filter((i) => i.index_code === indexCode && (!onlyInIndex || i.in_index));
}

/** student_impact_index / digital_skills_index / learning_experience_index for one student. */
function studentIndexScore(student, indexCode) {
  const members = indicatorsFor(indexCode, true);
  const scores = members.map((i) => answerScore(student[i.key])).filter((v) => v !== null);
  if (scores.length === 0) return null;
  return 100 * (scores.reduce((a, b) => a + b, 0) / scores.length);
}

/**
 * student_metrics — precomputed once for the whole dataset, mirroring the
 * SQL view: three indexes plus the boolean flags every KPI reads.
 */
export const studentMetrics = students.map((s) => ({
  ...s,
  student_impact_index: studentIndexScore(s, 'SII'),
  digital_skills_index: studentIndexScore(s, 'DSI'),
  learning_experience_index: studentIndexScore(s, 'LEI'),
  ai_adopter: s.can_use_ai === 'yes',
  coding_improved: s.better_coding_skills === 'yes',
  cyber_aware: s.understand_cyber_risks === 'yes',
  self_learner: s.better_self_learning === 'yes',
  reports_pressure: s.study_pressure === 'yes',
  reports_subject_tradeoff: s.drop_other_subjects === 'yes',
  reports_more_phone_use: s.use_phone_more === 'yes',
  reports_negative_impact: s.study_pressure === 'yes' || s.drop_other_subjects === 'yes',
}));

/** buildFilter() — OR within a field, AND across fields; an empty/absent filter matches everything. */
function matchesAny(values, value) {
  return !values || values.length === 0 || values.includes(value);
}

/** WHERE clause equivalent: the filtered cohort as an array of student_metrics rows. */
export function getCohort(filters = {}) {
  return studentMetrics.filter(
    (s) =>
      matchesAny(filters.schools, s.high_school) &&
      matchesAny(filters.grades, s.grade) &&
      matchesAny(filters.genders, s.gender) &&
      matchesAny(filters.ages, s.age_band),
  );
}

/** getHeadline() */
export function getHeadline(cohort) {
  return {
    students: int(cohort.length),
    schools: new Set(cohort.map((s) => s.high_school)).size,
    studentImpactIndex: pct(mean(cohort.map((s) => s.student_impact_index))),
    digitalSkillsIndex: pct(mean(cohort.map((s) => s.digital_skills_index))),
    learningExperienceIndex: pct(mean(cohort.map((s) => s.learning_experience_index))),
    aiAdoptionRate: pct(100 * mean(cohort.map((s) => (s.ai_adopter ? 1 : 0)))),
    codingRate: pct(100 * mean(cohort.map((s) => (s.coding_improved ? 1 : 0)))),
    cyberSafetyRate: pct(100 * mean(cohort.map((s) => (s.cyber_aware ? 1 : 0)))),
    selfLearningRate: pct(100 * mean(cohort.map((s) => (s.self_learner ? 1 : 0)))),
    negativeImpactRate: pct(100 * mean(cohort.map((s) => (s.reports_negative_impact ? 1 : 0)))),
    academicPressureRate: pct(100 * mean(cohort.map((s) => (s.reports_pressure ? 1 : 0)))),
    subjectTradeoffRate: pct(100 * mean(cohort.map((s) => (s.reports_subject_tradeoff ? 1 : 0)))),
    increasedPhoneUseRate: pct(100 * mean(cohort.map((s) => (s.reports_more_phone_use ? 1 : 0)))),
    deviceAccessRate: pct(100 * mean(cohort.map((s) => (s.has_no_device ? 0 : 1)))),
  };
}

/** getIndicators() */
export function getIndicators(cohort, indexCode, onlyInIndex = false) {
  const members = indicatorsFor(indexCode, onlyInIndex);
  const rows = members.map((ind) => {
    const answers = cohort.map((s) => s[ind.key]);
    const scores = answers.map(answerScore);
    const scoreMean = mean(scores);
    return {
      key: ind.key,
      label: ind.label_en,
      dimension: ind.dimension,
      score: scoreMean !== null ? pct(100 * scoreMean) : null,
      yesPct: pct(100 * mean(answers.map((a) => (a === 'yes' ? 1 : 0)))),
      noChangePct: pct(100 * mean(answers.map((a) => (a === 'no_change' ? 1 : 0)))),
      noPct: pct(100 * mean(answers.map((a) => (a === 'no' ? 1 : 0)))),
      responses: int(scores.filter((v) => v !== null).length),
      inIndex: ind.in_index,
      higherIsBetter: ind.higher_is_better,
    };
  });
  return rows.sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));
}

const AGE_LABEL = (s) => s.age_band_en;
const DIMENSION_FIELD = { high_school: (s) => s.high_school, grade: (s) => s.grade, gender: (s) => s.gender, age_band: AGE_LABEL };

function groupBy(cohort, keyFn) {
  const groups = new Map();
  for (const s of cohort) {
    const key = keyFn(s);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(s);
  }
  return groups;
}

/** getBreakdown() */
export function getBreakdown(cohort, dimension, sortBy = 'value') {
  const groups = groupBy(cohort, DIMENSION_FIELD[dimension]);
  const rows = [...groups.entries()].map(([label, members]) => ({
    label,
    students: int(members.length),
    studentImpactIndex: pct(mean(members.map((s) => s.student_impact_index))),
    digitalSkillsIndex: pct(mean(members.map((s) => s.digital_skills_index))),
    learningExperienceIndex: pct(mean(members.map((s) => s.learning_experience_index))),
    // sort helper only — mirrors ORDER BY min(sm.age_band_order) for the age dimension
    _order: dimension === 'age_band' ? Math.min(...members.map((s) => s.age_band_order)) : null,
  }));
  if (sortBy === 'label') {
    rows.sort((a, b) => (dimension === 'age_band' ? a._order - b._order : a.label.localeCompare(b.label)));
  } else {
    rows.sort((a, b) => (b.studentImpactIndex ?? -Infinity) - (a.studentImpactIndex ?? -Infinity));
  }
  return rows.map(({ _order, ...row }) => row);
}

/** getDimensionScores() — pooled mean over every (student, indicator) pair in the dimension, not a mean of means. */
export function getDimensionScores(cohort, indexCode) {
  const members = indicatorsFor(indexCode, true);
  const byDimension = new Map();
  for (const ind of members) {
    if (!byDimension.has(ind.dimension)) byDimension.set(ind.dimension, []);
    byDimension.get(ind.dimension).push(ind);
  }
  const rows = [...byDimension.entries()].map(([dimension, dimIndicators]) => {
    const scores = [];
    for (const s of cohort) {
      for (const ind of dimIndicators) {
        const v = answerScore(s[ind.key]);
        if (v !== null) scores.push(v);
      }
    }
    return { dimension, score: pct(100 * mean(scores)), indicators: int(dimIndicators.length) };
  });
  return rows.sort((a, b) => (b.score ?? -Infinity) - (a.score ?? -Infinity));
}

/** getRateBy() */
export function getRateBy(cohort, indicatorKey, dimension) {
  const groups = groupBy(cohort, DIMENSION_FIELD[dimension]);
  const rows = [...groups.entries()].map(([label, members]) => ({
    label,
    students: int(members.length),
    rate: pct(100 * mean(members.map((s) => (s[indicatorKey] === 'yes' ? 1 : 0)))),
  }));
  return rows.sort((a, b) => (b.rate ?? -Infinity) - (a.rate ?? -Infinity));
}

/** getSchoolIndicatorMatrix() */
export function getSchoolIndicatorMatrix(cohort, indexCode) {
  const members = indicatorsFor(indexCode, true);
  const dimensions = [...new Set(members.map((i) => i.dimension))];
  const bySchool = groupBy(cohort, (s) => s.high_school);
  const rows = [...bySchool.entries()].map(([school, members_]) => {
    const cells = {};
    for (const dimension of dimensions) {
      const dimIndicators = members.filter((i) => i.dimension === dimension);
      const scores = [];
      for (const s of members_) {
        for (const ind of dimIndicators) {
          const v = answerScore(s[ind.key]);
          if (v !== null) scores.push(v);
        }
      }
      cells[dimension] = pct(100 * mean(scores));
    }
    return { school, students: int(members_.length), cells };
  });
  return { dimensions, rows };
}

/** getThemeRanking() */
export function getThemeRanking(cohort, questionType, limit = 10) {
  const cohortIds = new Set(cohort.map((s) => s.respondent_id));
  const cohortSize = cohort.length;
  const tagged = themes.filter((t) => t.question_type === questionType && cohortIds.has(t.respondent_id));
  const responders = new Set(tagged.map((t) => t.respondent_id)).size;

  const byTheme = new Map();
  for (const t of tagged) {
    if (!byTheme.has(t.theme)) byTheme.set(t.theme, { students: new Set(), occurrences: 0 });
    const entry = byTheme.get(t.theme);
    entry.students.add(t.respondent_id);
    entry.occurrences += 1;
  }

  const rows = [...byTheme.entries()].map(([theme, entry]) => ({
    theme,
    students: int(entry.students.size),
    occurrences: int(entry.occurrences),
    studentShare: cohortSize > 0 ? pct((100 * entry.students.size) / cohortSize) : null,
    respondentShare: responders > 0 ? pct((100 * entry.students.size) / responders) : null,
  }));

  rows.sort((a, b) => b.students - a.students || a.theme.localeCompare(b.theme));
  return rows.slice(0, limit);
}

/** Distinct cohort respondents holding >=1 meaningful theme for a question type (used by the Risk page). */
export function countRespondentsWithTheme(cohort, questionType) {
  const cohortIds = new Set(cohort.map((s) => s.respondent_id));
  const ids = new Set(
    themes.filter((t) => t.question_type === questionType && cohortIds.has(t.respondent_id)).map((t) => t.respondent_id),
  );
  return ids.size;
}

/** filters.service.ts getOptions() — always unfiltered, over the full dataset. */
export function getFilterOptions() {
  const count = (keyFn) => {
    const groups = groupBy(students, keyFn);
    return [...groups.entries()].map(([value, members]) => ({ value, students: int(members.length) }));
  };
  const schools = count((s) => s.high_school).sort((a, b) => b.students - a.students);
  const grades = count((s) => s.grade).sort(
    (a, b) => students.find((s) => s.grade === a.value).grade_number - students.find((s) => s.grade === b.value).grade_number,
  );
  const genders = count((s) => s.gender).sort((a, b) => b.students - a.students);
  const ageGroups = groupBy(students, (s) => s.age_band);
  const ages = [...ageGroups.entries()]
    .map(([value, members]) => ({ value, label: members[0].age_band_en, students: int(members.length), _order: members[0].age_band_order }))
    .sort((a, b) => a._order - b._order)
    .map(({ _order, ...row }) => row);
  return { schools, grades, genders, ages };
}
