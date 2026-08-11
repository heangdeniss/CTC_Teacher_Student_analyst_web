/**
 * CLI entry point for the import pipeline.
 * Run with: npm run etl
 */
import { resolve } from 'node:path';
import { closePool, getPool } from '../database/pool';
import { runImport } from './import';

const dataDir = resolve(__dirname, '../..', process.env.DATA_DIR ?? '../data/raw');

runImport(getPool(), dataDir)
  .catch((error) => { console.error('Import failed:', error.message); process.exitCode = 1; })
  .finally(closePool);
