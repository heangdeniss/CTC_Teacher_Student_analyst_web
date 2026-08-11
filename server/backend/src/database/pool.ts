import { Pool } from 'node_modules/@types/pg';
import { config as loadEnv } from 'dotenv';

loadEnv();

let pool: Pool | null = null;

/** Shared connection pool. One pool per process. */
export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set — copy .env.example to .env first.');
    }
    pool = new Pool({
      connectionString,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.PG_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
