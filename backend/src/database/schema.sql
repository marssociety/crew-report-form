-- Crew Reports - Unified PostgreSQL Schema
-- All report types stored in a single table with JSONB for role-specific data

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS reports (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type          TEXT NOT NULL,
  title                TEXT,
  author               TEXT,
  position             TEXT,
  station              TEXT DEFAULT 'MDRS',
  mission_name         TEXT,
  crew_number          TEXT NOT NULL,
  mission_type         TEXT,
  mission_start_date   DATE,
  mission_duration_day INTEGER,
  report_date          DATE NOT NULL,
  sol                  INTEGER,
  content              TEXT,
  report_data          JSONB NOT NULL DEFAULT '{}',
  email_subject        TEXT,
  email_body           TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_crew_number ON reports(crew_number);
CREATE INDEX IF NOT EXISTS idx_reports_report_date ON reports(report_date);
CREATE INDEX IF NOT EXISTS idx_reports_type_crew ON reports(report_type, crew_number);
CREATE INDEX IF NOT EXISTS idx_reports_data ON reports USING GIN (report_data);

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at'
  ) THEN
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON reports
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;
