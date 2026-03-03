import { Pool, PoolClient, QueryResult } from 'pg';
import fs from 'fs';
import path from 'path';

export class Database {
  private pool: Pool;
  private static instance: Database;

  private constructor() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/crew_reports';
    this.pool = new Pool({ connectionString });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async initialize(): Promise<void> {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    try {
      await this.pool.query(schema);
      console.log('Database initialized successfully');
    } catch (err) {
      console.error('Error initializing database:', err);
      throw err;
    }
  }

  public async query(sql: string, params: unknown[] = []): Promise<QueryResult> {
    return this.pool.query(sql, params);
  }

  public async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export default Database;
