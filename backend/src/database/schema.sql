-- Mars Society Crew Reports — Unified PostgreSQL Schema
-- All report types in a single table with JSONB for role-specific data.
-- Crew metadata, members, and roles normalized into separate tables.

-- =============================================================================
-- Extensions
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- trigram text similarity

-- =============================================================================
-- 1. Reports
-- =============================================================================

CREATE TABLE IF NOT EXISTS reports (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type           TEXT NOT NULL,
    title                 TEXT,
    author                TEXT,
    position              TEXT,
    station               TEXT DEFAULT 'MDRS',
    mission_name          TEXT,
    crew_number           TEXT NOT NULL,
    mission_type          TEXT,
    mission_start_date    DATE,
    mission_duration_day  INTEGER,
    report_date           DATE NOT NULL,
    sol                   INTEGER,
    content               TEXT,
    report_data           JSONB NOT NULL DEFAULT '{}',
    email_subject         TEXT,
    email_body            TEXT,
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. Crews
-- =============================================================================

CREATE TABLE IF NOT EXISTS crews (
    id                        SERIAL PRIMARY KEY,
    crew_number               TEXT UNIQUE NOT NULL,
    crew_rotation_order       INTEGER,
    crew_name                 VARCHAR(255),
    start_date                DATE,
    end_date                  DATE,
    patch_url                 TEXT,
    mission_plan_report_id    UUID,
    mission_summary_report_id UUID,
    created_at                TIMESTAMPTZ DEFAULT NOW(),
    updated_at                TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. Crew Members
-- =============================================================================

CREATE TABLE IF NOT EXISTS crew_members (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255),
    email           VARCHAR(255),
    bio             TEXT,
    affiliation     VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. Roles (lookup)
-- =============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Seed standard MDRS roles (only if table is empty)
INSERT INTO roles (name, description)
SELECT * FROM (VALUES
    ('Commander',              'Mission commander and primary decision maker'),
    ('Executive Officer',      'Second in command, assists commander'),
    ('Engineer',               'Maintains habitat systems and infrastructure'),
    ('GreenHab Officer',       'Manages greenhouse and plant experiments'),
    ('Health & Safety Officer', 'Monitors crew health and safety protocols'),
    ('Crew Scientist',         'Conducts scientific research and experiments'),
    ('Crew Geologist',         'Conducts geological field work and analysis'),
    ('Crew Astronomer',        'Manages astronomical observations and equipment'),
    ('Crew Journalist',        'Documents mission through writing and media'),
    ('Crew Artist',            'Creates artistic documentation of the mission')
) AS new_roles(name, description)
WHERE NOT EXISTS (SELECT 1 FROM roles LIMIT 1);

-- =============================================================================
-- 5. Crew Assignments (many-to-many junction)
-- =============================================================================

CREATE TABLE IF NOT EXISTS crew_assignments (
    id             SERIAL PRIMARY KEY,
    crew_id        INTEGER NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
    crew_member_id INTEGER NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    role_id        INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crew_id, crew_member_id)
);

-- =============================================================================
-- 6. Equipment
-- =============================================================================

CREATE TABLE IF NOT EXISTS equipment (
    id             SERIAL PRIMARY KEY,
    equipment_id   VARCHAR(100) UNIQUE,
    equipment_type VARCHAR(100),
    equipment_name VARCHAR(255),
    description    TEXT,
    first_used     DATE,
    last_used      DATE,
    usage_count    INTEGER DEFAULT 0,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. Report–Equipment Junction
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_equipment (
    report_id    UUID    NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (report_id, equipment_id)
);

-- =============================================================================
-- 8. Report Assets
-- =============================================================================

CREATE TABLE IF NOT EXISTS report_assets (
    id              SERIAL PRIMARY KEY,
    report_id       UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    asset_type      TEXT NOT NULL,          -- 'image', 'document', 'spreadsheet'
    original_filename TEXT,
    caption         TEXT,
    source_url      TEXT,                   -- original URL or archive file path
    storage_url     TEXT,                   -- permanent cloud storage URL (NULL until uploaded)
    storage_bucket  TEXT,
    mime_type       TEXT,
    file_size_bytes BIGINT,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. ALTER reports — add new columns (safe for existing data)
-- =============================================================================

ALTER TABLE reports ADD COLUMN IF NOT EXISTS crew_id INTEGER;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS search_vector TSVECTOR;

-- Ingestion pipeline columns
ALTER TABLE reports ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS import_batch TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS source_id TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT FALSE;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS review_notes TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS field_season TEXT;
ALTER TABLE reports ADD COLUMN IF NOT EXISTS source_metadata JSONB DEFAULT '{}';

-- =============================================================================
-- 10. Foreign Keys (deferred to avoid circular dependencies)
-- =============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_reports_crew'
    ) THEN
        ALTER TABLE reports
            ADD CONSTRAINT fk_reports_crew
            FOREIGN KEY (crew_id) REFERENCES crews(id);
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_crews_mission_plan'
    ) THEN
        ALTER TABLE crews
            ADD CONSTRAINT fk_crews_mission_plan
            FOREIGN KEY (mission_plan_report_id) REFERENCES reports(id) ON DELETE SET NULL;
    END IF;
END;
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_crews_mission_summary'
    ) THEN
        ALTER TABLE crews
            ADD CONSTRAINT fk_crews_mission_summary
            FOREIGN KEY (mission_summary_report_id) REFERENCES reports(id) ON DELETE SET NULL;
    END IF;
END;
$$;

-- =============================================================================
-- 11. Indexes
-- =============================================================================

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_crew_number ON reports(crew_number);
CREATE INDEX IF NOT EXISTS idx_reports_report_date ON reports(report_date);
CREATE INDEX IF NOT EXISTS idx_reports_type_crew   ON reports(report_type, crew_number);
CREATE INDEX IF NOT EXISTS idx_reports_data        ON reports USING GIN (report_data);
CREATE INDEX IF NOT EXISTS idx_reports_station     ON reports(station);
CREATE INDEX IF NOT EXISTS idx_reports_author      ON reports(author);
CREATE INDEX IF NOT EXISTS idx_reports_search      ON reports USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_reports_crew_id     ON reports(crew_id);

-- Ingestion pipeline indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_content_hash ON reports(content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_source        ON reports(source);
CREATE INDEX IF NOT EXISTS idx_reports_import_batch  ON reports(import_batch);
CREATE INDEX IF NOT EXISTS idx_reports_source_id     ON reports(source_id);
CREATE INDEX IF NOT EXISTS idx_reports_needs_review  ON reports(needs_review) WHERE needs_review = TRUE;
CREATE INDEX IF NOT EXISTS idx_reports_field_season   ON reports(field_season);

-- Dedup index — prevent exact duplicate imports (wrapped in exception handler)
DO $$
BEGIN
    CREATE UNIQUE INDEX idx_reports_dedup
        ON reports(report_type, crew_number, report_date, sol)
        WHERE sol IS NOT NULL;
EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN others THEN
        RAISE NOTICE 'Could not create dedup index (possible duplicate data): %', SQLERRM;
END;
$$;

-- Dedup index for NULL sol
DO $$
BEGIN
    CREATE UNIQUE INDEX idx_reports_dedup_no_sol
        ON reports(report_type, crew_number, report_date)
        WHERE sol IS NULL AND crew_number IS NOT NULL;
EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN others THEN
        RAISE NOTICE 'Could not create dedup_no_sol index (possible duplicate data): %', SQLERRM;
END;
$$;

-- Report assets indexes
CREATE INDEX IF NOT EXISTS idx_report_assets_report  ON report_assets(report_id);
CREATE INDEX IF NOT EXISTS idx_report_assets_type    ON report_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_report_assets_storage ON report_assets(storage_url) WHERE storage_url IS NULL;

-- Crews indexes
CREATE INDEX IF NOT EXISTS idx_crews_number   ON crews(crew_number);
CREATE INDEX IF NOT EXISTS idx_crews_dates    ON crews(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_crews_rotation ON crews(crew_rotation_order);

-- Crew members indexes
CREATE INDEX IF NOT EXISTS idx_crew_members_name       ON crew_members(name);
CREATE INDEX IF NOT EXISTS idx_crew_members_normalized  ON crew_members(normalized_name);
CREATE INDEX IF NOT EXISTS idx_crew_members_email       ON crew_members(email);

-- Crew assignments indexes
CREATE INDEX IF NOT EXISTS idx_crew_assignments_crew   ON crew_assignments(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_member ON crew_assignments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_role   ON crew_assignments(role_id);

-- Equipment indexes
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(equipment_type);

-- =============================================================================
-- 12. Triggers
-- =============================================================================

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
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_reports') THEN
        CREATE TRIGGER set_updated_at_reports
            BEFORE UPDATE ON reports
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_crews') THEN
        CREATE TRIGGER set_updated_at_crews
            BEFORE UPDATE ON crews
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_crew_members') THEN
        CREATE TRIGGER set_updated_at_crew_members
            BEFORE UPDATE ON crew_members
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_equipment') THEN
        CREATE TRIGGER set_updated_at_equipment
            BEFORE UPDATE ON equipment
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_report_assets') THEN
        CREATE TRIGGER set_updated_at_report_assets
            BEFORE UPDATE ON report_assets
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END;
$$;

-- Full-text search vector (weighted: title A > author B > content C > mission_name D)
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.author, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.mission_name, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_search_vector') THEN
        CREATE TRIGGER trg_update_search_vector
            BEFORE INSERT OR UPDATE ON reports
            FOR EACH ROW EXECUTE FUNCTION update_search_vector();
    END IF;
END;
$$;

-- =============================================================================
-- 13. Views
-- =============================================================================

-- Crew Rosters
CREATE OR REPLACE VIEW crew_rosters AS
SELECT
    c.id          AS crew_id,
    c.crew_number,
    c.crew_name,
    c.start_date,
    c.end_date,
    cm.id         AS crew_member_id,
    cm.name       AS member_name,
    cm.email      AS member_email,
    cm.affiliation AS member_affiliation,
    r.name        AS role_name,
    r.description AS role_description
FROM crews c
JOIN crew_assignments ca ON c.id = ca.crew_id
JOIN crew_members cm     ON ca.crew_member_id = cm.id
JOIN roles r             ON ca.role_id = r.id
ORDER BY c.crew_number, r.name;

-- Crew Member History
CREATE OR REPLACE VIEW crew_member_history AS
SELECT
    cm.id          AS crew_member_id,
    cm.name        AS member_name,
    cm.email,
    cm.affiliation,
    c.id           AS crew_id,
    c.crew_number,
    c.crew_name,
    c.start_date,
    c.end_date,
    r.name         AS role_name,
    r.description  AS role_description
FROM crew_members cm
JOIN crew_assignments ca ON cm.id = ca.crew_member_id
JOIN crews c             ON ca.crew_id = c.id
JOIN roles r             ON ca.role_id = r.id
ORDER BY cm.name, c.start_date DESC;

-- Archive Stats (materialized)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_matviews WHERE matviewname = 'archive_stats'
    ) THEN
        CREATE MATERIALIZED VIEW archive_stats AS
        SELECT
            count(*)                       AS total_reports,
            count(DISTINCT crew_number)    AS total_crews,
            count(DISTINCT station)        AS total_stations,
            count(DISTINCT report_type)    AS total_report_types,
            min(report_date)               AS earliest_report,
            max(report_date)               AS latest_report
        FROM reports;
    END IF;
END;
$$;

DO $$
BEGIN
    CREATE UNIQUE INDEX idx_archive_stats ON archive_stats USING btree ((1));
EXCEPTION
    WHEN duplicate_table THEN NULL;
END;
$$;

-- Refresh function for archive stats
CREATE OR REPLACE FUNCTION refresh_archive_stats()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY archive_stats;
END;
$$;
