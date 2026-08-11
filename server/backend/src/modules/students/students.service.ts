import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'node_modules/@types/pg';
import { PG_POOL } from '../../database/database.module';
import { FilterQueryDto, buildFilter, int } from '../../common/filters';

@Injectable()
export class StudentsService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  /** Paginated student-level detail — supports the analytical tables. */
  async list(filters: FilterQueryDto, limit = 50, offset = 0) {
    const { where, params, next } = buildFilter(filters);
    const [rows, total] = await Promise.all([
      this.pool.query(
        `SELECT sm.respondent_id, sm.high_school, sm.grade, sm.gender, sm.age_band_en,
                sm.student_impact_index, sm.digital_skills_index, sm.learning_experience_index,
                sm.ai_adopter, sm.reports_negative_impact
           FROM student_metrics sm ${where}
          ORDER BY sm.respondent_id
          LIMIT $${next} OFFSET $${next + 1}`,
        [...params, limit, offset],
      ),
      this.pool.query(`SELECT count(*)::int AS total FROM student_metrics sm ${where}`, params),
    ]);
    return { total: int(total.rows[0].total), limit, offset, items: rows.rows };
  }

  /** Row counts for the validation phase. */
  async getDataQuality() {
    const { rows } = await this.pool.query(`
      SELECT (SELECT count(*) FROM student_responses)                       AS students,
             (SELECT count(*) FROM response_themes)                         AS theme_rows,
             (SELECT count(*) FROM meaningful_response_themes)              AS meaningful_theme_rows,
             (SELECT count(DISTINCT theme) FROM response_themes)            AS distinct_themes,
             (SELECT count(DISTINCT theme) FROM meaningful_response_themes) AS meaningful_themes,
             (SELECT count(*) FROM theme_exclusions)                        AS excluded_themes,
             (SELECT count(DISTINCT high_school) FROM student_responses)    AS schools,
             (SELECT max(finished_at) FROM import_runs)                     AS last_import`);
    return rows[0];
  }
}
