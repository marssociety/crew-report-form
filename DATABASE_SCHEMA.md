# The Mars Society Crew Reports System — Unified PostgreSQL Schema

**Created:** 2026-03-03
**Status:** Draft for review

---

## Overview

All report types stored in a single `reports` table with JSONB for role-specific data.
Crew metadata, members, and roles are normalized into separate tables with a junction for assignments.

### Design Decisions

- `crew_number` is **TEXT** everywhere — accommodates identifiers like "212A", "212B"
- `crew_rotation_order` (future) will provide canonical chronological sort order
- Ingestion tables (`processing_queue`, `source_dedup`) live in import tooling, not this schema
- Full-text search via `tsvector` with weighted fields (title > author > content > mission)
- `updated_at` auto-trigger on all mutable tables
- UUIDs for report PKs, serial integers for reference tables

### Tables

| Table | Purpose |
|---|---|
| `reports` | All crew reports (daily, mission plan, summary, etc.) |
| `crews` | Crew metadata, dates, patch image |
| `crew_members` | Individual people (deduplicated across crews) |
| `roles` | MDRS role lookup (Commander, Engineer, etc.) |
| `crew_assignments` | Junction: crew + member + role |
| `equipment` | Equipment/vehicle registry |
| `report_equipment` | Junction: report + equipment |

### Views

| View | Purpose |
|---|---|
| `crew_rosters` | Crew → members with roles |
| `crew_member_history` | Member → all crews with roles |
| `archive_stats` | Aggregate statistics (materialized) |

---

## Schema

### Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- trigram text similarity
```

---

### 1. Reports

```sql
CREATE TABLE IF NOT EXISTS reports (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type           TEXT NOT NULL,
    title                 TEXT,
    author                TEXT,
    position              TEXT,                -- author's crew role for this report
    station               TEXT DEFAULT 'MDRS',
    mission_name          TEXT,
    crew_number           TEXT NOT NULL,
    crew_id               INTEGER,             -- FK to crews(id)
    mission_type          TEXT,
    mission_start_date    DATE,
    mission_duration_day  INTEGER,
    report_date           DATE NOT NULL,
    sol                   INTEGER,
    content               TEXT,                -- plain-text report body
    report_data           JSONB NOT NULL DEFAULT '{}',  -- role-specific structured data
    email_subject         TEXT,                -- original email subject (MBOX source)
    email_body            TEXT,                -- original email body (MBOX source)
    search_vector         TSVECTOR,            -- auto-populated full-text search
    created_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_crew_number ON reports(crew_number);
CREATE INDEX IF NOT EXISTS idx_reports_report_date ON reports(report_date);
CREATE INDEX IF NOT EXISTS idx_reports_type_crew   ON reports(report_type, crew_number);
CREATE INDEX IF NOT EXISTS idx_reports_data        ON reports USING GIN (report_data);
CREATE INDEX IF NOT EXISTS idx_reports_station     ON reports(station);
CREATE INDEX IF NOT EXISTS idx_reports_author      ON reports(author);
CREATE INDEX IF NOT EXISTS idx_reports_search      ON reports USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_reports_crew_id     ON reports(crew_id);

-- Lightweight dedup: prevent exact duplicate imports
CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_dedup
    ON reports(report_type, crew_number, report_date, sol)
    WHERE sol IS NOT NULL;
```

---

### 2. Crews

```sql
CREATE TABLE IF NOT EXISTS crews (
    id                        SERIAL PRIMARY KEY,
    crew_number               TEXT UNIQUE NOT NULL,    -- "197", "212A", "212B"
    crew_rotation_order       INTEGER,                 -- future: canonical chronological order
    crew_name                 VARCHAR(255),
    start_date                DATE,
    end_date                  DATE,
    patch_url                 TEXT,
    mission_plan_report_id    UUID,                    -- FK to reports(id)
    mission_summary_report_id UUID,                    -- FK to reports(id)
    created_at                TIMESTAMPTZ DEFAULT NOW(),
    updated_at                TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crews_number   ON crews(crew_number);
CREATE INDEX IF NOT EXISTS idx_crews_dates    ON crews(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_crews_rotation ON crews(crew_rotation_order);
```

---

### 3. Crew Members

```sql
CREATE TABLE IF NOT EXISTS crew_members (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255),           -- lowercased, stripped for dedup
    email           VARCHAR(255),
    bio             TEXT,
    affiliation     VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_members_name       ON crew_members(name);
CREATE INDEX IF NOT EXISTS idx_crew_members_normalized  ON crew_members(normalized_name);
CREATE INDEX IF NOT EXISTS idx_crew_members_email       ON crew_members(email);
```

---

### 4. Roles (lookup)

```sql
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
```

---

### 5. Crew Assignments (many-to-many junction)

```sql
CREATE TABLE IF NOT EXISTS crew_assignments (
    id             SERIAL PRIMARY KEY,
    crew_id        INTEGER NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
    crew_member_id INTEGER NOT NULL REFERENCES crew_members(id) ON DELETE CASCADE,
    role_id        INTEGER NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crew_id, crew_member_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_assignments_crew   ON crew_assignments(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_member ON crew_assignments(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_crew_assignments_role   ON crew_assignments(role_id);
```

---

### 6. Equipment

```sql
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

CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(equipment_type);
```

---

### 7. Report–Equipment Junction

```sql
CREATE TABLE IF NOT EXISTS report_equipment (
    report_id    UUID    NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    PRIMARY KEY (report_id, equipment_id)
);
```

---

### 8. Foreign Keys (deferred to avoid circular dependencies)

```sql
-- reports → crews
ALTER TABLE reports
    ADD CONSTRAINT fk_reports_crew
    FOREIGN KEY (crew_id) REFERENCES crews(id);

-- crews → reports (mission plan and summary)
ALTER TABLE crews
    ADD CONSTRAINT fk_crews_mission_plan
    FOREIGN KEY (mission_plan_report_id) REFERENCES reports(id) ON DELETE SET NULL;

ALTER TABLE crews
    ADD CONSTRAINT fk_crews_mission_summary
    FOREIGN KEY (mission_summary_report_id) REFERENCES reports(id) ON DELETE SET NULL;
```

---

### 9. Triggers

#### Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to: reports, crews, crew_members, equipment
CREATE TRIGGER set_updated_at_reports
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_crews
    BEFORE UPDATE ON crews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_crew_members
    BEFORE UPDATE ON crew_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_equipment
    BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Full-text search vector

Weighted: title (A) > author (B) > content (C) > mission_name (D)

```sql
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

CREATE TRIGGER trg_update_search_vector
    BEFORE INSERT OR UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_search_vector();
```

---

### 10. Views

#### Crew Rosters

```sql
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
```

#### Crew Member History

```sql
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
```

#### Archive Stats (materialized)

```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS archive_stats AS
SELECT
    count(*)                       AS total_reports,
    count(DISTINCT crew_number)    AS total_crews,
    count(DISTINCT station)        AS total_stations,
    count(DISTINCT report_type)    AS total_report_types,
    min(report_date)               AS earliest_report,
    max(report_date)               AS latest_report
FROM reports;

CREATE UNIQUE INDEX IF NOT EXISTS idx_archive_stats ON archive_stats USING btree ((1));

-- Call periodically to refresh cached stats
CREATE OR REPLACE FUNCTION refresh_archive_stats()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY archive_stats;
END;
$$;
```

---

## Example Queries

**Full-text search:**
```sql
SELECT id, title, author, report_date,
       ts_rank(search_vector, query) AS rank
FROM reports, plainto_tsquery('english', 'water reclamation') AS query
WHERE search_vector @@ query
ORDER BY rank DESC
LIMIT 20;
```

**All members and roles for a crew:**
```sql
SELECT cm.name, r.name AS role
FROM crew_members cm
JOIN crew_assignments ca ON cm.id = ca.crew_member_id
JOIN roles r ON ca.role_id = r.id
WHERE ca.crew_id = (SELECT id FROM crews WHERE crew_number = '197');
```

**All crews a person served on:**
```sql
SELECT c.crew_number, c.crew_name, r.name AS role, c.start_date
FROM crews c
JOIN crew_assignments ca ON c.id = ca.crew_id
JOIN roles r ON ca.role_id = r.id
WHERE ca.crew_member_id = (SELECT id FROM crew_members WHERE normalized_name = 'jane doe')
ORDER BY c.start_date DESC;
```

**Reports for a crew, by type:**
```sql
SELECT id, title, report_type, report_date, sol
FROM reports
WHERE crew_number = '197'
ORDER BY report_date, sol;
```

**Refresh stats after bulk import:**
```sql
SELECT refresh_archive_stats();
```
