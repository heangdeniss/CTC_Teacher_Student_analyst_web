import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'node_modules/@types/pg';
import { PG_POOL } from '../../database/database.module';
import { FilterQueryDto, buildFilter, int, pct } from '../../common/filters';
import { ThemesService } from '../themes/themes.service';

export type IndexCode = 'SII' | 'DSI' | 'LEI' | 'RISK' | 'SUPPORT';

export interface IndicatorRow {
  key: string;
  label: string;
  dimension: string;
  score: number | null;
  yesPct: number | null;
  noChangePct: number | null;
  noPct: number | null;
  responses: number;
  inIndex: boolean;
  higherIsBetter: boolean;
}

export interface BreakdownRow {
  label: string;
  students: number;
  studentImpactIndex: number | null;
  digitalSkillsIndex: number | null;
  learningExperienceIndex: number | null;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly themes: ThemesService,
  ) {}

  /* ---------------------------------------------------------------- */
  /* Building blocks                                                   */
  /* ---------------------------------------------------------------- */

  /** Headline counts and the three indexes for the current filter set. */
  async getHeadline(filters: FilterQueryDto) {
    const { where, params } = buildFilter(filters);
    const { rows } = await this.pool.query(
      `SELECT
         count(*)::int                                        AS students,
         count(DISTINCT sm.high_school)::int                  AS schools,
         avg(sm.student_impact_index)                         AS sii,
         avg(sm.digital_skills_index)                         AS dsi,
         avg(sm.learning_experience_index)                    AS lei,
         100.0 * avg(sm.ai_adopter::int)                      AS ai_adoption,
         100.0 * avg(sm.coding_improved::int)                 AS coding,
         100.0 * avg(sm.cyber_aware::int)                     AS cyber,
         100.0 * avg(sm.self_learner::int)                    AS self_learning,
         100.0 * avg(sm.reports_negative_impact::int)         AS negative_impact,
         100.0 * avg(sm.reports_pressure::int)                AS pressure,
         100.0 * avg(sm.reports_subject_tradeoff::int)        AS tradeoff,
         100.0 * avg(sm.reports_more_phone_use::int)          AS phone_use,
         100.0 * avg((NOT sm.has_no_device)::int)             AS any_device
       FROM student_metrics sm
       ${where}`,
      params,
    );
    const r = rows[0];
    return {
      students: int(r.students),
      schools: int(r.schools),
      studentImpactIndex: pct(r.sii),
      digitalSkillsIndex: pct(r.dsi),
      learningExperienceIndex: pct(r.lei),
      aiAdoptionRate: pct(r.ai_adoption),
      codingRate: pct(r.coding),
      cyberSafetyRate: pct(r.cyber),
      selfLearningRate: pct(r.self_learning),
      negativeImpactRate: pct(r.negative_impact),
      academicPressureRate: pct(r.pressure),
      subjectTradeoffRate: pct(r.tradeoff),
      increasedPhoneUseRate: pct(r.phone_use),
      deviceAccessRate: pct(r.any_device),
    };
  }

  /**
   * Per-indicator scores and response distributions for one index family,
   * sorted by score descending (rankings) — the frontend never re-sorts.
   */
  async getIndicators(filters: FilterQueryDto, indexCode: IndexCode, onlyInIndex = false): Promise<IndicatorRow[]> {
    const { where, params, next } = buildFilter(filters, 'sis');
    const { rows } = await this.pool.query(
      `SELECT ic.indicator_key                                          AS key,
              ic.label_en                                               AS label,
              ic.dimension,
              ic.in_index,
              ic.higher_is_better,
              count(sis.score)::int                                     AS responses,
              100.0 * avg(sis.score)                                    AS score,
              100.0 * avg((sis.answer = 'yes')::int)                    AS yes_pct,
              100.0 * avg((sis.answer = 'no_change')::int)              AS no_change_pct,
              100.0 * avg((sis.answer = 'no')::int)                     AS no_pct
         FROM student_indicator_scores sis
         JOIN indicator_catalog ic ON ic.indicator_key = sis.indicator_key
        ${where}
          AND ic.index_code = $${next}
          ${onlyInIndex ? 'AND ic.in_index' : ''}
        GROUP BY ic.indicator_key, ic.label_en, ic.dimension, ic.in_index,
                 ic.higher_is_better, ic.display_order
        ORDER BY avg(sis.score) DESC`,
      [...params, indexCode],
    );
    return rows.map((r) => ({
      key: r.key,
      label: r.label,
      dimension: r.dimension,
      score: pct(r.score),
      yesPct: pct(r.yes_pct),
      noChangePct: pct(r.no_change_pct),
      noPct: pct(r.no_pct),
      responses: int(r.responses),
      inIndex: r.in_index,
      higherIsBetter: r.higher_is_better,
    }));
  }

  /** Mean of each index grouped by school / grade / gender / age band. */
  async getBreakdown(
    filters: FilterQueryDto,
    dimension: 'high_school' | 'grade' | 'gender' | 'age_band',
    sortBy: 'value' | 'label' = 'value',
  ): Promise<BreakdownRow[]> {
    const { where, params } = buildFilter(filters);
    const orderBy =
      sortBy === 'label'
        ? dimension === 'age_band'
          ? 'min(sm.age_band_order)'
          : `sm.${dimension}`
        : 'avg(sm.student_impact_index) DESC';
    const label = dimension === 'age_band' ? 'sm.age_band_en' : `sm.${dimension}`;

    const { rows } = await this.pool.query(
      `SELECT ${label}                              AS label,
              count(*)::int                         AS students,
              avg(sm.student_impact_index)          AS sii,
              avg(sm.digital_skills_index)          AS dsi,
              avg(sm.learning_experience_index)     AS lei
         FROM student_metrics sm
        ${where}
        GROUP BY ${label}${dimension === 'age_band' ? '' : ''}
        ORDER BY ${orderBy}`,
      params,
    );
    return rows.map((r) => ({
      label: r.label,
      students: int(r.students),
      studentImpactIndex: pct(r.sii),
      digitalSkillsIndex: pct(r.dsi),
      learningExperienceIndex: pct(r.lei),
    }));
  }

  /** Mean score per dimension group (e.g. "Infrastructure", "Teacher Support"). */
  async getDimensionScores(filters: FilterQueryDto, indexCode: IndexCode) {
    const { where, params, next } = buildFilter(filters, 'sis');
    const { rows } = await this.pool.query(
      `SELECT ic.dimension,
              100.0 * avg(sis.score) AS score,
              count(DISTINCT ic.indicator_key)::int AS indicators
         FROM student_indicator_scores sis
         JOIN indicator_catalog ic ON ic.indicator_key = sis.indicator_key AND ic.in_index
        ${where} AND ic.index_code = $${next}
        GROUP BY ic.dimension
        ORDER BY avg(sis.score) DESC`,
      [...params, indexCode],
    );
    return rows.map((r) => ({ dimension: r.dimension, score: pct(r.score), indicators: int(r.indicators) }));
  }

  /** Share of students answering 'yes' to a single indicator, grouped. */
  async getRateBy(
    filters: FilterQueryDto,
    indicatorKey: string,
    dimension: 'high_school' | 'grade' | 'gender' | 'age_band',
  ) {
    const { where, params, next } = buildFilter(filters, 'sis');
    const label = dimension === 'age_band' ? 'sis.age_band' : `sis.${dimension}`;
    const { rows } = await this.pool.query(
      `SELECT ${label} AS label,
              count(*)::int AS students,
              100.0 * avg((sis.answer = 'yes')::int) AS rate
         FROM student_indicator_scores sis
        ${where} AND sis.indicator_key = $${next}
        GROUP BY ${label}
        ORDER BY avg((sis.answer = 'yes')::int) DESC`,
      [...params, indicatorKey],
    );
    return rows.map((r) => ({ label: r.label, students: int(r.students), rate: pct(r.rate) }));
  }

  /** School x indicator matrix for the heatmap. */
  async getSchoolIndicatorMatrix(filters: FilterQueryDto, indexCode: IndexCode) {
    const { where, params, next } = buildFilter(filters, 'sis');
    const { rows } = await this.pool.query(
      `SELECT sis.high_school AS school,
              ic.dimension,
              100.0 * avg(sis.score) AS score,
              count(DISTINCT sis.respondent_id)::int AS students
         FROM student_indicator_scores sis
         JOIN indicator_catalog ic ON ic.indicator_key = sis.indicator_key AND ic.in_index
        ${where} AND ic.index_code = $${next}
        GROUP BY sis.high_school, ic.dimension
        ORDER BY sis.high_school, ic.dimension`,
      [...params, indexCode],
    );

    const schools = [...new Set(rows.map((r) => r.school as string))];
    const dimensions = [...new Set(rows.map((r) => r.dimension as string))];
    const matrix = schools.map((school) => {
      const cells: Record<string, number | null> = {};
      let students = 0;
      for (const dimension of dimensions) {
        const hit = rows.find((r) => r.school === school && r.dimension === dimension);
        cells[dimension] = hit ? pct(hit.score) : null;
        if (hit) students = Math.max(students, int(hit.students));
      }
      return { school, students, cells };
    });
    return { dimensions, rows: matrix };
  }

  /* ---------------------------------------------------------------- */
  /* Page payloads                                                     */
  /* ---------------------------------------------------------------- */

  /** Page 1 — Executive Overview. */
  async getOverview(filters: FilterQueryDto) {
    const [headline, impact, skills, experience, improvements, challenges] = await Promise.all([
      this.getHeadline(filters),
      this.getIndicators(filters, 'SII', true),
      this.getIndicators(filters, 'DSI', true),
      this.getIndicators(filters, 'LEI', true),
      this.themes.getThemeRanking(filters, 'Areas for Improvement', 8),
      this.themes.getThemeRanking(filters, 'Challenge', 8),
    ]);

    const all = [...impact, ...skills, ...experience].filter((i) => i.score !== null);
    const strongest = all.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a), all[0]);
    const weakest = all.reduce((a, b) => ((b.score ?? 100) < (a.score ?? 100) ? b : a), all[0]);

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
        topImprovement: improvements[0]
          ? { label: improvements[0].theme, value: improvements[0].students }
          : null,
        topChallenge: challenges[0]
          ? { label: challenges[0].theme, value: challenges[0].students }
          : null,
      },
    };
  }

  /** Page 2 — Student Profile & Access. */
  async getProfile(filters: FilterQueryDto) {
    const { where, params } = buildFilter(filters);

    const [headline, bySchool, byGrade, byGender, byAge, devices, devicesBySchool, services] =
      await Promise.all([
        this.getHeadline(filters),
        this.pool.query(
          `SELECT sm.high_school AS label, count(*)::int AS students
             FROM student_metrics sm ${where}
            GROUP BY 1 ORDER BY 2 DESC`, params),
        this.pool.query(
          `SELECT sm.grade AS label, count(*)::int AS students
             FROM student_metrics sm ${where}
            GROUP BY 1, sm.grade_number ORDER BY sm.grade_number`, params),
        this.pool.query(
          `SELECT sm.gender AS label, count(*)::int AS students
             FROM student_metrics sm ${where}
            GROUP BY 1 ORDER BY 2 DESC`, params),
        this.pool.query(
          `SELECT sm.age_band_en AS label, count(*)::int AS students
             FROM student_metrics sm ${where}
            GROUP BY 1, sm.age_band_order ORDER BY sm.age_band_order`, params),
        this.pool.query(
          `SELECT count(*)::int                                    AS students,
                  100.0 * avg(sm.has_computer::int)                AS computer,
                  100.0 * avg(sm.has_smartphone::int)              AS smartphone,
                  100.0 * avg(sm.has_tablet::int)                  AS tablet,
                  100.0 * avg(sm.has_no_device::int)               AS none
             FROM student_metrics sm ${where}`, params),
        this.pool.query(
          `SELECT sm.high_school AS label,
                  count(*)::int AS students,
                  100.0 * avg(sm.has_computer::int)   AS computer,
                  100.0 * avg(sm.has_smartphone::int) AS smartphone,
                  100.0 * avg(sm.has_tablet::int)     AS tablet,
                  100.0 * avg(sm.has_no_device::int)  AS none
             FROM student_metrics sm ${where}
            GROUP BY 1 ORDER BY avg(sm.has_no_device::int) DESC`, params),
        this.pool.query(
          `SELECT 100.0 * avg(s.used_short_courses::int) AS short_courses,
                  100.0 * avg(s.used_coffee_shop::int)   AS coffee_shop,
                  100.0 * avg(s.used_post_office::int)   AS post_office,
                  100.0 * avg(s.used_no_service::int)    AS none
             FROM student_responses s
             JOIN student_metrics sm ON sm.respondent_id = s.respondent_id ${where}`, params),
      ]);

    const d = devices.rows[0];
    const sv = services.rows[0];
    return {
      headline,
      bySchool: bySchool.rows,
      byGrade: byGrade.rows,
      byGender: byGender.rows,
      byAge: byAge.rows,
      deviceAccess: [
        { label: 'Smartphone', rate: pct(d.smartphone) },
        { label: 'Computer', rate: pct(d.computer) },
        { label: 'Tablet', rate: pct(d.tablet) },
        { label: 'No personal device', rate: pct(d.none) },
      ],
      deviceAccessBySchool: devicesBySchool.rows.map((r) => ({
        label: r.label,
        students: int(r.students),
        computer: pct(r.computer),
        smartphone: pct(r.smartphone),
        tablet: pct(r.tablet),
        none: pct(r.none),
      })),
      serviceUse: [
        { label: 'Short courses', rate: pct(sv.short_courses) },
        { label: 'Coffee shop', rate: pct(sv.coffee_shop) },
        { label: 'Post office', rate: pct(sv.post_office) },
        { label: 'No service used', rate: pct(sv.none) },
      ],
    };
  }

  /** Page 3 — Student Impact. */
  async getImpact(filters: FilterQueryDto) {
    const [headline, indicators, dimensions, bySchool, byGrade, byGender, byAge, themes] = await Promise.all([
      this.getHeadline(filters),
      this.getIndicators(filters, 'SII', true),
      this.getDimensionScores(filters, 'SII'),
      this.getBreakdown(filters, 'high_school'),
      this.getBreakdown(filters, 'grade', 'label'),
      this.getBreakdown(filters, 'gender'),
      this.getBreakdown(filters, 'age_band', 'label'),
      this.themes.getThemeRanking(filters, 'Positive Impact', 12),
    ]);
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
      positiveThemes: themes,
    };
  }

  /** Page 4 — Digital Skills & AI. */
  async getDigitalSkills(filters: FilterQueryDto) {
    const [headline, indicators, supporting, aiBySchool, aiByGrade, aiByGender, aiTools, subjects] =
      await Promise.all([
        this.getHeadline(filters),
        this.getIndicators(filters, 'DSI', true),
        this.getIndicators(filters, 'DSI', false),
        this.getRateBy(filters, 'can_use_ai', 'high_school'),
        this.getRateBy(filters, 'can_use_ai', 'grade'),
        this.getRateBy(filters, 'can_use_ai', 'gender'),
        this.themes.getThemeRanking(filters, 'AI Tools Used', 10),
        this.themes.getThemeRanking(filters, 'Favorite Subjects', 10),
      ]);

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
      /** Negative gap = below the average of all digital skill indicators. */
      skillGaps: indicators
        .map((i) => ({ ...i, gap: pct((i.score ?? 0) - average) }))
        .filter((i) => (i.gap ?? 0) < 0)
        .sort((a, b) => (a.gap ?? 0) - (b.gap ?? 0)),
      perceivedValue: supporting.filter((i) => !i.inIndex),
      aiAdoptionBySchool: aiBySchool,
      aiAdoptionByGrade: aiByGrade.sort((a, b) => a.label.localeCompare(b.label)),
      aiAdoptionByGender: aiByGender,
      aiTools,
      favoriteSubjects: subjects,
    };
  }

  /** Page 5 — Learning Experience. */
  async getExperience(filters: FilterQueryDto) {
    const [headline, indicators, dimensions, bySchool, matrix] = await Promise.all([
      this.getHeadline(filters),
      this.getIndicators(filters, 'LEI', true),
      this.getDimensionScores(filters, 'LEI'),
      this.getBreakdown(filters, 'high_school'),
      this.getSchoolIndicatorMatrix(filters, 'LEI'),
    ]);
    const byDimension = (name: string) => dimensions.find((d) => d.dimension === name)?.score ?? null;
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
      bySchool: bySchool
        .map((r) => ({ ...r }))
        .sort((a, b) => (b.learningExperienceIndex ?? 0) - (a.learningExperienceIndex ?? 0)),
      schoolMatrix: matrix,
    };
  }

  /** Page 6 — Risk & Improvement. */
  async getRisk(filters: FilterQueryDto) {
    const { where, params } = buildFilter(filters);
    const [headline, riskIndicators, pressureBySchool, tradeoffBySchool, challenges, improvements, suggestions, negatives, challengeStudents] =
      await Promise.all([
        this.getHeadline(filters),
        this.getIndicators(filters, 'RISK', false),
        this.getRateBy(filters, 'study_pressure', 'high_school'),
        this.getRateBy(filters, 'drop_other_subjects', 'high_school'),
        this.themes.getThemeRanking(filters, 'Challenge', 10),
        this.themes.getThemeRanking(filters, 'Areas for Improvement', 10),
        this.themes.getThemeRanking(filters, 'Suggestion', 10),
        this.themes.getThemeRanking(filters, 'Negative Impact', 10),
        this.pool.query(
          `SELECT count(DISTINCT t.respondent_id)::int AS students
             FROM student_metrics sm
             JOIN meaningful_response_themes t ON t.respondent_id = sm.respondent_id
            ${where} AND t.question_type = 'Challenge'`, params),
      ]);

    const totalStudents = headline.students;
    const withChallenges = int(challengeStudents.rows[0]?.students);

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
}
