import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString } from 'class-validator';

/**
 * Global dashboard filters. Every analytics endpoint accepts these and
 * applies them identically, so KPI cards and charts always agree.
 *
 * Query string format: ?schools=A&schools=B  or  ?schools=A,B
 */

const toArray = ({ value }: { value: unknown }): string[] | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const raw = Array.isArray(value) ? value : [value];
  const flattened = raw
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return flattened.length > 0 ? flattened : undefined;
};

export class FilterQueryDto {
  @IsOptional() @IsArray() @IsString({ each: true }) @Transform(toArray)
  schools?: string[];

  @IsOptional() @IsArray() @IsString({ each: true }) @Transform(toArray)
  grades?: string[];

  @IsOptional() @IsArray() @IsString({ each: true }) @Transform(toArray)
  genders?: string[];

  @IsOptional() @IsArray() @IsString({ each: true }) @Transform(toArray)
  ages?: string[];
}

export interface SqlFilter {
  /** Always non-empty, always begins with `WHERE`. */
  where: string;
  params: unknown[];
  /** Next free positional parameter index. */
  next: number;
}

/**
 * Builds the shared WHERE clause. `alias` must expose high_school, grade,
 * gender and age_band — true for student_responses, student_metrics and
 * student_indicator_scores.
 */
export function buildFilter(
  filters: FilterQueryDto,
  alias = 'sm',
  startIndex = 1,
): SqlFilter {
  const clauses: string[] = ['TRUE'];
  const params: unknown[] = [];
  let index = startIndex;

  const add = (column: string, values?: string[]): void => {
    if (!values || values.length === 0) return;
    clauses.push(`${alias}.${column} = ANY($${index}::text[])`);
    params.push(values);
    index += 1;
  };

  add('high_school', filters.schools);
  add('grade', filters.grades);
  add('gender', filters.genders);
  add('age_band', filters.ages);

  return { where: `WHERE ${clauses.join(' AND ')}`, params, next: index };
}

/** Rounds to one decimal, preserving null. */
export function pct(value: string | number | null): number | null {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value) * 10) / 10;
}

export function int(value: string | number | null): number {
  return value === null || value === undefined ? 0 : Number(value);
}
