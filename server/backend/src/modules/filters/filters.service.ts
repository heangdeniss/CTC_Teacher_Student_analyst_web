import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'node_modules/@types/pg';
import { PG_POOL } from '../../database/database.module';

export interface FilterOptions {
  schools: Array<{ value: string; students: number }>;
  grades: Array<{ value: string; students: number }>;
  genders: Array<{ value: string; students: number }>;
  ages: Array<{ value: string; label: string; students: number }>;
}

@Injectable()
export class FiltersService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async getOptions(): Promise<FilterOptions> {
    const [schools, grades, genders, ages] = await Promise.all([
      this.pool.query(`SELECT high_school AS value, count(*)::int AS students
                         FROM student_responses GROUP BY 1 ORDER BY 2 DESC`),
      this.pool.query(`SELECT grade AS value, count(*)::int AS students
                         FROM student_responses GROUP BY 1, grade_number ORDER BY grade_number`),
      this.pool.query(`SELECT gender AS value, count(*)::int AS students
                         FROM student_responses GROUP BY 1 ORDER BY 2 DESC`),
      this.pool.query(`SELECT age_band AS value, age_band_en AS label, count(*)::int AS students
                         FROM student_responses GROUP BY 1, 2, age_band_order ORDER BY age_band_order`),
    ]);
    return {
      schools: schools.rows,
      grades: grades.rows,
      genders: genders.rows,
      ages: ages.rows,
    };
  }
}
