-- Mars Society Crew Report Database Schema
-- This schema matches the JSON crew report template structure exactly
-- Reference: https://github.com/marssociety/crew-report-template/blob/main/crew_report_template_strict.json

-- Main crew reports table - matches top-level JSON properties
CREATE TABLE IF NOT EXISTS crew_reports (
    report_id TEXT PRIMARY KEY,
    report_uuid TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    publish_date TEXT NOT NULL,
    author TEXT NOT NULL,
    station TEXT NOT NULL,
    mission_name TEXT NOT NULL,
    crew_number TEXT NOT NULL,
    mission_type TEXT NOT NULL,
    mission_start_date TEXT NOT NULL,
    mission_duration_day INTEGER NOT NULL,
    report_date TEXT NOT NULL,
    report_type TEXT NOT NULL,
    content TEXT,
    objectives TEXT,
    outcomes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories and tags (many-to-many)
CREATE TABLE IF NOT EXISTS report_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    category TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE,
    UNIQUE(report_id, category)
);

CREATE TABLE IF NOT EXISTS report_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE,
    UNIQUE(report_id, tag)
);

-- Crew members table - from crew_members array
CREATE TABLE IF NOT EXISTS crew_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    affiliation TEXT,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Equipment assigned to crew members (many-to-many)
CREATE TABLE IF NOT EXISTS crew_equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    crew_member_id INTEGER NOT NULL,
    equipment_id TEXT NOT NULL,
    equipment_type TEXT NOT NULL,
    equipment_name TEXT NOT NULL,
    notes TEXT,
    FOREIGN KEY (crew_member_id) REFERENCES crew_members(id) ON DELETE CASCADE
);

-- EVA planned waypoints
CREATE TABLE IF NOT EXISTS eva_planned_waypoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    waypoint_id TEXT NOT NULL,
    name TEXT NOT NULL,
    utm_zone TEXT,
    utm_easting INTEGER,
    utm_northing INTEGER,
    elevation_m REAL,
    estimated_duration_minutes INTEGER,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Planned waypoint activities
CREATE TABLE IF NOT EXISTS eva_planned_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waypoint_id INTEGER NOT NULL,
    activity TEXT NOT NULL,
    FOREIGN KEY (waypoint_id) REFERENCES eva_planned_waypoints(id) ON DELETE CASCADE
);

-- Planned waypoint assigned crew
CREATE TABLE IF NOT EXISTS eva_planned_crew (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waypoint_id INTEGER NOT NULL,
    crew_member_name TEXT NOT NULL,
    FOREIGN KEY (waypoint_id) REFERENCES eva_planned_waypoints(id) ON DELETE CASCADE
);

-- EVA actual waypoints
CREATE TABLE IF NOT EXISTS eva_actual_waypoints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    waypoint_id TEXT NOT NULL,
    name TEXT NOT NULL,
    utm_zone TEXT,
    utm_easting INTEGER,
    utm_northing INTEGER,
    elevation_m REAL,
    duration_minutes INTEGER,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Actual waypoint activities completed
CREATE TABLE IF NOT EXISTS eva_activities_completed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waypoint_id INTEGER NOT NULL,
    activity_type TEXT NOT NULL,
    method TEXT,
    collection_type TEXT,
    desired_result TEXT,
    actual_result TEXT,
    notes TEXT,
    crew_member TEXT,
    FOREIGN KEY (waypoint_id) REFERENCES eva_actual_waypoints(id) ON DELETE CASCADE
);

-- Actual waypoint observations
CREATE TABLE IF NOT EXISTS eva_observations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waypoint_id INTEGER NOT NULL,
    observation_type TEXT NOT NULL,
    description TEXT NOT NULL,
    obs_utm_zone TEXT,
    obs_utm_easting INTEGER,
    obs_utm_northing INTEGER,
    observer TEXT,
    FOREIGN KEY (waypoint_id) REFERENCES eva_actual_waypoints(id) ON DELETE CASCADE
);

-- Actual waypoint crew present
CREATE TABLE IF NOT EXISTS eva_actual_crew (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    waypoint_id INTEGER NOT NULL,
    crew_member_name TEXT NOT NULL,
    FOREIGN KEY (waypoint_id) REFERENCES eva_actual_waypoints(id) ON DELETE CASCADE
);

-- Resource usage table - from resource_usage object
CREATE TABLE IF NOT EXISTS resource_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL UNIQUE,
    water_consumed_liters REAL,
    power_used_kwh REAL,
    food_stocks_remaining_percent REAL,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Environmental data table - from environmental_data object
CREATE TABLE IF NOT EXISTS environmental_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL UNIQUE,
    temperature_c REAL,
    humidity_percent REAL,
    pressure_kpa REAL,
    wind_speed_kph REAL,
    notes TEXT,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Health and safety incidents - from health_and_safety.incidents array
CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    incident_type TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL,
    resolution TEXT,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Health and safety summary - from health_and_safety object
CREATE TABLE IF NOT EXISTS health_and_safety_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL UNIQUE,
    morale_level TEXT,
    medical_notes TEXT,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Metadata attachments - from metadata.attachments array
CREATE TABLE IF NOT EXISTS report_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    attachment_filename TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- Custom metadata - from metadata.custom object (flexible JSON storage)
CREATE TABLE IF NOT EXISTS report_custom_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL UNIQUE,
    custom_data TEXT,
    FOREIGN KEY (report_id) REFERENCES crew_reports(report_id) ON DELETE CASCADE
);

-- GreenHab reports table (separate from main crew reports)
CREATE TABLE IF NOT EXISTS greenhab_reports (
    id TEXT PRIMARY KEY,
    crew_number TEXT NOT NULL,
    position TEXT NOT NULL,
    report_prepared_by TEXT NOT NULL,
    report_date TEXT NOT NULL,
    sol INTEGER NOT NULL,
    environmental_control TEXT NOT NULL,
    avg_temperature TEXT NOT NULL,
    max_temperature TEXT NOT NULL,
    min_temperature TEXT NOT NULL,
    supplemental_light_hours REAL NOT NULL,
    daily_water_usage_crops TEXT NOT NULL,
    daily_water_usage_other TEXT,
    blue_tank_remaining REAL NOT NULL,
    crops_changes TEXT,
    narrative TEXT NOT NULL,
    support_needed TEXT,
    attached_pictures INTEGER DEFAULT 0,
    email_subject TEXT,
    email_body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- GreenHab watering times
CREATE TABLE IF NOT EXISTS greenhab_watering_times (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    watering_time TEXT NOT NULL,
    FOREIGN KEY (report_id) REFERENCES greenhab_reports(id) ON DELETE CASCADE
);

-- GreenHab harvest data
CREATE TABLE IF NOT EXISTS greenhab_harvests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    mass_grams REAL NOT NULL,
    FOREIGN KEY (report_id) REFERENCES greenhab_reports(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crew_reports_report_date ON crew_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_crew_reports_station ON crew_reports(station);
CREATE INDEX IF NOT EXISTS idx_crew_reports_crew_number ON crew_reports(crew_number);
CREATE INDEX IF NOT EXISTS idx_crew_reports_mission_type ON crew_reports(mission_type);
CREATE INDEX IF NOT EXISTS idx_crew_reports_report_type ON crew_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_crew_members_report_id ON crew_members(report_id);
CREATE INDEX IF NOT EXISTS idx_crew_equipment_crew_member_id ON crew_equipment(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_eva_planned_waypoints_report_id ON eva_planned_waypoints(report_id);
CREATE INDEX IF NOT EXISTS idx_eva_actual_waypoints_report_id ON eva_actual_waypoints(report_id);
CREATE INDEX IF NOT EXISTS idx_incidents_report_id ON incidents(report_id);
CREATE INDEX IF NOT EXISTS idx_resource_usage_report_id ON resource_usage(report_id);
CREATE INDEX IF NOT EXISTS idx_environmental_data_report_id ON environmental_data(report_id);
CREATE INDEX IF NOT EXISTS idx_report_categories_report_id ON report_categories(report_id);
CREATE INDEX IF NOT EXISTS idx_report_tags_report_id ON report_tags(report_id);
CREATE INDEX IF NOT EXISTS idx_greenhab_reports_date ON greenhab_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_greenhab_reports_crew_number ON greenhab_reports(crew_number);