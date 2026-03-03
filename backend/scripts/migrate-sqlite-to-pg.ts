/**
 * One-time migration script: SQLite → PostgreSQL
 *
 * Reads all reports from the old SQLite database (with per-type tables)
 * and inserts them into the unified PostgreSQL reports table.
 *
 * Usage:
 *   cd backend
 *   npm install sqlite3  # temporarily re-install for migration
 *   DATABASE_URL=postgresql://... npx ts-node scripts/migrate-sqlite-to-pg.ts [path/to/crew_reports.db]
 *
 * Default SQLite path: backend/data/crew_reports.db
 */

import sqlite3 from 'sqlite3';
import { Pool } from 'pg';
import path from 'path';

const SQLITE_PATH = process.argv[2] || path.join(__dirname, '../data/crew_reports.db');
const PG_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/crew_reports';

// Map SQLite table → canonical report_type
const TABLE_MAP: Record<string, string> = {
  sol_summary_reports: 'sol_summary',
  operations_reports: 'operations_report',
  greenhab_reports: 'greenhab_report',
  eva_reports: 'eva_report',
  eva_requests: 'eva_request',
  journalist_reports: 'journalist_report',
  photos_of_the_day: 'photos_of_the_day',
  astronomy_reports: 'astronomy_report',
  hso_checklists: 'hso_checklist',
  checkout_checklists: 'checkout_checklist',
  food_inventories: 'food_inventory',
};

// Child tables that should be folded into report_data
const CHILD_TABLES: Record<string, { table: string; fkColumn: string; arrayKey: string }[]> = {
  operations_reports: [
    { table: 'operations_rover_readings', fkColumn: 'operations_report_id', arrayKey: 'rovers' },
  ],
  greenhab_reports: [
    { table: 'greenhab_watering_times', fkColumn: 'greenhab_report_id', arrayKey: 'watering_times' },
    { table: 'greenhab_harvests', fkColumn: 'greenhab_report_id', arrayKey: 'harvests' },
  ],
  photos_of_the_day: [
    { table: 'photo_attachments', fkColumn: 'photos_report_id', arrayKey: 'photos' },
  ],
  hso_checklists: [
    { table: 'hso_equipment_checks', fkColumn: 'checklist_id', arrayKey: 'equipment_checks' },
  ],
  checkout_checklists: [
    { table: 'checkout_items', fkColumn: 'checklist_id', arrayKey: 'items' },
  ],
  food_inventories: [
    { table: 'food_inventory_items', fkColumn: 'inventory_id', arrayKey: 'items' },
  ],
};

// Envelope columns (not role-specific data)
const ENVELOPE_COLUMNS = new Set([
  'id', 'crew_number', 'position', 'prepared_by', 'report_prepared_by',
  'report_date', 'sol', 'email_subject', 'email_body', 'created_at',
]);

function sqliteAll(db: sqlite3.Database, sql: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as Record<string, unknown>[]);
    });
  });
}

function tableExists(db: sqlite3.Database, table: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
      [table],
      (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      }
    );
  });
}

async function migrateTable(
  sqliteDb: sqlite3.Database,
  pgPool: Pool,
  parentTable: string,
  reportType: string
): Promise<number> {
  const exists = await tableExists(sqliteDb, parentTable);
  if (!exists) {
    console.log(`  Skipping ${parentTable} (table not found)`);
    return 0;
  }

  const rows = await sqliteAll(sqliteDb, `SELECT * FROM ${parentTable}`);
  if (rows.length === 0) {
    console.log(`  ${parentTable}: 0 rows`);
    return 0;
  }

  const childConfigs = CHILD_TABLES[parentTable] || [];
  let migrated = 0;

  for (const row of rows) {
    const reportData: Record<string, unknown> = {};

    // Separate envelope fields from role-specific data
    for (const [key, value] of Object.entries(row)) {
      if (!ENVELOPE_COLUMNS.has(key)) {
        reportData[key] = value;
      }
    }

    // Load child table data into report_data
    for (const child of childConfigs) {
      const childExists = await tableExists(sqliteDb, child.table);
      if (childExists) {
        const childRows = await sqliteAll(
          sqliteDb,
          `SELECT * FROM ${child.table} WHERE ${child.fkColumn} = ?`,
          [row.id]
        );
        // Remove FK column from child rows
        reportData[child.arrayKey] = childRows.map(cr => {
          const { [child.fkColumn]: _fk, id: _id, ...rest } = cr;
          return rest;
        });
      }
    }

    const author = (row.prepared_by || row.report_prepared_by || '') as string;
    const crewNumber = (row.crew_number || '') as string;
    const reportDate = (row.report_date || '') as string;
    const sol = row.sol as number | null;
    const position = (row.position || '') as string;
    const emailSubject = (row.email_subject || '') as string;
    const emailBody = (row.email_body || '') as string;
    const createdAt = (row.created_at || new Date().toISOString()) as string;

    await pgPool.query(
      `INSERT INTO reports (
        report_type, title, author, position, station, crew_number,
        report_date, sol, report_data, email_subject, email_body, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        reportType,
        `${reportType} report`,
        author,
        position,
        'MDRS',
        crewNumber,
        reportDate || new Date().toISOString().split('T')[0],
        sol,
        JSON.stringify(reportData),
        emailSubject,
        emailBody,
        createdAt,
      ]
    );
    migrated++;
  }

  console.log(`  ${parentTable}: ${migrated} rows migrated`);
  return migrated;
}

async function migrateLegacyTable(
  sqliteDb: sqlite3.Database,
  pgPool: Pool
): Promise<number> {
  const exists = await tableExists(sqliteDb, 'crew_reports');
  if (!exists) {
    console.log('  Skipping crew_reports (table not found)');
    return 0;
  }

  const rows = await sqliteAll(sqliteDb, 'SELECT * FROM crew_reports');
  if (rows.length === 0) {
    console.log('  crew_reports: 0 rows');
    return 0;
  }

  let migrated = 0;
  for (const row of rows) {
    await pgPool.query(
      `INSERT INTO reports (
        report_type, title, author, station, mission_name, crew_number,
        mission_type, mission_start_date, mission_duration_day,
        report_date, content, report_data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        (row.report_type || 'legacy') as string,
        (row.title || '') as string,
        (row.author || '') as string,
        (row.station || 'MDRS') as string,
        (row.mission_name || '') as string,
        (row.crew_number || '') as string,
        (row.mission_type || '') as string,
        row.mission_start_date || null,
        row.mission_duration_day || null,
        (row.report_date || new Date().toISOString().split('T')[0]) as string,
        (row.content || '') as string,
        JSON.stringify({}),
        row.created_at || new Date().toISOString(),
      ]
    );
    migrated++;
  }

  console.log(`  crew_reports (legacy): ${migrated} rows migrated`);
  return migrated;
}

async function main() {
  console.log(`SQLite source: ${SQLITE_PATH}`);
  console.log(`PostgreSQL target: ${PG_URL}`);
  console.log('');

  const sqliteDb = new sqlite3.Database(SQLITE_PATH);
  const pgPool = new Pool({ connectionString: PG_URL });

  let total = 0;

  try {
    // Migrate per-type tables
    for (const [table, reportType] of Object.entries(TABLE_MAP)) {
      total += await migrateTable(sqliteDb, pgPool, table, reportType);
    }

    // Migrate legacy crew_reports table
    total += await migrateLegacyTable(sqliteDb, pgPool);

    console.log(`\nMigration complete: ${total} total rows migrated`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await pgPool.end();
  }
}

main();
