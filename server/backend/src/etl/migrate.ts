/**
 * Applies every SQL file in database/migrations (then database/seeds) in
 * lexical order, exactly once. Tracked in the schema_migrations table.
 *
 * Run with: npm run db:migrate
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { closePool, getPool } from '../database/pool';

const ROOT = resolve(__dirname, '../../..', 'database');

async function applyDirectory(dir: string, kind: string): Promise<void> {
  const pool = getPool();
  const files = readdirSync(join(ROOT, dir)).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const key = `${dir}/${file}`;
    const { rowCount } = await pool.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [key]);
    if (rowCount) {
      console.log(`  = ${key} (already applied)`);
      continue;
    }
    const sql = readFileSync(join(ROOT, dir, file), 'utf8');
    console.log(`  + applying ${kind} ${key}`);
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [key]);
  }
}

async function main(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
  await applyDirectory('migrations', 'migration');
  await applyDirectory('seeds', 'seed');
  console.log('Database schema is up to date.');
}

main()
  .catch((error) => { console.error('Migration failed:', error.message); process.exitCode = 1; })
  .finally(closePool);
