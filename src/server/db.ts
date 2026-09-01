import { randomUUID } from 'crypto';
import { Pool } from 'pg';

type QueryResponse<T> = {
  rows: T[];
  rowCount: number | null;
  skipped?: boolean;
};

let pool: Pool | null | undefined;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (pool === undefined) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export async function dbQuery<T = any>(text: string, params: unknown[] = []): Promise<QueryResponse<T>> {
  const activePool = getPool();
  if (!activePool) {
    return { rows: [], rowCount: 0, skipped: true };
  }

  const result = await activePool.query<T>(text, params);
  return { rows: result.rows, rowCount: result.rowCount };
}

export async function recordAutomationEvent(input: {
  topic: string;
  payload: unknown;
  source?: string;
  headers?: Record<string, string>;
}) {
  const id = randomUUID();

  try {
    const result = await dbQuery<{ id: string }>(
      `insert into n8n_webhook_events (id, topic, source, payload, headers)
       values ($1, $2, $3, $4::jsonb, $5::jsonb)
       returning id`,
      [
        id,
        input.topic,
        input.source || 'n8n',
        JSON.stringify(input.payload || {}),
        JSON.stringify(input.headers || {}),
      ]
    );

    return {
      id,
      stored: !result.skipped,
      databaseConfigured: isDatabaseConfigured(),
    };
  } catch (error: any) {
    return {
      id,
      stored: false,
      databaseConfigured: isDatabaseConfigured(),
      error: error?.message || 'Failed to record automation event',
    };
  }
}
