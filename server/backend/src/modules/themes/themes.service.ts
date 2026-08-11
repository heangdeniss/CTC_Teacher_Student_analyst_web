import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'node_modules/@types/pg';
import { PG_POOL } from '../../database/database.module';
import { FilterQueryDto, buildFilter, int, pct } from '../../common/filters';

export interface ThemeRanking {
  theme: string;
  /** Unique students mentioning the theme — the student-level measure. */
  students: number;
  /** Raw theme occurrences (a student may be counted once per question type). */
  occurrences: number;
  /** students / filtered cohort size, as a percentage. */
  studentShare: number | null;
  /** students / students who gave any meaningful answer to this question. */
  respondentShare: number | null;
}

/**
 * All theme analytics read from `meaningful_response_themes`, the view that
 * removes every no-content / unclassified theme. Excluded themes can never
 * reach an endpoint, so they can never reach a chart.
 */
@Injectable()
export class ThemesService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async getThemeRanking(
    filters: FilterQueryDto,
    questionType: string,
    limit = 10,
  ): Promise<ThemeRanking[]> {
    const { where, params, next } = buildFilter(filters);
    const { rows } = await this.pool.query(
      `WITH cohort AS (
         SELECT sm.respondent_id FROM student_metrics sm ${where}
       ),
       tagged AS (
         SELECT t.theme, t.respondent_id
           FROM meaningful_response_themes t
           JOIN cohort c ON c.respondent_id = t.respondent_id
          WHERE t.question_type = $${next}
       ),
       totals AS (
         SELECT (SELECT count(*) FROM cohort)                        AS cohort_size,
                (SELECT count(DISTINCT respondent_id) FROM tagged)   AS responders
       )
       SELECT tg.theme,
              count(DISTINCT tg.respondent_id)::int AS students,
              count(*)::int                         AS occurrences,
              CASE WHEN t.cohort_size > 0
                   THEN 100.0 * count(DISTINCT tg.respondent_id) / t.cohort_size END AS student_share,
              CASE WHEN t.responders > 0
                   THEN 100.0 * count(DISTINCT tg.respondent_id) / t.responders END  AS respondent_share
         FROM tagged tg CROSS JOIN totals t
        GROUP BY tg.theme, t.cohort_size, t.responders
        ORDER BY students DESC, tg.theme
        LIMIT $${next + 1}`,
      [...params, questionType, limit],
    );
    return rows.map((r) => ({
      theme: r.theme,
      students: int(r.students),
      occurrences: int(r.occurrences),
      studentShare: pct(r.student_share),
      respondentShare: pct(r.respondent_share),
    }));
  }

  /** Distinct question types available for theme drill-down. */
  async getQuestionTypes(): Promise<string[]> {
    const { rows } = await this.pool.query(
      `SELECT DISTINCT question_type FROM meaningful_response_themes ORDER BY 1`,
    );
    return rows.map((r) => r.question_type as string);
  }

  /** Transparency endpoint: which themes are excluded and why. */
  async getExclusions(): Promise<Array<{ theme: string; reason: string; occurrences: number }>> {
    const { rows } = await this.pool.query(
      `SELECT te.theme, te.reason, count(rt.id)::int AS occurrences
         FROM theme_exclusions te
         LEFT JOIN response_themes rt ON rt.theme = te.theme
        GROUP BY te.theme, te.reason
        ORDER BY occurrences DESC, te.theme`,
    );
    return rows.map((r) => ({ theme: r.theme, reason: r.reason, occurrences: int(r.occurrences) }));
  }
}
