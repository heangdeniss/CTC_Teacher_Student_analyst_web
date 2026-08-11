import {
  getCohort, getHeadline, getIndicators, getBreakdown, getDimensionScores, getRateBy,
  getSchoolIndicatorMatrix, getThemeRanking, getFilterOptions, countRespondentsWithTheme,
} from './engine';

/** Rounds to one decimal, preserving null — matches common/filters.ts pct(). */
function pct(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return Math.round(value * 10) / 10;
}

/**
 * The six page payloads, each a direct port of what used to be a SQL query
 * against a NestJS/PostgreSQL backend (see server/README.md) — now computed
 * from the client-side engine instead. Payload shapes are identical, so the
 * page components need no changes.
 */

export { getFilterOptions };

/** Page 1 — Executive Overview. */
export function getOverview(filters) {
  const cohort = getCohort(filters);
  const headline = getHeadline(cohort);
  const impact = getIndicators(cohort, 'SII', true);
  const skills = getIndicators(cohort, 'DSI', true);
  const experience = getIndicators(cohort, 'LEI', true);
  const improvements = getThemeRanking(cohort, 'Areas for Improvement', 8);
  const challenges = getThemeRanking(cohort, 'Challenge', 8);

  const all = [...impact, ...skills, ...experience].filter((i) => i.score !== null);
  const strongest = all.length
    ? all.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a), all[0])
    : null;
  const weakest = all.length
    ? all.reduce((a, b) => ((b.score ?? 100) < (a.score ?? 100) ? b : a), all[0])
    : null;

  return {
    headline,
    impactIndicators: impact,
    skillIndicators: skills,
    experienceIndicators: experience,
    improvementThemes: improvements,
    keyInsights: {
      strongestOutcome: strongest ? { label: strongest.label, value: strongest.score } : null,
      weakestOutcome: weakest ? { label: weakest.label, value: weakest.score } : null,
      majorRisk: {
        label: 'Increased academic pressure',
        value: headline.academicPressureRate,
        secondaryLabel: 'Gave up other subjects',
        secondaryValue: headline.subjectTradeoffRate,
      },
      topImprovement: improvements[0] ? { label: improvements[0].theme, value: improvements[0].students } : null,
      topChallenge: challenges[0] ? { label: challenges[0].theme, value: challenges[0].students } : null,
    },
  };
}

/** Page 2 — Student Profile & Access. */
export function getProfile(filters) {
  const cohort = getCohort(filters);
  const headline = getHeadline(cohort);

  const countBy = (keyFn) => {
    const groups = new Map();
    for (const s of cohort) {
      const key = keyFn(s);
      groups.set(key, (groups.get(key) ?? 0) + 1);
    }
    return [...groups.entries()].map(([label, students]) => ({ label, students }));
  };
  const rate = (predicate) =>
    cohort.length ? pct((100 * cohort.filter(predicate).length) / cohort.length) : null;

  const bySchool = countBy((s) => s.high_school).sort((a, b) => b.students - a.students);
  const byGrade = countBy((s) => s.grade).sort(
    (a, b) => cohort.find((s) => s.grade === a.label).grade_number - cohort.find((s) => s.grade === b.label).grade_number,
  );
  const byGender = countBy((s) => s.gender).sort((a, b) => b.students - a.students);
  const byAge = countBy((s) => s.age_band_en).sort(
    (a, b) => cohort.find((s) => s.age_band_en === a.label).age_band_order - cohort.find((s) => s.age_band_en === b.label).age_band_order,
  );

  const deviceAccessBySchool = [...new Set(cohort.map((s) => s.high_school))]
    .map((school) => {
      const members = cohort.filter((s) => s.high_school === school);
      return {
        label: school,
        students: members.length,
        computer: pct((100 * members.filter((s) => s.has_computer).length) / members.length),
        smartphone: pct((100 * members.filter((s) => s.has_smartphone).length) / members.length),
        tablet: pct((100 * members.filter((s) => s.has_tablet).length) / members.length),
        none: pct((100 * members.filter((s) => s.has_no_device).length) / members.length),
      };
    })
    .sort((a, b) => (b.none ?? 0) - (a.none ?? 0));

  return {
    headline,
    bySchool,
    byGrade,
    byGender,
    byAge,
    deviceAccess: [
      { label: 'Smartphone', rate: rate((s) => s.has_smartphone) },
      { label: 'Computer', rate: rate((s) => s.has_computer) },
      { label: 'Tablet', rate: rate((s) => s.has_tablet) },
      { label: 'No personal device', rate: rate((s) => s.has_no_device) },
    ],
    deviceAccessBySchool,
    serviceUse: [
      { label: 'Short courses', rate: rate((s) => s.used_short_courses) },
      { label: 'Coffee shop', rate: rate((s) => s.used_coffee_shop) },
      { label: 'Post office', rate: rate((s) => s.used_post_office) },
      { label: 'No service used', rate: rate((s) => s.used_no_service) },
    ],
  };
}

/** Page 3 — Student Impact. */
export function getImpact(filters) {
  const cohort = getCohort(filters);
  const headline = getHeadline(cohort);
  const indicators = getIndicators(cohort, 'SII', true);
  const dimensions = getDimensionScores(cohort, 'SII');
  const bySchool = getBreakdown(cohort, 'high_school');
  const byGrade = getBreakdown(cohort, 'grade', 'label');
  const byGender = getBreakdown(cohort, 'gender');
  const byAge = getBreakdown(cohort, 'age_band', 'label');
  const positiveThemes = getThemeRanking(cohort, 'Positive Impact', 12);
  const byKey = Object.fromEntries(indicators.map((i) => [i.key, i]));

  return {
    headline,
    kpis: {
      studentImpactIndex: headline.studentImpactIndex,
      learningMotivation: byKey.want_study_more?.score ?? null,
      stemInterest: byKey.stem_interest?.score ?? null,
      independentLearning: byKey.self_study?.score ?? null,
      futureConfidence: byKey.future_confidence?.score ?? null,
      universityAspiration: byKey.uni_aspiration?.score ?? null,
    },
    indicators,
    dimensions,
    bySchool,
    byGrade,
    byGender,
    byAge,
    positiveThemes,
  };
}

/** Page 4 — Digital Skills & AI. */
export function getDigitalSkills(filters) {
  const cohort = getCohort(filters);
  const headline = getHeadline(cohort);
  const indicators = getIndicators(cohort, 'DSI', true);
  const supporting = getIndicators(cohort, 'DSI', false);
  const aiBySchool = getRateBy(cohort, 'can_use_ai', 'high_school');
  const aiByGrade = getRateBy(cohort, 'can_use_ai', 'grade').sort((a, b) => a.label.localeCompare(b.label));
  const aiByGender = getRateBy(cohort, 'can_use_ai', 'gender');
  const aiTools = getThemeRanking(cohort, 'AI Tools Used', 10);
  const subjects = getThemeRanking(cohort, 'Favorite Subjects', 10);

  const average = indicators.length
    ? indicators.reduce((sum, i) => sum + (i.score ?? 0), 0) / indicators.length
    : 0;

  return {
    headline,
    kpis: {
      digitalSkillsIndex: headline.digitalSkillsIndex,
      aiAdoptionRate: headline.aiAdoptionRate,
      codingRate: headline.codingRate,
      internetSafetyRate: headline.cyberSafetyRate,
      independentOnlineLearningRate: headline.selfLearningRate,
    },
    indicators,
    skillGaps: indicators
      .map((i) => ({ ...i, gap: pct((i.score ?? 0) - average) }))
      .filter((i) => (i.gap ?? 0) < 0)
      .sort((a, b) => (a.gap ?? 0) - (b.gap ?? 0)),
    perceivedValue: supporting.filter((i) => !i.inIndex),
    aiAdoptionBySchool: aiBySchool,
    aiAdoptionByGrade: aiByGrade,
    aiAdoptionByGender: aiByGender,
    aiTools,
    favoriteSubjects: subjects,
  };
}

/** Page 5 — Learning Experience. */
export function getExperience(filters) {
  const cohort = getCohort(filters);
  const headline = getHeadline(cohort);
  const indicators = getIndicators(cohort, 'LEI', true);
  const dimensions = getDimensionScores(cohort, 'LEI');
  const matrix = getSchoolIndicatorMatrix(cohort, 'LEI');
  const byDimension = (name) => dimensions.find((d) => d.dimension === name)?.score ?? null;

  const bySchool = getBreakdown(cohort, 'high_school')
    .map((r) => ({ ...r }))
    .sort((a, b) => (b.learningExperienceIndex ?? 0) - (a.learningExperienceIndex ?? 0));

  return {
    headline,
    kpis: {
      learningExperienceIndex: headline.learningExperienceIndex,
      infrastructure: byDimension('Infrastructure'),
      teacherSupport: byDimension('Teacher Support'),
      studentEngagement: byDimension('Engagement'),
      practicalLearning: byDimension('Practical Learning'),
    },
    dimensions,
    infrastructure: indicators.filter((i) => i.dimension === 'Infrastructure'),
    teaching: indicators.filter((i) => i.dimension === 'Teacher Support'),
    engagement: indicators.filter((i) => i.dimension === 'Engagement'),
    practical: indicators.filter((i) => i.dimension === 'Practical Learning'),
    indicators,
    bySchool,
    schoolMatrix: matrix,
  };
}

/** Page 6 — Risk & Improvement. */
export function getRisk(filters) {
  const cohort = getCohort(filters);
  const headline = getHeadline(cohort);
  const riskIndicators = getIndicators(cohort, 'RISK', false);
  const pressureBySchool = getRateBy(cohort, 'study_pressure', 'high_school');
  const tradeoffBySchool = getRateBy(cohort, 'drop_other_subjects', 'high_school');
  const challenges = getThemeRanking(cohort, 'Challenge', 10);
  const improvements = getThemeRanking(cohort, 'Areas for Improvement', 10);
  const suggestions = getThemeRanking(cohort, 'Suggestion', 10);
  const negatives = getThemeRanking(cohort, 'Negative Impact', 10);

  const totalStudents = headline.students;
  const withChallenges = countRespondentsWithTheme(cohort, 'Challenge');

  return {
    headline,
    kpis: {
      negativeImpactRate: headline.negativeImpactRate,
      academicPressureRate: headline.academicPressureRate,
      subjectTradeoffRate: headline.subjectTradeoffRate,
      challengeReportingRate: totalStudents ? pct((withChallenges / totalStudents) * 100) : null,
      studentsReportingChallenges: withChallenges,
    },
    riskIndicators,
    academicPressureBySchool: pressureBySchool,
    subjectTradeoffBySchool: tradeoffBySchool,
    challengeThemes: challenges,
    improvementThemes: improvements,
    suggestionThemes: suggestions,
    negativeImpactThemes: negatives,
  };
}
