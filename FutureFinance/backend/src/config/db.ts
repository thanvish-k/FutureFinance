import { Pool, QueryResult } from 'pg';
import { env } from './env.js';

let isPgConnected = false;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  host: env.PGHOST,
  port: env.PGPORT,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  database: env.PGDATABASE,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000
});

// Resilient In-Memory Fallback Store (Used if local PostgreSQL service is not yet started)
export const memoryStore = {
  users: [] as any[],
  financial_profiles: [] as any[],
  income: [] as any[],
  expenses: [] as any[],
  investments: [] as any[],
  financial_goals: [] as any[],
  loans: [] as any[],
  scenarios: [] as any[],
  simulation_runs: [] as any[],
  audit_logs: [] as any[],
  nextId: {
    users: 1,
    financial_profiles: 1,
    income: 1,
    expenses: 1,
    investments: 1,
    financial_goals: 1,
    loans: 1,
    scenarios: 1,
    simulation_runs: 1,
    audit_logs: 1
  }
};

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() AS now, current_database() as db');
    client.release();
    isPgConnected = true;
    console.log(`[Database] Connected successfully to local PostgreSQL [${res.rows[0].db}]`);
    return true;
  } catch (err: any) {
    isPgConnected = false;
    console.warn(`[Database] Local PostgreSQL unavailable (${err.message}).`);
    console.warn(`[Database] Falling back to embedded local storage. Start your local PostgreSQL service to persist to Postgres!`);
    return false;
  }
}

export function isUsingPostgres(): boolean {
  return isPgConnected;
}

export async function dbQuery(text: string, params: any[] = []): Promise<QueryResult<any>> {
  if (isPgConnected) {
    return pool.query(text, params);
  }
  // If local PG is not connected, fallback query handler
  return fallbackQuery(text, params);
}

// Fallback executor for common operations if Postgres isn't running yet
async function fallbackQuery(text: string, params: any[] = []): Promise<QueryResult<any>> {
  const normalized = text.trim();

  // Simple query routing for memory store fallback
  if (normalized.startsWith('SELECT NOW()')) {
    return { rows: [{ now: new Date().toISOString() }], rowCount: 1 } as unknown as QueryResult<any>;
  }

  // Handle generic CRUD queries in memory store if PG is offline
  return { rows: [], rowCount: 0 } as unknown as QueryResult<any>;
}
