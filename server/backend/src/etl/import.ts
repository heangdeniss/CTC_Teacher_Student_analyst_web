/**
 * Reproducible import: Raw CSV -> Validate -> Clean / Normalize -> PostgreSQL.
 *
 * Run with:  npm run etl
 * The raw CSV files are read-only inputs and are never rewritten.
 */

import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'csv-parse';
import { Pool, PoolClient } from 'node_modules/@types/pg';
import {
  AnswerCode,
  cleanText,
  normalizeAgeBand,
  normalizeAnswer,
  normalizeDevices,
  normalizeGender,
  normalizeGrade,
  normalizeQuestionType,
  normalizeSchool,
  normalizeServices,
  normalizeTheme,
} from './normalize';

/* ------------------------------------------------------------------ */
/* Column definitions                                                  */
/* ------------------------------------------------------------------ */

/** Every column stored as an `answer_code`. Order matters for the INSERT. */
export const ANSWER_COLUMNS = [
  'want_study_more', 'stem_interest', 'self_study', 'equal_opportunity',
  'future_confidence', 'uni_aspiration', 'education_confidence',
  'better_discipline', 'braver', 'join_competitions',
  'better_computer_internet_skills', 'better_email_docs', 'better_presentations',
  'better_design_content', 'better_internet_research', 'can_use_ai',
  'understand_cyber_risks', 'better_password_management', 'better_coding_skills',
  'better_self_learning', 'skills_useful_future', 'share_skills_with_community',
  'adequate_computers', 'good_internet', 'enough_practice_time',
  'enough_access_for_self_study', 'teachers_explain_timely', 'teachers_more_attentive',
  'active_teaching_methods', 'engaging_lessons', 'enjoy_digital', 'different_method',
  'presentation_opportunities', 'teamwork_opportunities', 'prepare_before_class',
  'know_internal_rules',
  'study_pressure', 'drop_other_subjects', 'use_phone_more',
  'told_parents', 'parents_satisfied', 'told_others',
] as const;

export const OPEN_TEXT_COLUMNS = [
  'open_positive_impacts', 'open_negative_impacts', 'open_ai_tools_used',
  'open_favorite_subjects', 'open_suggestions', 'open_outstanding_points',
  'open_areas_for_improvement', 'open_challenges', 'open_other_comments',
] as const;

const REQUIRED_STRUCTURED_COLUMNS = [
  'respondent_id', 'response_id', 'timestamp', 'gender', 'grade', 'age',
  'high_school', 'devices_owned', 'services_used_at_ctc',
  ...ANSWER_COLUMNS,
];

const REQUIRED_THEME_COLUMNS = ['respondent_id', 'Theme', 'Question_Type'];

/* ------------------------------------------------------------------ */
/* Validation report                                                   */
/* ------------------------------------------------------------------ */

export interface ImportReport {
  structured: {
    rowsRead: number;
    rowsLoaded: number;
    duplicateRespondentIds: number[];
    invalidRespondentIds: number;
    unknownAnswerValues: Record<string, number>;
    unmappedAgeBands: string[];
    schoolsNormalized: number;
    distinctSchools: number;
  };
  themes: {
    rowsRead: number;
    rowsLoaded: number;
    exactDuplicates: number;
    orphanRespondentIds: number;
    distinctThemes: number;
    distinctQuestionTypes: number;
  };
  integrity: {
    structuredIds: number;
    themeIds: number;
    idsMissingThemes: number;
    themeIdsNotInStructured: number;
  };
}

/* ------------------------------------------------------------------ */
/* CSV reading                                                         */
/* ------------------------------------------------------------------ */

async function readCsv(path: string): Promise<Record<string, string>[]> {
  const rows: Record<string, string>[] = [];
  const parser = createReadStream(path).pipe(
    parse({ columns: true, bom: true, skip_empty_lines: true, relax_column_count: true, trim: false }),
  );
  for await (const row of parser) rows.push(row as Record<string, string>);
  return rows;
}

function assertColumns(rows: Record<string, string>[], required: string[], file: string): void {
  if (rows.length === 0) throw new Error(`${file} contains no data rows`);
  const present = new Set(Object.keys(rows[0]));
  const missing = required.filter((c) => !present.has(c));
  if (missing.length > 0) {
    throw new Error(`${file} is missing required column(s): ${missing.join(', ')}`);
  }
}

/* ------------------------------------------------------------------ */
/* Structured transform                                                */
/* ------------------------------------------------------------------ */

interface StudentRow {
  values: unknown[];
}

const STUDENT_COLUMNS = [
  'respondent_id', 'response_id', 'submitted_at',
  'gender', 'gender_en', 'grade', 'grade_number',
  'age_band', 'age_band_en', 'age_band_order', 'high_school',
  'devices_owned_raw', 'has_computer', 'has_smartphone', 'has_tablet', 'has_no_device', 'device_count',
  'services_used_raw', 'used_short_courses', 'used_coffee_shop', 'used_post_office', 'used_no_service',
  ...ANSWER_COLUMNS,
  ...OPEN_TEXT_COLUMNS,
];

function transformStructured(rows: Record<string, string>[], report: ImportReport): StudentRow[] {
  const seen = new Set<number>();
  const out: StudentRow[] = [];

  for (const row of rows) {
    const respondentId = Number(cleanText(row.respondent_id));
    if (!Number.isInteger(respondentId) || respondentId <= 0) {
      report.structured.invalidRespondentIds += 1;
      continue;
    }
    if (seen.has(respondentId)) {
      report.structured.duplicateRespondentIds.push(respondentId);
      continue; // keep the first occurrence
    }
    seen.add(respondentId);

    const grade = normalizeGrade(row.grade);
    const age = normalizeAgeBand(row.age);
    if (!age) {
      const raw = cleanText(row.age) ?? '(blank)';
      if (!report.structured.unmappedAgeBands.includes(raw)) {
        report.structured.unmappedAgeBands.push(raw);
      }
    }

    const rawSchool = cleanText(row.high_school);
    const school = normalizeSchool(row.high_school);
    if (school !== rawSchool) report.structured.schoolsNormalized += 1;

    const devices = normalizeDevices(row.devices_owned);
    const services = normalizeServices(row.services_used_at_ctc);

    const answers: (AnswerCode | null)[] = ANSWER_COLUMNS.map((column) => {
      const code = normalizeAnswer(row[column]);
      if (code === null) {
        const raw = cleanText(row[column]);
        if (raw !== null) {
          const key = `${column}=${raw}`;
          report.structured.unknownAnswerValues[key] =
            (report.structured.unknownAnswerValues[key] ?? 0) + 1;
        }
      }
      return code;
    });

    out.push({
      values: [
        respondentId,
        cleanText(row.response_id),
        cleanText(row.timestamp),
        normalizeGender(row.gender),
        normalizeGender(row.gender),
        grade?.grade ?? null,
        grade?.gradeNumber ?? null,
        age?.ageBand ?? cleanText(row.age),
        age?.ageBandEn ?? 'Unknown',
        age?.order ?? 99,
        school,
        devices.raw,
        devices.hasComputer, devices.hasSmartphone, devices.hasTablet, devices.hasNoDevice, devices.deviceCount,
        services.raw,
        services.usedShortCourses, services.usedCoffeeShop, services.usedPostOffice, services.usedNoService,
        ...answers,
        ...OPEN_TEXT_COLUMNS.map((column) => cleanText(row[column])),
      ],
    });
  }

  report.structured.distinctSchools = new Set(
    out.map((r) => r.values[STUDENT_COLUMNS.indexOf('high_school')]),
  ).size;
  return out;
}

/* ------------------------------------------------------------------ */
/* Theme transform                                                     */
/* ------------------------------------------------------------------ */

interface ThemeRow {
  respondentId: number;
  theme: string;
  questionType: string;
}

function transformThemes(
  rows: Record<string, string>[],
  validIds: Set<number>,
  report: ImportReport,
): ThemeRow[] {
  const seen = new Set<string>();
  const out: ThemeRow[] = [];

  for (const row of rows) {
    const respondentId = Number(cleanText(row.respondent_id));
    const theme = normalizeTheme(row.Theme);
    const questionType = normalizeQuestionType(row.Question_Type);
    if (!Number.isInteger(respondentId) || theme === null || questionType === null) continue;

    if (!validIds.has(respondentId)) {
      report.themes.orphanRespondentIds += 1;
      continue;
    }
    const key = `${respondentId}|${theme}|${questionType}`;
    if (seen.has(key)) {
      report.themes.exactDuplicates += 1;
      continue;
    }
    seen.add(key);
    out.push({ respondentId, theme, questionType });
  }

  report.themes.distinctThemes = new Set(out.map((t) => t.theme)).size;
  report.themes.distinctQuestionTypes = new Set(out.map((t) => t.questionType)).size;
  return out;
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

async function insertBatched(
  client: PoolClient,
  table: string,
  columns: string[],
  rows: unknown[][],
  batchSize = 400,
): Promise<number> {
  let inserted = 0;
  for (let offset = 0; offset < rows.length; offset += batchSize) {
    const batch = rows.slice(offset, offset + batchSize);
    const params: unknown[] = [];
    const tuples = batch.map((row) => {
      const placeholders = row.map((value) => {
        params.push(value);
        return `$${params.length}`;
      });
      return `(${placeholders.join(',')})`;
    });
    const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES ${tuples.join(',')}`;
    const result = await client.query(sql, params);
    inserted += result.rowCount ?? 0;
  }
  return inserted;
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

export async function runImport(pool: Pool, dataDir: string): Promise<ImportReport> {
  const structuredPath = resolve(dataDir, 'Structured.csv');
  const unstructuredPath = resolve(dataDir, 'Unstructuerd.csv');

  const report: ImportReport = {
    structured: {
      rowsRead: 0, rowsLoaded: 0, duplicateRespondentIds: [], invalidRespondentIds: 0,
      unknownAnswerValues: {}, unmappedAgeBands: [], schoolsNormalized: 0, distinctSchools: 0,
    },
    themes: {
      rowsRead: 0, rowsLoaded: 0, exactDuplicates: 0, orphanRespondentIds: 0,
      distinctThemes: 0, distinctQuestionTypes: 0,
    },
    integrity: { structuredIds: 0, themeIds: 0, idsMissingThemes: 0, themeIdsNotInStructured: 0 },
  };

  console.log('→ Phase 1  reading CSV files');
  const structuredRaw = await readCsv(structuredPath);
  const themesRaw = await readCsv(unstructuredPath);
  report.structured.rowsRead = structuredRaw.length;
  report.themes.rowsRead = themesRaw.length;

  console.log('→ Phase 2  validating structure');
  assertColumns(structuredRaw, REQUIRED_STRUCTURED_COLUMNS, 'Structured.csv');
  assertColumns(themesRaw, REQUIRED_THEME_COLUMNS, 'Unstructuerd.csv');

  console.log('→ Phase 3  cleaning and normalising');
  const students = transformStructured(structuredRaw, report);
  const validIds = new Set(students.map((s) => s.values[0] as number));
  const themes = transformThemes(themesRaw, validIds, report);

  const themeIds = new Set(themes.map((t) => t.respondentId));
  report.integrity.structuredIds = validIds.size;
  report.integrity.themeIds = themeIds.size;
  report.integrity.idsMissingThemes = [...validIds].filter((id) => !themeIds.has(id)).length;
  report.integrity.themeIdsNotInStructured = report.themes.orphanRespondentIds;

  const unknownAnswers = Object.keys(report.structured.unknownAnswerValues);
  if (unknownAnswers.length > 0) {
    console.warn(`  ! ${unknownAnswers.length} unmapped answer value(s):`, unknownAnswers.slice(0, 10));
  }
  if (report.structured.unmappedAgeBands.length > 0) {
    console.warn('  ! unmapped age bands:', report.structured.unmappedAgeBands);
  }

  console.log('→ Phase 4  loading into PostgreSQL');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const run = await client.query<{ id: string }>(
      `INSERT INTO import_runs (structured_file, unstructured_file, structured_rows_read, theme_rows_read)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [structuredPath, unstructuredPath, report.structured.rowsRead, report.themes.rowsRead],
    );

    await client.query('TRUNCATE response_themes, student_responses RESTART IDENTITY CASCADE');

    report.structured.rowsLoaded = await insertBatched(
      client, 'student_responses', STUDENT_COLUMNS, students.map((s) => s.values), 200,
    );
    report.themes.rowsLoaded = await insertBatched(
      client, 'response_themes', ['respondent_id', 'theme', 'question_type'],
      themes.map((t) => [t.respondentId, t.theme, t.questionType]), 1000,
    );

    await client.query(
      `UPDATE import_runs
          SET finished_at = now(), structured_rows_kept = $2, theme_rows_kept = $3, report = $4
        WHERE id = $1`,
      [run.rows[0].id, report.structured.rowsLoaded, report.themes.rowsLoaded, JSON.stringify(report)],
    );
    await client.query('COMMIT');
    await client.query('ANALYZE');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  console.log('→ Phase 5  done');
  console.log(`  students loaded : ${report.structured.rowsLoaded} / ${report.structured.rowsRead}`);
  console.log(`  theme rows      : ${report.themes.rowsLoaded} / ${report.themes.rowsRead} ` +
              `(${report.themes.exactDuplicates} exact duplicates removed)`);
  console.log(`  schools         : ${report.structured.distinctSchools}`);
  console.log(`  integrity       : ${report.integrity.themeIdsNotInStructured} orphan theme ids, ` +
              `${report.integrity.idsMissingThemes} students without themes`);
  return report;
}
